import axios from 'axios'
import * as cheerio from 'cheerio'
import type { Database } from '@/types/supabase'

type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert']

const USER_AGENT =
  'Mozilla/5.0 (compatible; SaloneOpportunityHub/1.0; +https://salone-opportunity-hub.com)'

async function fetchHtml(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 15000,
  })
  return response.data as string
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
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
  }
  return null
}

function classifyType(title: string, description: string): OpportunityInsert['type'] {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('scholarship') || text.includes('fellowship') || text.includes('bursary')) return 'scholarship'
  if (text.includes('internship') || text.includes('intern ')) return 'internship'
  if (text.includes('conference') || text.includes('summit') || text.includes('workshop') || text.includes('webinar')) return 'event'
  return 'job'
}

export class OpportunityScraper {
  async scrapeOpportunityDesk(): Promise<OpportunityInsert[]> {
    const opportunities: OpportunityInsert[] = []
    const urls = [
      'https://opportunitydesk.org/category/scholarships/',
      'https://opportunitydesk.org/category/fellowships-and-scholarships/',
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
          })
        })
      } catch (err) {
        console.error(`Failed to scrape ${url}:`, err)
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
      {
        name: 'rss_devex',
        fn: () => this.scrapeRSSFeed('https://devex.com/jobs/rss'),
      },
    ]

    for (const source of sources) {
      try {
        const opps = await source.fn()
        results.push({ source: source.name, count: opps.length, errors: [] })
      } catch (err) {
        results.push({
          source: source.name,
          count: 0,
          errors: [String(err)],
        })
      }
    }

    return results
  }
}
