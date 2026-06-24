import { fetchPrivacyPolicy } from '@/lib/serverFetch'
import PrivacyPolicyBanner from '@/components/PrivacyPolicy/PrivacyPolicyBanner'
import PrivacyPolicyContent from '@/components/PrivacyPolicy/PrivacyPolicyContent'
import type { Metadata } from 'next'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/privacy-policy`
  
  try {
    const res = await fetchPrivacyPolicy()
    const data = (res.data as Record<string, any>) || {}

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal('privacyPolicySeoMetaTitle_en', 'privacyPolicySeoMetaTitle_vn', 'Privacy Policy | 183 Housing Solutions')
    const metaDesc = getLocalVal('privacyPolicySeoMetaDescription_en', 'privacyPolicySeoMetaDescription_vn', 'Privacy policy for 183 Housing Solutions — how we handle your data.')
    const ogTitle = getLocalVal('privacyPolicySeoOgTitle_en', 'privacyPolicySeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('privacyPolicySeoOgDescription_en', 'privacyPolicySeoOgDescription_vn', metaDesc)

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/privacy-policy`,
          'vi': `${siteUrl}/vi/chinh-sach-bao-mat`,
          'x-default': `${siteUrl}/vi/chinh-sach-bao-mat`,
        },
      },
      robots: {
        index: data.privacyPolicySeoAllowIndexing !== false,
        follow: data.privacyPolicySeoAllowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        url: currentCanonical,
        images: data.privacyPolicySeoOgImages && data.privacyPolicySeoOgImages.length > 0 ? [data.privacyPolicySeoOgImages[0]] : [],
      }
    }
  } catch {
    return {
      title: 'Privacy Policy | 183 Housing Solutions',
      description: 'Privacy policy for 183 Housing Solutions — how we handle your data.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/privacy-policy`,
          'vi': `${siteUrl}/vi/chinh-sach-bao-mat`,
          'x-default': `${siteUrl}/vi/chinh-sach-bao-mat`,
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

export default async function PrivacyPolicyPage() {
  let data: Record<string, unknown> = {}
  try {
    const res = await fetchPrivacyPolicy()
    data = (res.data as Record<string, unknown>) || {}
  } catch (error) {
    console.error('Error fetching Privacy Policy data:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <PrivacyPolicyBanner data={data} />
      <PrivacyPolicyContent data={data} />
    </div>
  )
}
