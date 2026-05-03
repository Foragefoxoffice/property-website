import { fetchBlogBySlug } from '@/lib/serverFetch'
import BlogDetailClient from '@/components/Blog/BlogDetailClient'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getImageUrl } from '@/utils/baseURL'


export const revalidate = 300

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetchBlogBySlug(params.slug)
    const b = (res.data as Record<string, unknown>) || {}
    const title = (b.title as Record<string, string>)?.en || String(b.title || 'Blog')
    const mainImage = String(b.mainImage || '')
    const imageUrl = getImageUrl(mainImage)
    return {
      title: `${title} | 183 Housing Solutions`,
      openGraph: {
        title,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      },
    }
  } catch {
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
