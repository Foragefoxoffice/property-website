import { fetchTermsConditions } from '@/lib/serverFetch'
import TermsConditionBanner from '@/components/TermsConditions/TermsConditionBanner'
import { getImageUrl } from '@/utils/baseURL'
import TermsConditionContent from '@/components/TermsConditions/TermsConditionContent'
import type { Metadata } from 'next'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/terms-conditions`
  
  try {
    const res = await fetchTermsConditions()
    const data = (res.data as Record<string, any>) || {}

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal('termsConditionSeoMetaTitle_en', 'termsConditionSeoMetaTitle_vn', 'Terms & Conditions | 183 Housing Solutions')
    const metaDesc = getLocalVal('termsConditionSeoMetaDescription_en', 'termsConditionSeoMetaDescription_vn', 'Terms and conditions for using 183 Housing Solutions services.')
    const ogTitle = getLocalVal('termsConditionSeoOgTitle_en', 'termsConditionSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('termsConditionSeoOgDescription_en', 'termsConditionSeoOgDescription_vn', metaDesc)

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/terms-conditions`,
          'vi': `${siteUrl}/vi/dieu-khoan-dieu-kien`,
          'x-default': `${siteUrl}/vi/dieu-khoan-dieu-kien`,
        },
      },
      robots: {
        index: data.termsConditionSeoAllowIndexing !== false,
        follow: data.termsConditionSeoAllowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        url: currentCanonical,
        images: data.termsConditionSeoOgImage ? [{ url: getImageUrl(data.termsConditionSeoOgImage), width: 1200, height: 630, alt: ogTitle }] : [],
      }
    }
  } catch {
    return {
      title: 'Terms & Conditions | 183 Housing Solutions',
      description: 'Terms and conditions for using 183 Housing Solutions services.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/terms-conditions`,
          'vi': `${siteUrl}/vi/dieu-khoan-dieu-kien`,
          'x-default': `${siteUrl}/vi/dieu-khoan-dieu-kien`,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export const revalidate = 0

export default async function TermsConditionsPage() {
  let data: Record<string, unknown> = {}
  try {
    const res = await fetchTermsConditions()
    data = (res.data as Record<string, unknown>) || {}
  } catch (error) {
    console.error('Error fetching Terms & Conditions data:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <TermsConditionBanner data={data} />
      <TermsConditionContent data={data} />
    </div>
  )
}
