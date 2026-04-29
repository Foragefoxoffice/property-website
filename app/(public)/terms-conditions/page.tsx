import { fetchTermsConditions } from '@/lib/serverFetch'
import TermsConditionBanner from '@/components/TermsConditions/TermsConditionBanner'
import TermsConditionContent from '@/components/TermsConditions/TermsConditionContent'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchTermsConditions()
    const data = (res.data as any) || {}
    return {
      title: data.termsConditionSeoMetaTitle_en || 'Terms & Conditions | 183 Housing Solutions',
      description: data.termsConditionSeoMetaDescription_en || 'Terms and conditions for using 183 Housing Solutions services.',
      openGraph: {
        title: data.termsConditionSeoOgTitle_en || data.termsConditionSeoMetaTitle_en,
        description: data.termsConditionSeoOgDescription_en || data.termsConditionSeoMetaDescription_en,
        images: data.termsConditionSeoOgImages && data.termsConditionSeoOgImages.length > 0 ? [data.termsConditionSeoOgImages[0]] : [],
      }
    }
  } catch {
    return {
      title: 'Terms & Conditions | 183 Housing Solutions',
      description: 'Terms and conditions for using 183 Housing Solutions services.',
    }
  }
}

export const revalidate = 3600

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

