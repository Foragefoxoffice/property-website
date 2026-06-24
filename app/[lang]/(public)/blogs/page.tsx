import { fetchBlogPage } from '@/lib/serverFetch'
import BlogPageClient from '@/components/Blog/BlogPageClient'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/blogs`
  
  try {
    const res = await fetchBlogPage()
    const data = (res.data as any) || {}

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal(
      'blogSeoMetaTitle_en', 
      'blogSeoMetaTitle_vn', 
      'Blog | 183 Housing Solutions'
    )
    const metaDesc = getLocalVal(
      'blogSeoMetaDescription_en',
      'blogSeoMetaDescription_vn',
      'Read the latest news, tips, and guides from 183 Housing Solutions.'
    )
    
    const ogTitle = getLocalVal('blogSeoOgTitle_en', 'blogSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('blogSeoOgDescription_en', 'blogSeoOgDescription_vn', metaDesc)
    
    const rawOgImage = data.blogSeoOgImage || (data.blogSeoOgImages && data.blogSeoOgImages[0])
    const ogImage = rawOgImage ? getImageUrl(rawOgImage) : undefined

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/blogs`,
          'vi': `${siteUrl}/vi/blogs`,
          'x-default': `${siteUrl}/vi/blogs`,
        },
      },
      robots: {
        index: data.blogSeoAllowIndexing !== false,
        follow: data.blogSeoAllowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return {
      title: 'Blog | 183 Housing Solutions',
      description: 'Read the latest news, tips, and guides from 183 Housing Solutions.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/blogs`,
          'vi': `${siteUrl}/vi/blogs`,
          'x-default': `${siteUrl}/vi/blogs`,
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

export default async function BlogsPage() {
  let pageData = null

  try {
    // 👇 Show loader on refresh/navigation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const res = await fetchBlogPage()

    pageData = (res.data as Record<string, unknown>) || null
  } catch { }

  return <BlogPageClient pageData={pageData} />
}