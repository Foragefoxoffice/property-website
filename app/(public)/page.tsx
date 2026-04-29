import { fetchHomeCms, fetchListingProperties } from '@/lib/serverFetch'
import HomePageClient from '@/components/Home/HomePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '183 Housing Solutions — Find Your Home in Vietnam',
  description: 'Browse properties for lease, sale, and home stay in Vietnam.',
  openGraph: {
    title: '183 Housing Solutions',
    description: 'Find your perfect home in Vietnam',
    siteName: '183 Housing Solutions',
  },
}

export default async function HomePage() {
  let cmsData: Record<string, unknown> = {}
  let featuredProperties: unknown[] = []

  try {
    const [cms, props] = await Promise.all([
      fetchHomeCms(),
      fetchListingProperties({ page: '1', limit: '6', sortBy: 'newest' }),
    ])
    cmsData = (cms.data as Record<string, unknown>) || {}
    featuredProperties = (props.data as unknown[]) || []
  } catch {
    // render with empty state
  }

  return <HomePageClient cmsData={cmsData} featuredProperties={featuredProperties} />
}
