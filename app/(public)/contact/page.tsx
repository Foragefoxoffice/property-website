import { fetchContactCms } from '@/lib/serverFetch'
import ContactBanner from '@/components/Contact/ContactBanner'
import ContactForm from '@/components/Contact/ContactForm'
import ContactMap from '@/components/Contact/ContactMap'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchContactCms()
    const data = (res.data as any) || {}

    return {
      title: data.contactSeoMetaTitle_en || 'Contact Us | 183 Housing Solutions',
      description:
        data.contactSeoMetaDescription_en ||
        'Get in touch with the 183 Housing Solutions team.',
      openGraph: {
        title: data.contactSeoOgTitle_en || data.contactSeoMetaTitle_en,
        description:
          data.contactSeoOgDescription_en ||
          data.contactSeoMetaDescription_en,
        images: data.contactSeoOgImage ? [data.contactSeoOgImage] : [],
      },
    }
  } catch {
    return {
      title: 'Contact Us | 183 Housing Solutions',
      description:
        'Get in touch with the 183 Housing Solutions team.',
    }
  }
}

export default async function ContactPage() {
  let data: Record<string, unknown> = {}

  try {
    // 👇 Show loader on refresh/navigation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const res = await fetchContactCms()

    data = (res.data as Record<string, unknown>) || {}
  } catch { }

  return (
    <div className="min-h-screen bg-white">
      <ContactBanner data={data} />
      <ContactForm data={data} />
      <ContactMap data={data} />
    </div>
  )
}