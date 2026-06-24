import { fetchAboutCms } from '@/lib/serverFetch'
import AboutBanner from '@/components/About/AboutBanner'
import AboutOverview from '@/components/About/AboutOverview'
import AboutMissionVission from '@/components/About/AboutMissionVission'
import AboutHistory from '@/components/About/AboutHistory'
import AboutWhyChoose from '@/components/About/AboutWhyChoose'
import AboutBuyProcess from '@/components/About/AboutBuyProcess'
import AboutFindProperty from '@/components/About/AboutFindProperty'
import AboutAgent from '@/components/About/AboutAgent'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/about`

  try {
    const res = await fetchAboutCms()
    const data = (res.data as any) || {}

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal(
      'aboutSeoMetaTitle_en', 
      'aboutSeoMetaTitle_vn', 
      'About Us | 183 Housing Solutions'
    )
    const metaDesc = getLocalVal(
      'aboutSeoMetaDescription_en',
      'aboutSeoMetaDescription_vn',
      'Learn about 183 Housing Solutions and our mission in Vietnam.'
    )
    
    const ogTitle = getLocalVal('aboutSeoOgTitle_en', 'aboutSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('aboutSeoOgDescription_en', 'aboutSeoOgDescription_vn', metaDesc)
    
    // OG Image fallback
    const rawOgImage = data.aboutSeoOgImage || (data.aboutSeoOgImages && data.aboutSeoOgImages[0])
    const ogImage = rawOgImage ? getImageUrl(rawOgImage) : undefined

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/about`,
          'vi': `${siteUrl}/vi/about`,
          'x-default': `${siteUrl}/vi/about`,
        },
      },
      robots: {
        index: data.aboutSeoAllowIndexing !== false,
        follow: data.aboutSeoAllowIndexing !== false,
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
      title: 'About Us | 183 Housing Solutions',
      description: 'Learn about 183 Housing Solutions and our mission in Vietnam.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/about`,
          'vi': `${siteUrl}/vi/about`,
          'x-default': `${siteUrl}/vi/about`,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export default async function AboutPage() {
  let data: Record<string, unknown> = {}

  try {
    // 👇 Add delay for loader visibility
    await new Promise(resolve => setTimeout(resolve, 1500))

    const res = await fetchAboutCms()

    data = (res.data as Record<string, unknown>) || {}
  } catch { }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: '183 Housing Solutions',
    image: 'https://183housingsolutions.com/images/property/dummy-img.avif',
    '@id': 'https://183housingsolutions.com',
    url: 'https://183housingsolutions.com/about',
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Homepage',
        item: 'https://183housingsolutions.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About Us',
        item: 'https://183housingsolutions.com/about'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutBanner data={data} />
      <AboutOverview data={data} />
      <AboutMissionVission data={data} />
      <AboutHistory data={data} />
      <AboutWhyChoose data={data} />
      <AboutBuyProcess data={data} />
      <AboutFindProperty data={data} />
      <AboutAgent data={data} />
    </div>
  )
}