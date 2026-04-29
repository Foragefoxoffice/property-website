import { fetchAllBlogs } from '@/lib/serverFetch'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | 183 Housing Solutions',
  description: 'Read the latest news, tips, and guides from 183 Housing Solutions.',
}

export const revalidate = 300

export default async function BlogsPage() {
  let blogs: unknown[] = []
  try {
    const res = await fetchAllBlogs()
    blogs = (res.data as unknown[]) || []
  } catch {}

  const published = (blogs as Record<string, unknown>[]).filter(b => b.published)

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-[#41398B] mb-10">Blog</h1>
      {published.length === 0 ? (
        <p className="text-gray-500">No articles yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((blog) => {
            const b = blog as Record<string, unknown>
            const title = (b.title as Record<string, string>)?.en || String(b.title || 'Untitled')
            const slug = String(b.slug || b._id)
            const excerpt = (b.excerpt as Record<string, string>)?.en || String(b.excerpt || '')
            const images = (b.images as { url: string }[]) || []
            const coverImage = images[0]?.url || ''
            return (
              <Link key={String(b._id)} href={`/blogs/${slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                {coverImage ? (
                  <div className="h-48 overflow-hidden">
                    <img src={coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                ) : (
                  <div className="h-48 bg-[#E8E8FF] flex items-center justify-center">
                    <span className="text-[#41398B] text-4xl font-bold opacity-30">183</span>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#41398B] transition">{title}</h2>
                  {excerpt && <p className="text-sm text-gray-500 line-clamp-3">{excerpt}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
