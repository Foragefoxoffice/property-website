import { fetchHomeCms, fetchListingProperties } from '@/lib/serverFetch'
import HomePageClient from '@/components/Home/HomePageClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchHomeCms()
    const data = (res.data as any) || {}

    return {
      title: data.homeSeoMetaTitle_en || '183 Housing Solutions — Find Your Home in Vietnam',
      description:
        data.homeSeoMetaDescription_en ||
        'Browse properties for lease, sale, and home stay in Vietnam.',
      openGraph: {
        title: data.homeSeoOgTitle_en || data.homeSeoMetaTitle_en,
        description:
          data.homeSeoOgDescription_en ||
          data.homeSeoMetaDescription_en,
        images: data.homeSeoOgImage ? [data.homeSeoOgImage] : [],
      },
    }
  } catch {
    return {
      title: '183 Housing Solutions — Find Your Home in Vietnam',
      description:
        'Browse properties for lease, sale, and home stay in Vietnam.',
    }
  }
}

export default async function HomePage() {
  let cmsData: Record<string, unknown> = {}
  let featuredProperties: unknown[] = []

  try {
    // 👇 Add this delay to show loader on refresh
    await new Promise(resolve => setTimeout(resolve, 1500))

    const [cms, props] = await Promise.all([
      fetchHomeCms(),
      fetchListingProperties({
        page: '1',
        limit: '6',
        sortBy: 'newest',
      }),
    ])

    cmsData = (cms.data as Record<string, unknown>) || {}
    featuredProperties = (props.data as unknown[]) || []
  } catch {
    // render empty state
  }

  return (
    <HomePageClient
      cmsData={cmsData}
      featuredProperties={featuredProperties}
    />
  )
}