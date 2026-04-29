import { fetchAboutCms } from '@/lib/serverFetch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | 183 Housing Solutions',
  description: 'Learn about 183 Housing Solutions and our mission in Vietnam.',
}

export default async function AboutPage() {
  let data: Record<string, unknown> = {}
  try {
    const res = await fetchAboutCms()
    data = (res.data as Record<string, unknown>) || {}
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-[#41398B] mb-6">{String(data.title || 'About Us')}</h1>
      {data.content ? (
        <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: String(data.content) }} />
      ) : (
        <p className="text-gray-500">We are 183 Housing Solutions, your trusted partner for real estate in Vietnam.</p>
      )}
    </div>
  )
}
