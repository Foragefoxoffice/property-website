import { fetchAllProjects, fetchProjectCategories, fetchProjectPage } from '@/lib/serverFetch'
import ProjectPageClient from '@/components/Projects/ProjectPageClient'
import { getImageUrl } from '@/utils/baseURL'
import type { Metadata } from 'next'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/projects`
  try {
    const res = await fetchProjectPage()
    const data = (res.data as Record<string, any>) || {}

    const getLocalVal = (enKey: string, vnKey: string, fallback: string) => {
      const val = lang === 'en' ? (data[enKey] || data[vnKey]) : (data[vnKey] || data[enKey])
      return val ? String(val) : fallback
    }

    const metaTitle = getLocalVal('projectSeoMetaTitle_en', 'projectSeoMetaTitle_vn', 'Projects | 183 Housing Solutions')
    const metaDesc = getLocalVal('projectSeoMetaDescription_en', 'projectSeoMetaDescription_vn', 'Explore real estate development projects by 183 Housing Solutions in Vietnam.')
    const ogTitle = getLocalVal('projectSeoOgTitle_en', 'projectSeoOgTitle_vn', metaTitle)
    const ogDesc = getLocalVal('projectSeoOgDescription_en', 'projectSeoOgDescription_vn', metaDesc)

    return {
      title: metaTitle,
      description: metaDesc,
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/projects`,
          'vi': `${siteUrl}/vi/projects`,
          'x-default': `${siteUrl}/vi/projects`,
        },
      },
      robots: {
        index: data.projectSeoAllowIndexing !== false,
        follow: data.projectSeoAllowIndexing !== false,
      },
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        url: currentCanonical,
        images: data.projectSeoOgImage ? [{ url: getImageUrl(data.projectSeoOgImage), width: 1200, height: 630, alt: ogTitle }] : [],
      }
    }
  } catch {
    return {
      title: 'Projects | 183 Housing Solutions',
      description: 'Explore real estate development projects by 183 Housing Solutions in Vietnam.',
      alternates: {
        canonical: currentCanonical,
        languages: {
          'en': `${siteUrl}/en/projects`,
          'vi': `${siteUrl}/vi/projects`,
          'x-default': `${siteUrl}/vi/projects`,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export const revalidate = 0

export default async function ProjectsPage() {
  let projects: unknown[] = []
  let categories: unknown[] = []
  let cmsData: Record<string, unknown> = {}

  try {
    const [projRes, catRes, cmsRes] = await Promise.all([
      fetchAllProjects(),
      fetchProjectCategories(),
      fetchProjectPage(),
    ])
    projects = (projRes.data as unknown[]) || []
    categories = (catRes.data as unknown[]) || []
    cmsData = (cmsRes.data as Record<string, unknown>) || {}
  } catch (error) {
    console.error('Error fetching projects data:', error)
  }

  return (
    <ProjectPageClient
      initialProjects={projects as any}
      initialCategories={categories as any}
      cmsData={cmsData}
    />
  )
}
