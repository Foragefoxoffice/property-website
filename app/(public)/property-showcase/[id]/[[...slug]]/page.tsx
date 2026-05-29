import { fetchPropertyById } from '@/lib/serverFetch'
import PropertyDetailClient from '@/components/Property/PropertyDetailClient'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'

interface PageProps {
  params: { id: string; slug?: string[] }
}

export const revalidate = 300

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetchPropertyById(params.id)
    const property = res.data as Record<string, any>
    const listing = property.listingInformation || {}
    const seo = property.seoInformation || {}

    // 1. Get Title (Localized)
    const title = String(safeVal(listing.listingInformationPropertyTitle) || property.title || '183 Housing Solutions')

    // 2. Get Description (Localized & Stripped of HTML)
    const rawDesc = safeVal(property.whatNearby?.whatNearbyDescription) || safeVal(property.description)
    const description = stripHtml(rawDesc) || 'View property details on 183 Housing Solutions'

    // 3. Get Image (Absolute URL)
    const propImages = property.imagesVideos?.propertyImages || []
    const imageUrl = getImageUrl(propImages[0])

    // 4. Get URL
    const slug = String(params.slug?.[0] || safeVal(seo.slugUrl) || params.id)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://183housingsolutions.com'
    const url = `${siteUrl}/property-showcase/${params.id}/${slug}`

    return {
      title: `${title} | 183 Housing Solutions`,
      description,
      alternates: {
        canonical: String(safeVal(seo.canonicalUrl) || url),
      },
      robots: {
        index: seo.allowIndexing !== false,
        follow: seo.allowIndexing !== false,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        siteName: '183 Housing Solutions',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://183housingsolutions.com'
    const fbUrl = `${siteUrl}/property-showcase/${params.id}${params.slug?.[0] ? `/${params.slug[0]}` : ''}`
    return {
      title: 'Property | 183 Housing Solutions',
      description: 'Real estate listings in Vietnam',
      alternates: { canonical: fbUrl },
      robots: { index: true, follow: true }
    }
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  let property: Record<string, unknown> | null = null
  try {
    const res = await fetchPropertyById(params.id)
    property = res.data as Record<string, unknown>
  } catch {
    property = null
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-2xl font-bold text-gray-700">Property Not Found</h1>
        <p className="text-gray-400 mt-2">This listing may have been removed or does not exist.</p>
      </div>
    )
  }

  return <PropertyDetailClient property={property} />
}
