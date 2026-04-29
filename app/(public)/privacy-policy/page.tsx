import { fetchPrivacyPolicy } from '@/lib/serverFetch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | 183 Housing Solutions',
  description: 'Privacy policy for 183 Housing Solutions — how we handle your data.',
}

export const revalidate = 3600

export default async function PrivacyPolicyPage() {
  let data: Record<string, unknown> = {}
  try {
    const res = await fetchPrivacyPolicy()
    data = (res.data as Record<string, unknown>) || {}
  } catch {}

  const title = String(data.title || 'Privacy Policy')
  const content = String(data.content || data.body || '')

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-[#41398B] mb-8">{title}</h1>
      {content ? (
        <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="text-gray-500">Privacy policy content will be available soon.</p>
      )}
    </div>
  )
}
