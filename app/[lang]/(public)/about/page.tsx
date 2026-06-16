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

    return {
      title: data.aboutSeoMetaTitle_en || 'About Us | 183 Housing Solutions',
      description:
        data.aboutSeoMetaDescription_en ||
        'Learn about 183 Housing Solutions and our mission in Vietnam.',
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
        title: data.aboutSeoOgTitle_en || data.aboutSeoMetaTitle_en,
        description:
          data.aboutSeoOgDescription_en ||
          data.aboutSeoMetaDescription_en,
        images: data.aboutSeoOgImage ? [data.aboutSeoOgImage] : [],
      },
    }
  } catch {
    return {
      title: 'About Us | 183 Housing Solutions',
      description:
        'Learn about 183 Housing Solutions and our mission in Vietnam.',
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