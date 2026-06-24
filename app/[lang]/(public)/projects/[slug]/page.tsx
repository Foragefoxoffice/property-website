import { fetchProjectBySlug } from '@/lib/serverFetch'
import Link from '@/components/LanguageLink'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import ProjectDetailClient from '@/components/Projects/ProjectDetailClient'

import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'

export const revalidate = 0

interface Props { params: { lang: string, slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  
  try {
    const res = await fetchProjectBySlug(params.slug)
    const p = (res.data as Record<string, any>) || {}
    
    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (p[enKey] || p[vnKey]) : (p[vnKey] || p[enKey])
      return val ? String(val) : fallback
    }

    const fallbackTitle = String(safeVal(p.projectBannerTitle) || safeVal(p.title) || 'Project')
    const fallbackDescHtml = safeVal(p.projectBannerDesc) || safeVal(p.description)
    const fallbackDesc = stripHtml(fallbackDescHtml) || 'View project details on 183 Housing Solutions'
    
    const bannerImages = (p.projectBannerImages as string[]) || []
    const fallbackImageUrl = getImageUrl(bannerImages[0])

    const metaTitle = getLocalVal('projectSeoMetaTitle_en', 'projectSeoMetaTitle_vn', fallbackTitle)
    const metaDesc = getLocalVal('projectSeoMetaDesc_en', 'projectSeoMetaDesc_vn', fallbackDesc)
    
    const ogTitle = getLocalVal('projectSeoOgTitle_en', 'projectSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('projectSeoOgDesc_en', 'projectSeoOgDesc_vn', metaDesc)
    const ogImage = p.projectSeoOgImage ? getImageUrl(p.projectSeoOgImage) : fallbackImageUrl

    // Determine the ideal canonical URL
    const projectSlugObj = (p.slug as Record<string, string>) || {}
    const canonicalSlug = lang === 'en' 
      ? (projectSlugObj.en || projectSlugObj.vi || projectSlugObj.vn || params.slug)
      : (projectSlugObj.vi || projectSlugObj.vn || projectSlugObj.en || params.slug)
    
    const canonicalUrl = `${siteUrl}/${lang}/projects/${canonicalSlug}`

    return {
      title: `${metaTitle} | 183 Housing Solutions`,
      description: metaDesc,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'en': `${siteUrl}/en/projects/${canonicalSlug}`,
          'vi': `${siteUrl}/vi/projects/${canonicalSlug}`,
          'x-default': `${siteUrl}/vi/projects/${canonicalSlug}`,
        },
      },
      robots: {
        index: p.projectSeoAllowIndexing !== false,
        follow: p.projectSeoAllowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        type: 'website',
        siteName: '183 Housing Solutions',
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }] : [],
      },
      twitter: { 
        card: 'summary_large_image', 
        title: ogTitle, 
        description: ogDesc, 
        images: ogImage ? [ogImage] : [] 
      },
    }
  } catch (error) {
    console.error('Project metadata error:', error)
    const currentCanonical = `${siteUrl}/${lang}/projects/${params.slug}`
    return { 
      title: 'Project | 183 Housing Solutions',
      alternates: { 
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/projects/${params.slug}`,
          'vi': `${siteUrl}/vi/projects/${params.slug}`,
          'x-default': `${siteUrl}/vi/projects/${params.slug}`,
        }
      },
      robots: { index: true, follow: true }
    }
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

  const lang = params.lang || 'vi'
  
  // Enforce correct slug for current language
  const projectSlugObj = (project.slug as Record<string, string>) || {}
  const expectedSlug = lang === 'en' 
    ? (projectSlugObj.en || projectSlugObj.vi || projectSlugObj.vn || params.slug)
    : (projectSlugObj.vi || projectSlugObj.vn || projectSlugObj.en || params.slug)
    
  if (expectedSlug && String(expectedSlug) !== String(params.slug)) {
    redirect(`/${lang}/projects/${expectedSlug}`)
  }

  const title = (project.title as Record<string, string>)?.en || String(project.title || 'Untitled')
  const description = (project.description as Record<string, string>)?.en || String(project.description || '')
  const images = (project.images as { url: string }[]) || []
  const location = String((project.location as Record<string, string>)?.en || project.location || '')
  const status = String(project.status || '')

  return <ProjectDetailClient project={project} />
}
