import { fetchProjectBySlug } from '@/lib/serverFetch'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectDetailClient from '@/components/Projects/ProjectDetailClient'

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

  return <ProjectDetailClient project={project} />
}
