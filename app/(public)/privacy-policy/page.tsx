import { fetchPrivacyPolicy } from '@/lib/serverFetch'
import PrivacyPolicyBanner from '@/components/PrivacyPolicy/PrivacyPolicyBanner'
import PrivacyPolicyContent from '@/components/PrivacyPolicy/PrivacyPolicyContent'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchPrivacyPolicy()
    const data = (res.data as any) || {}
    return {
      title: data.privacyPolicySeoMetaTitle_en || 'Privacy Policy | 183 Housing Solutions',
      description: data.privacyPolicySeoMetaDescription_en || 'Privacy policy for 183 Housing Solutions — how we handle your data.',
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
    }
  }
}

export const revalidate = 3600

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

