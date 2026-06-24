import { fetchContactCms } from '@/lib/serverFetch'
import ContactBanner from '@/components/Contact/ContactBanner'
import ContactForm from '@/components/Contact/ContactForm'
import ContactMap from '@/components/Contact/ContactMap'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/contact`
  
  try {
    const res = await fetchContactCms()
    const data = (res.data as any) || {}

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal(
      'contactSeoMetaTitle_en', 
      'contactSeoMetaTitle_vn', 
      'Contact Us | 183 Housing Solutions'
    )
    const metaDesc = getLocalVal(
      'contactSeoMetaDescription_en',
      'contactSeoMetaDescription_vn',
      'Get in touch with the 183 Housing Solutions team.'
    )
    
    const ogTitle = getLocalVal('contactSeoOgTitle_en', 'contactSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('contactSeoOgDescription_en', 'contactSeoOgDescription_vn', metaDesc)
    
    const rawOgImage = data.contactSeoOgImage || (data.contactSeoOgImages && data.contactSeoOgImages[0])
    const ogImage = rawOgImage ? getImageUrl(rawOgImage) : undefined

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/contact`,
          'vi': `${siteUrl}/vi/contact`,
          'x-default': `${siteUrl}/vi/contact`,
        },
      },
      robots: {
        index: data.contactSeoAllowIndexing !== false,
        follow: data.contactSeoAllowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return {
      title: 'Contact Us | 183 Housing Solutions',
      description: 'Get in touch with the 183 Housing Solutions team.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/contact`,
          'vi': `${siteUrl}/vi/contact`,
          'x-default': `${siteUrl}/vi/contact`,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
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