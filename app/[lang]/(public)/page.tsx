import { fetchHomeCms, fetchListingProperties } from '@/lib/serverFetch'
import HomePageClient from '@/components/Home/HomePageClient'
import type { Metadata } from 'next'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const lang = params.lang || 'vi'
    const siteUrl = 'https://183housingsolutions.com'
    const currentCanonical = `${siteUrl}/${lang}`
  try {
    
    const res = await fetchHomeCms()
    const data = (res.data as any) || {}

    return {
      title: data.homeSeoMetaTitle_en || '183 Housing Solutions — Find Your Home in Vietnam',
      description:
        data.homeSeoMetaDescription_en ||
        'Browse properties for lease, sale, and home stay in Vietnam.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en`,
          'vi': `${siteUrl}/vi`,
          'x-default': `${siteUrl}/vi`,
        },
      },
      robots: {
        index: data.homeSeoAllowIndexing !== false,
        follow: data.homeSeoAllowIndexing !== false,
      },
      openGraph: {
        title: data.homeSeoOgTitle_en || data.homeSeoMetaTitle_en,
        description:
          data.homeSeoOgDescription_en ||
          data.homeSeoMetaDescription_en,
        images: data.homeSeoOgImage ? [data.homeSeoOgImage] : [],
      },
    }
  } catch {
    return {
      title: '183 Housing Solutions — Find Your Home in Vietnam',
      description:
        'Browse properties for lease, sale, and home stay in Vietnam.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en`,
          'vi': `${siteUrl}/vi`,
          'x-default': `${siteUrl}/vi`,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export default async function HomePage() {
  let cmsData: Record<string, unknown> = {}
  let featuredProperties: unknown[] = []

  try {
    const [cms, props] = await Promise.all([
      fetchHomeCms(),
      fetchListingProperties({
        page: '1',
        limit: '6',
        sortBy: 'newest',
      }),
    ])

    cmsData = (cms.data as Record<string, unknown>) || {}
    featuredProperties = (props.data as unknown[]) || []
  } catch {
    // render empty state
  }

  const rawFaqs = (cmsData?.faqs as any[]) || []
  const faqs = rawFaqs.length > 0 ? rawFaqs : [
    { header_en: 'How do I start the home buying process?', content_en: 'Starting the home buying process involves getting pre-approved for a mortgage to understand your budget, finding a real estate agent to guide you, and identifying your needs and preferences for your new home.' },
    { header_en: 'What costs are involved in buying a home?', content_en: 'Our approach combines personalized strategies, data-driven insights, and dedicated support to help you reach your financial goals. Each step is crafted to maximize growth, reduce risk, and build lasting financial confidence.' },
    { header_en: 'How long does it take to buy a home?', content_en: 'The timeline varies but typically takes 30-45 days from contract to closing. Finding the right home can take weeks or months depending on the market and your specific criteria.' },
  ]

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: '183 Housing Solutions',
    image: 'https://183housingsolutions.com/images/property/dummy-img.avif',
    '@id': 'https://183housingsolutions.com',
    url: 'https://183housingsolutions.com',
    telephone: '+84398740430',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ecopark',
      addressLocality: 'Hung Yen',
      addressRegion: 'Hung Yen',
      addressCountry: 'VN'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '18:00'
    }
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.header_en || f.header,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.content_en || f.content
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient
        cmsData={cmsData}
        featuredProperties={featuredProperties}
      />
    </>
  )
}