import { fetchTermsConditions } from '@/lib/serverFetch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | 183 Housing Solutions',
  description: 'Terms and conditions for using 183 Housing Solutions services.',
}

export const revalidate = 3600

export default async function TermsConditionsPage() {
  let data: Record<string, unknown> = {}
  try {
    const res = await fetchTermsConditions()
    data = (res.data as Record<string, unknown>) || {}
  } catch {}

  const title = String(data.title || 'Terms & Conditions')
  const content = String(data.content || data.body || '')

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-[#41398B] mb-8">{title}</h1>
      {content ? (
        <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="text-gray-500">Terms and conditions content will be available soon.</p>
      )}
    </div>
  )
}
