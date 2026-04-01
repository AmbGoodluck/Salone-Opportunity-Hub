import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const seedOpportunities: Database['public']['Tables']['opportunities']['Insert'][] = [
  {
    title: 'Mastercard Foundation Scholars Program',
    organization: 'Mastercard Foundation',
    description:
      'The Mastercard Foundation Scholars Program transforms the lives of academically talented yet economically disadvantaged young Africans by providing them with access to quality university education. The program covers tuition, room, board, health insurance, travel, and leadership training.',
    requirements:
      'Must be a citizen of an African country. Demonstrate academic excellence and financial need. Show evidence of leadership potential and commitment to giving back to community.',
    how_to_apply:
      'Apply through one of the partner universities in Africa, North America, or Europe. Applications open annually — check partner university websites for specific dates.',
    type: 'scholarship',
    category: 'Education',
    location: 'Multiple African Universities',
    is_remote: false,
    deadline: '2026-06-30T23:59:59Z',
    funding_amount: 'Full tuition + stipend + accommodation + travel',
    study_level: 'Undergraduate',
    application_link: 'https://mastercardfdn.org/all/scholars/',
    is_verified: true,
  },
  {
    title: 'African Development Bank (AfDB) Internship Program',
    organization: 'African Development Bank',
    description:
      'The AfDB internship program offers young African students and recent graduates the opportunity to gain practical experience in an international development finance institution. Interns work alongside seasoned professionals on real projects that impact African development.',
    requirements:
      'Enrolled in a Masters or PhD program, or recently graduated (within 2 years). Strong academic record. Proficiency in English or French.',
    how_to_apply:
      'Submit your application through the AfDB careers portal. Include a CV, cover letter, and proof of enrollment or recent graduation.',
    type: 'internship',
    category: 'Finance',
    location: 'Abidjan, Côte d\'Ivoire (or Remote)',
    is_remote: false,
    deadline: '2026-03-31T23:59:59Z',
    funding_amount: 'Monthly stipend provided',
    study_level: 'Postgraduate',
    application_link: 'https://www.afdb.org/en/careers',
    is_verified: true,
  },
  {
    title: 'Google Generation Scholarship — Africa',
    organization: 'Google',
    description:
      'Google Generation Scholarship supports students in Sub-Saharan Africa who are studying computer science or a related field. Recipients receive a financial award and access to Google\'s mentorship program and networking opportunities.',
    requirements:
      'Currently enrolled in a Bachelor\'s or Master\'s program in Computer Science or related field at a university in Sub-Saharan Africa. Demonstrated passion for technology and social impact.',
    how_to_apply:
      'Apply online through the Google Scholarships website. Submit transcripts, two recommendation letters, and a 700-word essay.',
    type: 'scholarship',
    category: 'Technology',
    location: 'Sub-Saharan Africa',
    is_remote: false,
    deadline: '2026-05-15T23:59:59Z',
    funding_amount: 'USD $5,000',
    study_level: 'Undergraduate',
    application_link: 'https://buildyourfuture.withgoogle.com/scholarships',
    is_verified: true,
  },
  {
    title: 'Junior Software Developer',
    organization: 'Salone Innovations Ltd',
    description:
      'We are looking for a motivated Junior Software Developer to join our growing tech team in Freetown. You will work on web and mobile applications serving the Sierra Leone market, using modern tools and practices.',
    requirements:
      'Basic knowledge of HTML, CSS, JavaScript or Python. Understanding of databases. Enthusiasm for technology and problem-solving. Sierra Leonean citizenship or residency preferred.',
    how_to_apply:
      'Send your CV and a brief cover letter to jobs@saloneinnovations.sl. Include links to any projects or GitHub profile if available.',
    type: 'job',
    category: 'Technology',
    location: 'Freetown, Sierra Leone',
    is_remote: false,
    deadline: '2026-04-30T23:59:59Z',
    study_level: null,
    application_link: 'mailto:jobs@saloneinnovations.sl',
    is_verified: true,
  },
  {
    title: 'UNICEF Sierra Leone — Communications Internship',
    organization: 'UNICEF Sierra Leone',
    description:
      'UNICEF Sierra Leone is seeking a Communications Intern to support the team in producing content for social media, press releases, and campaign materials. The intern will gain hands-on experience in international development communications.',
    requirements:
      'Pursuing or recently completed a degree in Communications, Journalism, or related field. Strong writing skills in English. Experience with social media platforms.',
    how_to_apply:
      'Apply through the UNICEF careers portal with your CV and writing samples.',
    type: 'internship',
    category: 'Media & Communications',
    location: 'Freetown, Sierra Leone',
    is_remote: false,
    deadline: '2026-04-15T23:59:59Z',
    study_level: 'Undergraduate',
    application_link: 'https://www.unicef.org/careers',
    is_verified: true,
  },
  {
    title: 'World Bank Youth Summit 2026',
    organization: 'World Bank Group',
    description:
      'The World Bank Youth Summit brings together young leaders from around the world to discuss solutions to development challenges. Participants engage in workshops, panels, and networking with global development leaders. Travel grants available for selected participants.',
    requirements:
      'Between 18-35 years old. Demonstrated leadership or community impact. Strong English communication skills. Submit a 500-word application essay.',
    how_to_apply:
      'Apply through the World Bank website. Applications open 3 months before the event.',
    type: 'event',
    category: 'Government & Public Service',
    location: 'Washington D.C., USA',
    is_remote: false,
    deadline: '2026-05-01T23:59:59Z',
    study_level: null,
    application_link: 'https://youthsummit.worldbank.org/',
    is_verified: true,
  },
  {
    title: 'DAAD Scholarship for African Students',
    organization: 'German Academic Exchange Service (DAAD)',
    description:
      'DAAD scholarships enable outstanding students and researchers from developing countries to pursue graduate studies and research in Germany. The program covers full tuition, living expenses, health insurance, and travel costs.',
    requirements:
      'Hold a Bachelor\'s degree with above-average grades. 2 years of professional experience (for development-related programs). Language proficiency in German or English depending on the program.',
    how_to_apply:
      'Apply through the DAAD portal. Complete application package including academic transcripts, letters of recommendation, language certificates, and research proposal.',
    type: 'scholarship',
    category: 'Education',
    location: 'Germany',
    is_remote: false,
    deadline: '2026-07-31T23:59:59Z',
    funding_amount: 'Full scholarship including living expenses',
    study_level: 'Postgraduate',
    application_link: 'https://www.daad.de/en/studying-in-germany/scholarships/',
    is_verified: true,
  },
  {
    title: 'Health Officer — Ministry of Health Sierra Leone',
    organization: 'Ministry of Health, Sierra Leone',
    description:
      'The Ministry of Health is recruiting Health Officers to support district health management teams across Sierra Leone. Officers will coordinate health service delivery, community outreach, and data collection.',
    requirements:
      'BSc in Public Health, Nursing, or related field. At least 1 year experience in community health. Willingness to work in rural districts.',
    how_to_apply:
      'Submit applications to your District Health Management Team office or email to hrm@health.gov.sl.',
    type: 'job',
    category: 'Medicine & Health',
    location: 'Various Districts, Sierra Leone',
    is_remote: false,
    deadline: '2026-04-20T23:59:59Z',
    study_level: null,
    application_link: 'mailto:hrm@health.gov.sl',
    is_verified: true,
  },
  {
    title: 'Chevening Scholarship — United Kingdom',
    organization: 'UK Foreign, Commonwealth & Development Office',
    description:
      'Chevening is the UK government\'s international scholarships programme, funded by the Foreign, Commonwealth & Development Office and partner organisations. Chevening offers fully-funded scholarships to study in the UK.',
    requirements:
      'Citizen of a Chevening-eligible country including Sierra Leone. Completed an undergraduate degree equivalent to a UK 2:1. At least 2 years of work experience. Apply to 3 eligible UK university courses.',
    how_to_apply:
      'Apply online through the Chevening application portal. Applications typically open in August each year.',
    type: 'scholarship',
    category: 'Education',
    location: 'United Kingdom',
    is_remote: false,
    deadline: '2026-11-04T23:59:59Z',
    funding_amount: 'Full tuition + living allowance + flights + visa',
    study_level: 'Postgraduate',
    application_link: 'https://www.chevening.org/scholarships/',
    is_verified: true,
  },
  {
    title: 'Remote Digital Marketing Specialist',
    organization: 'TechAfrica Hub',
    description:
      'We are hiring a Digital Marketing Specialist to manage our social media presence, email campaigns, and content strategy. This is a fully remote role open to candidates anywhere in Africa.',
    requirements:
      'Minimum 1 year experience in digital marketing. Proficiency in Meta Ads, Google Analytics, and email marketing tools. Strong written communication skills in English.',
    how_to_apply:
      'Apply via the TechAfrica Hub website. Include portfolio or examples of previous campaigns.',
    type: 'job',
    category: 'Media & Communications',
    location: 'Africa (Remote)',
    is_remote: true,
    deadline: '2026-05-10T23:59:59Z',
    study_level: null,
    application_link: 'https://techafricahub.com/careers',
    is_verified: true,
  },
  {
    title: 'Commonwealth Scholarship — Taught Masters',
    organization: 'Commonwealth Scholarship Commission',
    description:
      'Commonwealth Scholarships for taught Master\'s study in the UK are for talented individuals from Sierra Leone and other Commonwealth developing countries. CSC scholarships are funded by the UK government and enable scholars to develop their professional skills and knowledge.',
    requirements:
      'Sierra Leonean citizen. Undergraduate degree at 2:1 level or above. Relevant work experience desirable. Priority given to applicants who plan to return to Sierra Leone after studies.',
    how_to_apply:
      'Apply through the online application portal of the Commonwealth Scholarship Commission.',
    type: 'scholarship',
    category: 'Education',
    location: 'United Kingdom',
    is_remote: false,
    deadline: '2026-10-31T23:59:59Z',
    funding_amount: 'Full tuition + living allowance + return airfare',
    study_level: 'Postgraduate',
    application_link: 'https://cscuk.fcdo.gov.uk/apply/',
    is_verified: true,
  },
  {
    title: 'Agriculture Extension Officer',
    organization: 'Ministry of Agriculture, Sierra Leone',
    description:
      'The Ministry of Agriculture is recruiting Extension Officers to support smallholder farmers across Sierra Leone with modern farming techniques, crop management, and market linkages. This role directly contributes to national food security.',
    requirements:
      'BSc in Agriculture or related field. Knowledge of Sierra Leonean farming conditions. Ability to communicate in local languages is an advantage.',
    how_to_apply:
      'Submit application to the Human Resources Department, Ministry of Agriculture, Youyi Building, Freetown. Or email: recruitment@agriculture.gov.sl',
    type: 'job',
    category: 'Agriculture',
    location: 'Freetown & Rural Districts, Sierra Leone',
    is_remote: false,
    deadline: '2026-04-25T23:59:59Z',
    study_level: null,
    application_link: 'mailto:recruitment@agriculture.gov.sl',
    is_verified: true,
  },
  {
    title: 'Pan-African Youth Leadership Forum 2026',
    organization: 'African Union Commission',
    description:
      'The African Union Youth Leadership Forum brings together young leaders aged 18-35 from across the continent. Participants engage in leadership training, policy dialogue, and develop action plans for the African Agenda 2063.',
    requirements:
      'Between 18-35 years of age. Active in community development, entrepreneurship, or public service. Nominate yourself or be nominated by a recognized organization.',
    how_to_apply:
      'Apply through the African Union Youth Division online portal.',
    type: 'event',
    category: 'Government & Public Service',
    location: 'Addis Ababa, Ethiopia',
    is_remote: false,
    deadline: '2026-04-30T23:59:59Z',
    study_level: null,
    application_link: 'https://au.int/en/youth',
    is_verified: true,
  },
  {
    title: 'Hubert H. Humphrey Fellowship Program',
    organization: 'U.S. Department of State',
    description:
      'The Humphrey Fellowship Program offers non-degree academic study and professional development opportunities in the United States for mid-career professionals from Sierra Leone and other countries. Fellows are placed at a U.S. university for 10 months.',
    requirements:
      'Sierra Leonean citizen residing in Sierra Leone. At least 5 years of professional work experience. B.A./B.S. degree or equivalent. Leadership potential and record of public service.',
    how_to_apply:
      'Apply through the U.S. Embassy in Freetown. Applications open annually — contact the Public Affairs Section.',
    type: 'scholarship',
    category: 'Government & Public Service',
    location: 'United States of America',
    is_remote: false,
    deadline: '2026-08-01T23:59:59Z',
    funding_amount: 'Full stipend, tuition, housing, travel',
    study_level: 'Professional',
    application_link: 'https://www.humphreyfellowship.org/',
    is_verified: true,
  },
  {
    title: 'Bank of Sierra Leone — Graduate Trainee Program',
    organization: 'Bank of Sierra Leone',
    description:
      'The Bank of Sierra Leone Graduate Trainee Program provides an exceptional opportunity for recent graduates to develop into future banking and finance professionals. Trainees rotate across key departments including Monetary Policy, Banking Supervision, and Currency.',
    requirements:
      'Bachelor\'s degree in Economics, Finance, Accounting, Law, or Statistics with minimum Second Class Upper. Must have completed university within the last 2 years. Sierra Leonean national.',
    how_to_apply:
      'Submit online application at the Bank of Sierra Leone website or drop off at the Siaka Stevens Street Head Office.',
    type: 'internship',
    category: 'Finance',
    location: 'Freetown, Sierra Leone',
    is_remote: false,
    deadline: '2026-04-15T23:59:59Z',
    study_level: 'Undergraduate',
    application_link: 'https://www.bsl.gov.sl',
    is_verified: true,
  },
  {
    title: 'Aga Khan Foundation International Scholarship',
    organization: 'Aga Khan Foundation',
    description:
      'The Aga Khan Foundation offers a limited number of scholarships each year for postgraduate studies to outstanding students from developing countries with limited financial means, including Sierra Leone.',
    requirements:
      'Citizen and resident of Sierra Leone. Hold a first degree with excellent academic results. Accepted into a full-time Masters program at a recognized university. Demonstrate financial need.',
    how_to_apply:
      'Applications submitted through the Aga Khan Foundation national office.',
    type: 'scholarship',
    category: 'Education',
    location: 'Various countries',
    is_remote: false,
    deadline: '2026-03-31T23:59:59Z',
    funding_amount: '50% grant, 50% loan (loan forgiven upon return to developing country)',
    study_level: 'Postgraduate',
    application_link: 'https://www.akdn.org/our-agencies/aga-khan-foundation/scholarships',
    is_verified: true,
  },
  {
    title: 'West Africa Journalism Summer School',
    organization: 'Thomson Reuters Foundation',
    description:
      'This intensive journalism training program in Accra, Ghana offers working journalists and recent graduates from West Africa skills in digital storytelling, data journalism, and ethical reporting. Travel bursaries available.',
    requirements:
      'At least 1 year of journalism experience or recent journalism graduate. Proficiency in English. Commitment to ethical journalism.',
    how_to_apply:
      'Apply via the Thomson Reuters Foundation training portal.',
    type: 'event',
    category: 'Media & Communications',
    location: 'Accra, Ghana',
    is_remote: false,
    deadline: '2026-05-31T23:59:59Z',
    funding_amount: 'Partial travel bursaries available',
    study_level: null,
    application_link: 'https://www.thomsonreuters.com/foundation',
    is_verified: true,
  },
  {
    title: 'Research Assistant — Environmental Science',
    organization: 'Njala University',
    description:
      'Njala University is seeking a Research Assistant to support ongoing research into Sierra Leone\'s biodiversity and climate change impacts. The position involves field surveys, data collection, and laboratory analysis.',
    requirements:
      'BSc in Environmental Science, Biology, or related field. Ability to work in rural fieldwork conditions. Data analysis skills (Excel or R preferred).',
    how_to_apply:
      'Send CV and cover letter to research@njala.edu.sl',
    type: 'job',
    category: 'Science',
    location: 'Bo District, Sierra Leone',
    is_remote: false,
    deadline: '2026-05-05T23:59:59Z',
    study_level: null,
    application_link: 'mailto:research@njala.edu.sl',
    is_verified: true,
  },
  {
    title: 'MIT Solve Challenge — West Africa',
    organization: 'MIT Solve',
    description:
      'MIT Solve challenges innovators to submit technology-based solutions to the world\'s most pressing problems, including challenges specifically focused on West Africa. Winning teams receive cash prizes, mentorship, and access to MIT\'s global network.',
    requirements:
      'Open to teams and individuals. Must submit a technology-based solution to one of the challenge areas. Teams must include at least one person from the target region.',
    how_to_apply:
      'Submit your solution through the MIT Solve online platform.',
    type: 'event',
    category: 'Technology',
    location: 'Remote (Global)',
    is_remote: true,
    deadline: '2026-06-15T23:59:59Z',
    funding_amount: 'Up to USD $10,000 + mentorship',
    study_level: null,
    application_link: 'https://solve.mit.edu/',
    is_verified: true,
  },
  {
    title: 'Human Rights Defender Fellowship — Sierra Leone',
    organization: 'Amnesty International',
    description:
      'Amnesty International is offering a fellowship for human rights defenders from Sierra Leone to gain skills in advocacy, documentation, and digital security. Fellows receive training, a monthly stipend, and mentorship from experienced human rights practitioners.',
    requirements:
      'Active human rights defender or civil society organization member. Sierra Leonean national. Demonstrate personal commitment to human rights work.',
    how_to_apply:
      'Apply through Amnesty International\'s West Africa Regional Office in Dakar.',
    type: 'scholarship',
    category: 'Law',
    location: 'Dakar, Senegal (with virtual components)',
    is_remote: false,
    deadline: '2026-05-20T23:59:59Z',
    funding_amount: 'Monthly stipend + travel + accommodation',
    study_level: null,
    application_link: 'https://www.amnesty.org/en/careers/',
    is_verified: true,
  },
]

async function seed() {
  console.log('🌱 Seeding opportunities into Supabase...')

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const opp of seedOpportunities) {
    // Check if it already exists by application_link
    const { data: existing } = await supabase
      .from('opportunities')
      .select('id')
      .eq('application_link', opp.application_link)
      .single()

    if (existing) {
      console.log(`  SKIP: "${opp.title.slice(0, 50)}…"`)
      skipped++
      continue
    }

    const { error } = await supabase.from('opportunities').insert(opp)

    if (error) {
      console.error(`  ERROR inserting "${opp.title.slice(0, 50)}": ${error.message}`)
      errors++
    } else {
      console.log(`  ✓ "${opp.title.slice(0, 50)}…"`)
      inserted++
    }
  }

  console.log(`\n✅ Done! Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`)
}

seed().catch(console.error)
