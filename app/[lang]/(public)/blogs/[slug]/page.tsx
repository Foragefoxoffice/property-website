import { fetchBlogBySlug } from '@/lib/serverFetch'
import BlogDetailClient from '@/components/Blog/BlogDetailClient'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'

export const revalidate = 0

interface Props { 
  params: { lang: string, slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const lang = params.lang || 'vi'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://183housingsolutions.com'
    const previewToken = searchParams?.previewToken as string | undefined;
    
  try {
    const res = await fetchBlogBySlug(params.slug, previewToken)
    const b = (res.data as Record<string, any>) || {}
    const seo = b.seoInformation || {}

    const getLocalVal = (obj: any) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      if (obj[lang]) return String(obj[lang])
      return String(safeVal(obj))
    }

    const baseTitle = getLocalVal(b.title) || 'Blog'
    const metaTitle = getLocalVal(seo.metaTitle) || baseTitle

    const rawDesc = getLocalVal(b.content)
    const baseDesc = stripHtml(String(rawDesc)).substring(0, 160) || 'Read our latest blog posts on 183 Housing Solutions'
    const metaDescription = getLocalVal(seo.metaDescription) || baseDesc

    const mainImage = String(b.mainImage || '')
    const baseImageUrl = getImageUrl(mainImage)

    const ogTitle = getLocalVal(seo.ogTitle) || metaTitle
    const ogDescription = getLocalVal(seo.ogDescription) || metaDescription
    const ogImageVal = seo.ogImage || (seo.ogImages && seo.ogImages[0])
    const imageUrl = ogImageVal ? getImageUrl(ogImageVal) : baseImageUrl

    let enSlug = seo.slugUrl?.en || (b.slug as any)?.en || params.slug
    let viSlug = seo.slugUrl?.vi || (b.slug as any)?.vi || params.slug
    const canonicalSlug = lang === 'en' ? enSlug : viSlug

    const currentCanonical = `${siteUrl}/${lang}/blogs/${canonicalSlug}`
    const enCanonicalUrl = `${siteUrl}/en/blogs/${enSlug}`
    const viCanonicalUrl = `${siteUrl}/vi/blogs/${viSlug}`

    return {
      title: `${metaTitle} | 183 Housing Solutions`,
      description: metaDescription,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': enCanonicalUrl,
          'vi': viCanonicalUrl,
          'x-default': viCanonicalUrl,
        },
      },
      robots: {
        index: seo.allowIndexing !== false,
        follow: seo.allowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: currentCanonical,
        type: 'article',
        siteName: '183 Housing Solutions',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: ogTitle }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    console.error('Blog metadata error:', error)
    const currentCanonical = `${siteUrl}/${lang}/blogs/${params.slug}`
    return { 
      title: 'Blog | 183 Housing Solutions',
      description: 'Read our latest blog posts on 183 Housing Solutions',
      alternates: { 
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/blogs/${params.slug}`,
          'vi': `${siteUrl}/vi/blogs/${params.slug}`,
          'x-default': `${siteUrl}/vi/blogs/${params.slug}`,
        }
      },
      robots: { index: true, follow: true }
    }
  }
}

export default async function BlogDetailPage({ params, searchParams }: Props) {
  let blog: Record<string, unknown> = {}
  const previewToken = searchParams?.previewToken as string | undefined;

  try {
    const res = await fetchBlogBySlug(params.slug, previewToken)
    blog = (res.data as Record<string, unknown>) || {}
  } catch {
    notFound()
  }

  if (!blog._id) notFound()

  const lang = params.lang || 'vi'
  const seo = (blog.seoInformation as any) || {}
  
  // Enforce correct slug for current language
  const expectedSlug = seo.slugUrl?.[lang] || (blog.slug as any)?.[lang] || params.slug
  if (expectedSlug && expectedSlug !== params.slug) {
    redirect(`/${lang}/blogs/${expectedSlug}`)
  }

  return <BlogDetailClient blog={blog as Parameters<typeof BlogDetailClient>[0]['blog']} />
}
