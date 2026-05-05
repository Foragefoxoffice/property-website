import { fetchBlogBySlug } from '@/lib/serverFetch'
import BlogDetailClient from '@/components/Blog/BlogDetailClient'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'

export const revalidate = 300

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetchBlogBySlug(params.slug)
    const b = (res.data as Record<string, any>) || {}
    
    const title = String(safeVal(b.title) || 'Blog')
    const content = safeVal(b.content)
    const description = stripHtml(content).substring(0, 160) || 'Read our latest blog posts on 183 Housing Solutions'
    
    const mainImage = String(b.mainImage || '')
    const imageUrl = getImageUrl(mainImage)
    
    return {
      title: `${title} | 183 Housing Solutions`,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        siteName: '183 Housing Solutions',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    console.error('Blog metadata error:', error)
    return { title: 'Blog | 183 Housing Solutions' }
  }
}

export default async function BlogDetailPage({ params }: Props) {
  let blog: Record<string, unknown> = {}
  try {
    const res = await fetchBlogBySlug(params.slug)
    blog = (res.data as Record<string, unknown>) || {}
  } catch {
    notFound()
  }

  if (!blog._id) notFound()

  return <BlogDetailClient blog={blog as Parameters<typeof BlogDetailClient>[0]['blog']} />
}
