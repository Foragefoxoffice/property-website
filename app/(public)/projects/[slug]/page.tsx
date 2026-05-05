import { fetchProjectBySlug } from '@/lib/serverFetch'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectDetailClient from '@/components/Projects/ProjectDetailClient'

import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'

export const revalidate = 300

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetchProjectBySlug(params.slug)
    const p = (res.data as Record<string, any>) || {}
    
    const title = String(safeVal(p.projectBannerTitle) || safeVal(p.title) || 'Project')
    const descHtml = safeVal(p.projectBannerDesc) || safeVal(p.description)
    const description = stripHtml(descHtml) || 'View project details on 183 Housing Solutions'
    
    const bannerImages = (p.projectBannerImages as string[]) || []
    const imageUrl = getImageUrl(bannerImages[0])
    
    return {
      title: `${title} | 183 Housing Solutions`,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: '183 Housing Solutions',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
      },
      twitter: { 
        card: 'summary_large_image', 
        title, 
        description, 
        images: imageUrl ? [imageUrl] : [] 
      },
    }
  } catch (error) {
    console.error('Project metadata error:', error)
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
