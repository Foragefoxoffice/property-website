import { fetchProjectBySlug } from '@/lib/serverFetch'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 300

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetchProjectBySlug(params.slug)
    const p = (res.data as Record<string, unknown>) || {}
    const title = (p.title as Record<string, string>)?.en || String(p.title || 'Project')
    const description = (p.description as Record<string, string>)?.en || String(p.description || '')
    const images = (p.images as { url: string }[]) || []
    const imageUrl = images[0]?.url || ''
    return {
      title: `${title} | 183 Housing Solutions`,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      },
      twitter: { card: 'summary_large_image', title, description, images: imageUrl ? [imageUrl] : [] },
    }
  } catch {
    return { title: 'Project | 183 Housing Solutions' }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  let project: Record<string, unknown> = {}
  try {
    const res = await fetchProjectBySlug(params.slug)
    project = (res.data as Record<string, unknown>) || {}
  } catch {
    notFound()
  }

  if (!project._id) notFound()

  const title = (project.title as Record<string, string>)?.en || String(project.title || 'Untitled')
  const description = (project.description as Record<string, string>)?.en || String(project.description || '')
  const images = (project.images as { url: string }[]) || []
  const location = String((project.location as Record<string, string>)?.en || project.location || '')
  const status = String(project.status || '')

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-[#41398B] hover:underline mb-8">
        ← Back to Projects
      </Link>

      {images.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-8 h-72 sm:h-96">
          <img src={images[0].url} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start gap-4 flex-wrap mb-4">
        <h1 className="text-3xl font-extrabold text-gray-800 flex-1">{title}</h1>
        {status && <span className="px-3 py-1 bg-[#41398B] text-white text-xs rounded-full">{status}</span>}
      </div>

      {location && <p className="text-gray-500 text-sm mb-6">📍 {location}</p>}

      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8">
          {images.slice(1, 9).map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden h-24">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {description ? (
        <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <p className="text-gray-400">No description available.</p>
      )}
    </div>
  )
}
