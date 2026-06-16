import ListingClientWrapper from '@/components/Listing/ListingClientWrapper'
import { fetchListingProperties } from '@/lib/serverFetch'
import type { Metadata } from 'next'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang || 'vi'
  const siteUrl = 'https://183housingsolutions.com'
  const currentCanonical = `${siteUrl}/${lang}/listing`

  return {
    title: 'Property Listings | 183 Housing Solutions',
    description: 'Browse all available properties for lease, sale, and home stay in Vietnam.',
    alternates: {
      canonical: currentCanonical,
      languages: {
        'en': `${siteUrl}/en/listing`,
        'vi': `${siteUrl}/vi/listing`,
        'x-default': `${siteUrl}/vi/listing`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ListingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : ''
  const projectId = typeof searchParams.projectId === 'string' ? searchParams.projectId : ''
  const zoneId = typeof searchParams.zoneId === 'string' ? searchParams.zoneId : ''
  const blockId = typeof searchParams.blockId === 'string' ? searchParams.blockId : ''
  const propertyType = typeof searchParams.propertyType === 'string' ? searchParams.propertyType : ''
  const bedrooms = typeof searchParams.bedrooms === 'string' ? searchParams.bedrooms : ''
  const bathrooms = typeof searchParams.bathrooms === 'string' ? searchParams.bathrooms : ''
  const currency = typeof searchParams.currency === 'string' ? searchParams.currency : ''
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''

  const params: Record<string, string> = {
    page: '1',
    limit: '10',
    sortBy: 'default'
  }

  if (type && type !== 'All') params.type = type
  if (keyword) params.keyword = keyword
  if (projectId) params.projectId = projectId
  if (zoneId) params.zoneId = zoneId
  if (blockId) params.blockId = blockId
  if (propertyType) params.propertyType = propertyType
  if (bedrooms) params.bedrooms = bedrooms
  if (bathrooms) params.bathrooms = bathrooms
  if (currency) params.currency = currency
  if (minPrice) params.minPrice = minPrice.replace(/,/g, '')
  if (maxPrice) params.maxPrice = maxPrice.replace(/,/g, '')

  let initialProperties = []
  let totalPages = 0

  try {
    const res = await fetchListingProperties(params)
    if (res.success) {
      initialProperties = (res.data as any) || []
      totalPages = (res as any).totalPages || 0
    }
  } catch (error) {
    console.error("Error fetching initial properties:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff]">
      <ListingClientWrapper 
        initialProperties={initialProperties}
        initialTotalPages={totalPages}
      />
    </div>
  )
}
