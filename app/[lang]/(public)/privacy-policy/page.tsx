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
    const data = (res.data as any) || {}
    return {
      title: data.privacyPolicySeoMetaTitle_en || 'Privacy Policy | 183 Housing Solutions',
      description: data.privacyPolicySeoMetaDescription_en || 'Privacy policy for 183 Housing Solutions — how we handle your data.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/privacy-policy`,
          'vi': `${siteUrl}/vi/privacy-policy`,
          'x-default': `${siteUrl}/vi/privacy-policy`,
        },
      },
      robots: {
        index: data.privacyPolicySeoAllowIndexing !== false,
        follow: data.privacyPolicySeoAllowIndexing !== false,
      },
      openGraph: {
        title: data.privacyPolicySeoOgTitle_en || data.privacyPolicySeoMetaTitle_en,
        description: data.privacyPolicySeoOgDescription_en || data.privacyPolicySeoMetaDescription_en,
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
          'vi': `${siteUrl}/vi/privacy-policy`,
          'x-default': `${siteUrl}/vi/privacy-policy`,
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

