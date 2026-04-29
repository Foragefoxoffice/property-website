import { fetchAllProjects } from '@/lib/serverFetch'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects | 183 Housing Solutions',
  description: 'Explore real estate development projects by 183 Housing Solutions in Vietnam.',
}

export const revalidate = 300

export default async function ProjectsPage() {
  let projects: unknown[] = []
  try {
    const res = await fetchAllProjects()
    projects = (res.data as unknown[]) || []
  } catch {}

  const published = (projects as Record<string, unknown>[]).filter(p => p.published)

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-[#41398B] mb-10">Projects</h1>
      {published.length === 0 ? (
        <p className="text-gray-500">No projects yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((project) => {
            const p = project as Record<string, unknown>
            const title = (p.title as Record<string, string>)?.en || String(p.title || 'Untitled')
            const slug = String(p.slug || p._id)
            const description = (p.description as Record<string, string>)?.en || String(p.description || '')
            const images = (p.images as { url: string }[]) || []
            const coverImage = images[0]?.url || ''
            return (
              <Link key={String(p._id)} href={`/projects/${slug}`}
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
                  {description && <p className="text-sm text-gray-500 line-clamp-3">{description}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
