import { fetchPropertyById } from '@/lib/serverFetch'
import PropertyDetailClient from '@/components/Property/PropertyDetailClient'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'

interface PageProps {
  params: { lang: string, slug: string[] }
}

export const revalidate = 0

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const lang = params.lang || 'vi'
  try {
    const slugArray = params.slug || []
    const lastSegment = slugArray[slugArray.length - 1] || ''
    // Property IDs follow the pattern: XXX-NNNN (e.g. LSE-0047, SAL-0001, HST-0003)
    const idMatch = lastSegment.match(/([A-Z]{3}-\d{3,})$/i)
    const propertyId = idMatch ? idMatch[1] : lastSegment

    const res = await fetchPropertyById(propertyId)
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://183housingsolutions.com'
    const url = `${siteUrl}/listing/${slugArray.join('/')}`
    
    // Determine the ideal canonical URL
    const canonicalSlug = safeVal(seo.slugUrl) || 'property'
    const idealCanonicalUrl = `${siteUrl}/${lang}/listing/${canonicalSlug}-${propertyId}`
    
    const enCanonicalUrl = `${siteUrl}/en/listing/${canonicalSlug}-${propertyId}`
    const viCanonicalUrl = `${siteUrl}/vi/listing/${canonicalSlug}-${propertyId}`

    return {
      title: `${title} | 183 Housing Solutions`,
      description,
      alternates: {
        canonical: idealCanonicalUrl,
        languages: {
          'en': enCanonicalUrl,
          'vi': viCanonicalUrl,
          'x-default': viCanonicalUrl,
        },
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
    const slugArray = params.slug || []
    const fbUrl = `${siteUrl}/${lang}/listing/${slugArray.join('/')}`
    const enFbUrl = `${siteUrl}/en/listing/${slugArray.join('/')}`
    const viFbUrl = `${siteUrl}/vi/listing/${slugArray.join('/')}`
    return {
      title: 'Property | 183 Housing Solutions',
      description: 'Real estate listings in Vietnam',
      alternates: { 
        canonical: fbUrl,
        languages: {
          'en': enFbUrl,
          'vi': viFbUrl,
          'x-default': viFbUrl,
        }
      },
      robots: { index: true, follow: true }
    }
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  let property: Record<string, unknown> | null = null
  try {
    const slugArray = params.slug || []
    const lastSegment = slugArray[slugArray.length - 1] || ''
    // Property IDs follow the pattern: XXX-NNNN (e.g. LSE-0047, SAL-0001, HST-0003)
    const idMatch = lastSegment.match(/([A-Z]{3}-\d{3,})$/i)
    const propertyId = idMatch ? idMatch[1] : lastSegment

    const res = await fetchPropertyById(propertyId)
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

  const listingInfo = (property.listingInformation as any) || {}
  const propInfo = (property.propertyInformation as any) || {}
  const finInfo = (property.financialDetails as any) || {}
  
  const title = String(listingInfo.listingInformationPropertyTitle?.en || listingInfo.listingInformationPropertyTitle?.vi || property.title || 'Real Estate Listing')
  const images = (property.imagesVideos as any)?.propertyImages || []
  const imageUrl = getImageUrl(images[0])
  const price = Number(finInfo.financialDetailsPrice || finInfo.financialDetailsLeasePrice || finInfo.financialDetailsPricePerNight || 0)
  const currency = finInfo.financialDetailsCurrency?.code || 'VND'
  const bedrooms = Number(propInfo.informationBedrooms || 0)
  const size = Number(propInfo.informationUnitSize || 0)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: currency
    },
    numberOfRooms: bedrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: size,
      unitCode: 'MTK' // Square meters
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PropertyDetailClient property={property} />
    </>
  )
}
