import { fetchContactCms } from '@/lib/serverFetch'
import ContactForm from '@/components/Contact/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | 183 Housing Solutions',
  description: 'Get in touch with the 183 Housing Solutions team.',
}

export default async function ContactPage() {
  let data: Record<string, unknown> = {}
  try {
    const res = await fetchContactCms()
    data = (res.data as Record<string, unknown>) || {}
  } catch {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-[#41398B] mb-4">Contact Us</h1>
      {!!data.address && <p className="text-gray-500 mb-2">📍 {String(data.address)}</p>}
      {!!data.phone && <p className="text-gray-500 mb-2">📞 {String(data.phone)}</p>}
      {!!data.email && <p className="text-gray-500 mb-8">✉️ {String(data.email)}</p>}
      <ContactForm />
    </div>
  )
}
