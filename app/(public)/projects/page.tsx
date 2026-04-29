import { fetchAllProjects, fetchProjectCategories, fetchProjectPage } from '@/lib/serverFetch'
import ProjectPageClient from '@/components/Projects/ProjectPageClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchProjectPage()
    const data = (res.data as any) || {}
    return {
      title: data.projectSeoMetaTitle_en || 'Projects | 183 Housing Solutions',
      description: data.projectSeoMetaDescription_en || 'Explore real estate development projects by 183 Housing Solutions in Vietnam.',
      openGraph: {
        title: data.projectSeoOgTitle_en || data.projectSeoMetaTitle_en,
        description: data.projectSeoOgDescription_en || data.projectSeoMetaDescription_en,
        images: data.projectSeoOgImage ? [data.projectSeoOgImage] : [],
      }
    }
  } catch {
    return {
      title: 'Projects | 183 Housing Solutions',
      description: 'Explore real estate development projects by 183 Housing Solutions in Vietnam.',
    }
  }
}

export const revalidate = 300

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

