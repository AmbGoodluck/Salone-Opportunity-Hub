import * as cheerio from 'cheerio'
import type { Database } from '@/types/supabase'

type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert']

async function fetchHtml(url: string): Promise<string> {
  const apiKey = process.env.SCRAPER_API_KEY
  const scraperUrl = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`
  const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`ScraperAPI ${response.status} for ${url}`)
  return response.text()
}

function parseDeadline(text: string): string | null {
  const patterns = [
    /deadline[:\s]+([A-Za-z]+ \d{1,2},? \d{4})/i,
    /closing date[:\s]+([A-Za-z]+ \d{1,2},? \d{4})/i,
    /apply by[:\s]+([A-Za-z]+ \d{1,2},? \d{4})/i,
    /due[:\s]+([A-Za-z]+ \d{1,2},? \d{4})/i,
    /(\d{1,2} [A-Za-z]+ \d{4})/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const date = new Date(match[1])
      if (!isNaN(date.getTime())) return date.toISOString()
    }
  }
  return null
}

function classifyType(title: string, description: string): OpportunityInsert['type'] {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('scholarship') || text.includes('fellowship') || text.includes('bursary')) return 'scholarship'
  if (text.includes('grant') || text.includes('funding opportunity') || text.includes('funding for')) return 'grant'
  if (text.includes('internship') || text.includes('intern ')) return 'internship'
  if (text.includes('conference') || text.includes('summit') || text.includes('workshop') || text.includes('webinar')) return 'event'
  return 'job'
}

// Countries/nationalities that exclude Sierra Leoneans
const EXCLUSIVE_COUNTRY_PATTERNS = [
  /\bfor (nigerian|kenyan|ghanaian|south african|ethiopian|tanzanian|ugandan|rwandan|indian|chinese|american|canadian|australian|british|european) (citizen|national|student|resident)s?\b/i,
  /\b(only open to|exclusively for|restricted to|limited to) .*(nigeria|kenya|ghana|south africa|ethiopia|tanzania|uganda|rwanda|india|china|usa|us citizens|uk citizens|canada|australia)/i,
  /\b(nigerian?|kenyan?|ghanaian?|south african|ethiopian?|tanzanian?|ugandan?|rwandan?) (only|nationals only|citizens only)\b/i,
]

function checkSLEligibility(title: string, description: string): boolean {
  const text = `${title} ${description}`
  // If explicitly mentions Sierra Leone, definitely eligible
  if (/sierra leone/i.test(text)) return true
  // If mentions "african", "west africa", "developing countries", "global", "international" - eligible
  if (/\b(africa|african|west africa|developing countr|global|international|worldwide|all countries)\b/i.test(text)) return true
  // Check for exclusive country restrictions
  for (const pattern of EXCLUSIVE_COUNTRY_PATTERNS) {
    if (pattern.test(text)) return false
  }
  // Default: eligible (benefit of the doubt)
  return true
}

interface AdzunaJob {
  id: string
  title: string
  description: string
  redirect_url: string
  company: { display_name: string }
  location: { display_name: string }
  category: { label: string }
  created: string
  contract_type?: string
}

interface AdzunaResponse {
  results: AdzunaJob[]
  count: number
}

export class OpportunityScraper {
  async scrapeOpportunityDesk(): Promise<OpportunityInsert[]> {
    const opportunities: OpportunityInsert[] = []
    const urls = [
      'https://opportunitydesk.org/scholarships',
      'https://opportunitydesk.org/category/scholarships/',
      'https://opportunitydesk.org/category/fellowships-and-scholarships/',
      'https://opportunitydesk.org/internships',
      'https://opportunitydesk.org/grants',
      'https://opportunitydesk.org/category/grants-funding/',
      'https://opportunitydesk.org/category/internships-placements/',
    ]

    for (const url of urls) {
      try {
        const html = await fetchHtml(url)
        const $ = cheerio.load(html)

        $('article').each((_i, elem) => {
          const titleEl = $(elem).find('h2, h3').first()
          const title = titleEl.text().trim()
          const link = titleEl.find('a').attr('href') || $(elem).find('a').first().attr('href') || ''
          const excerpt = $(elem).find('.entry-summary, p').first().text().trim()

          if (!title || !link) return

          opportunities.push({
            title: title.slice(0, 255),
            organization: 'Various',
            description: excerpt || title,
            type: classifyType(title, excerpt),
            category: 'Education',
            application_link: link,
            source_url: url,
            is_verified: false,
            sl_eligible: checkSLEligibility(title, excerpt),
          })
        })
      } catch (err) {
        console.error(`Failed to scrape ${url}:`, err)
      }
    }

    return opportunities
  }

  async fetchAdzunaJobs(): Promise<OpportunityInsert[]> {
    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY

    if (!appId || !appKey) {
      console.warn('Adzuna credentials not set - skipping')
      return []
    }

    const opportunities: OpportunityInsert[] = []

    // Search terms relevant to Sierra Leone youth
    const searches = [
      // UK searches
      { country: 'gb', what: 'Sierra Leone', what_or: 'africa development NGO' },
      { country: 'gb', what: 'internship africa', what_or: 'scholarship fellowship' },
      { country: 'gb', what: 'grant funding africa', what_or: 'internship program' },
      { country: 'gb', what: 'graduate program africa', what_or: 'funding opportunity' },
      { country: 'gb', what: 'international development', what_or: 'fellowship africa' },
      // US searches
      { country: 'us', what: 'africa internship', what_or: 'fellowship program' },
      { country: 'us', what: 'international NGO', what_or: 'west africa development' },
      { country: 'us', what: 'grant program africa', what_or: 'youth scholarship' },
      { country: 'us', what: 'foreign affairs', what_or: 'international development africa' },
      { country: 'us', what: 'nonprofit africa', what_or: 'humanitarian internship' },
      // South Africa / Africa searches
      { country: 'za', what: 'west africa', what_or: 'NGO development' },
      { country: 'za', what: 'internship youth', what_or: 'grant fellowship' },
    ]

    for (const search of searches) {
      try {
        const params = new URLSearchParams({
          app_id: appId,
          app_key: appKey,
          results_per_page: '50',
          what: search.what,
          what_or: search.what_or,
          'content-type': 'application/json',
        })

        const url = `https://api.adzuna.com/v1/api/jobs/${search.country}/search/1?${params}`
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) })

        if (!res.ok) {
          console.error(`Adzuna ${search.country} error: ${res.status}`)
          continue
        }

        const data = (await res.json()) as AdzunaResponse

        for (const job of data.results ?? []) {
          const title = job.title?.trim()
          const link = job.redirect_url
          if (!title || !link) continue

          opportunities.push({
            title: title.slice(0, 255),
            organization: job.company?.display_name ?? 'Various',
            description: job.description?.slice(0, 1000) ?? title,
            type: classifyType(title, job.description ?? ''),
            category: job.category?.label ?? 'General',
            location: job.location?.display_name ?? null,
            application_link: link,
            source_url: `https://www.adzuna.com`,
            is_verified: true,
            sl_eligible: checkSLEligibility(title, job.description ?? ''),
          })
        }
      } catch (err) {
        console.error(`Adzuna fetch error:`, err)
      }
    }

    return opportunities
  }

  async scrapeRSSFeed(feedUrl: string): Promise<OpportunityInsert[]> {
    try {
      const { default: Parser } = await import('rss-parser')
      const parser = new Parser()
      const feed = await parser.parseURL(feedUrl)
      const opportunities: OpportunityInsert[] = []

      for (const item of feed.items ?? []) {
        const title = item.title?.trim() ?? ''
        const description = (item.contentSnippet ?? item.summary ?? '').trim()
        const link = item.link ?? ''

        if (!title || !link) continue

        opportunities.push({
          title: title.slice(0, 255),
          organization: feed.title ?? 'Various',
          description: description || title,
          type: classifyType(title, description),
          category: 'General',
          application_link: link,
          source_url: feedUrl,
          deadline: item.isoDate ? parseDeadline(description + ' ' + title) : null,
          is_verified: false,
          sl_eligible: checkSLEligibility(title, description),
        })
      }

      return opportunities
    } catch (err) {
      console.error(`Failed to parse RSS feed ${feedUrl}:`, err)
      return []
    }
  }

  async scrapeAll(): Promise<{ source: string; count: number; errors: string[] }[]> {
    const results: { source: string; count: number; errors: string[] }[] = []

    const sources = [
      { name: 'opportunity_desk', fn: () => this.scrapeOpportunityDesk() },
      { name: 'adzuna_api', fn: () => this.fetchAdzunaJobs() },
      { name: 'rss_devex', fn: () => this.scrapeRSSFeed('https://www.devex.com/jobs.rss') },
      { name: 'rss_idealist', fn: () => this.scrapeRSSFeed('https://idealist.org/feed.xml') },
      { name: 'rss_fundly', fn: () => this.scrapeRSSFeed('https://www.fundly.com/feed.xml') },
    ]

    for (const source of sources) {
      try {
        const opps = await source.fn()
        results.push({ source: source.name, count: opps.length, errors: [] })
      } catch (err) {
        results.push({ source: source.name, count: 0, errors: [String(err)] })
      }
    }

    return results
  }
}
