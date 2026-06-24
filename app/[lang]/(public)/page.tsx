import { fetchHomeCms, fetchListingProperties } from '@/lib/serverFetch'
import HomePageClient from '@/components/Home/HomePageClient'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'

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

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal(
      'homeSeoMetaTitle_en', 
      'homeSeoMetaTitle_vn', 
      '183 Housing Solutions — Find Your Home in Vietnam'
    )
    const metaDesc = getLocalVal(
      'homeSeoMetaDescription_en',
      'homeSeoMetaDescription_vn',
      'Browse properties for lease, sale, and home stay in Vietnam.'
    )
    
    const ogTitle = getLocalVal('homeSeoOgTitle_en', 'homeSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('homeSeoOgDescription_en', 'homeSeoOgDescription_vn', metaDesc)
    
    // OG Image fallback
    const rawOgImage = data.homeSeoOgImage || (data.homeSeoOgImages && data.homeSeoOgImages[0])
    const ogImage = rawOgImage ? getImageUrl(rawOgImage) : undefined

    return {
      title: metaTitle,
      description: metaDesc,
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
        title: ogTitle,
        description: ogDesc,
        type: 'website',
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDesc,
        images: ogImage ? [ogImage] : [],
      }
    }
  } catch {
    return {
      title: '183 Housing Solutions — Find Your Home in Vietnam',
      description: 'Browse properties for lease, sale, and home stay in Vietnam.',
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