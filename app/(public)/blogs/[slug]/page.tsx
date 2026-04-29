import { fetchBlogBySlug } from '@/lib/serverFetch'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 300

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetchBlogBySlug(params.slug)
    const b = (res.data as Record<string, unknown>) || {}
    const title = (b.title as Record<string, string>)?.en || String(b.title || 'Blog')
    const excerpt = (b.excerpt as Record<string, string>)?.en || String(b.excerpt || '')
    const images = (b.images as { url: string }[]) || []
    const imageUrl = images[0]?.url || ''
    return {
      title: `${title} | 183 Housing Solutions`,
      description: excerpt,
      openGraph: {
        title,
        description: excerpt,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      },
      twitter: { card: 'summary_large_image', title, description: excerpt, images: imageUrl ? [imageUrl] : [] },
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

  const title = (blog.title as Record<string, string>)?.en || String(blog.title || 'Untitled')
  const content = (blog.content as Record<string, string>)?.en || String(blog.content || '')
  const images = (blog.images as { url: string }[]) || []
  const coverImage = images[0]?.url || ''
  const publishedAt = blog.createdAt ? new Date(String(blog.createdAt)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/blogs" className="inline-flex items-center gap-1 text-sm text-[#41398B] hover:underline mb-8">
        ← Back to Blog
      </Link>
      {coverImage && (
        <div className="rounded-2xl overflow-hidden mb-8 h-72 sm:h-96">
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-3">{title}</h1>
      {publishedAt && <p className="text-sm text-gray-400 mb-8">{publishedAt}</p>}
      {content ? (
        <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="text-gray-400">No content available.</p>
      )}
    </div>
  )
}
