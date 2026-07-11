import { fetchPropertyById } from '@/lib/serverFetch'
import PropertyDetailClient from '@/components/Property/PropertyDetailClient'
import type { Metadata } from 'next'
import { getImageUrl } from '@/utils/baseURL'
import { stripHtml, safeVal } from '@/utils/display'
import { redirect } from 'next/navigation'

interface PageProps {
  params: { lang: string, slug: string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
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

    const getLocalVal = (obj: any) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      if (obj[lang]) return String(obj[lang])
      return String(safeVal(obj))
    }

    // 1. Get Title (Localized)
    const baseTitle = getLocalVal(listing.listingInformationPropertyTitle) || getLocalVal(property.title) || '183 Housing Solutions'
    const metaTitle = getLocalVal(seo.metaTitle) || baseTitle

    // 2. Get Description (Localized & Stripped of HTML)
    const rawDesc = getLocalVal(property.whatNearby?.whatNearbyDescription) || getLocalVal(property.description)
    const baseDesc = stripHtml(String(rawDesc)) || 'View property details on 183 Housing Solutions'
    const metaDescription = getLocalVal(seo.metaDescription) || baseDesc

    // 3. Get Image (Absolute URL)
    const propImages = property.imagesVideos?.propertyImages || []
    const baseImageUrl = getImageUrl(propImages[0])

    // 4. OG Specifics
    const ogTitle = getLocalVal(seo.ogTitle) || metaTitle
    const ogDescription = getLocalVal(seo.ogDescription) || metaDescription
    const ogImageVal = seo.ogImage || (seo.ogImages && seo.ogImages[0])
    const imageUrl = ogImageVal ? getImageUrl(ogImageVal) : baseImageUrl

    // 5. Get URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://183housingsolutions.com'
    const url = `${siteUrl}/listing/${slugArray.join('/')}`
    
    // Determine the ideal canonical URL
    let canonicalSlug = getLocalVal(seo.slugUrl) || 'property'
    if (canonicalSlug && propertyId && !canonicalSlug.toLowerCase().endsWith(propertyId.toLowerCase())) {
      canonicalSlug = `${canonicalSlug}-${propertyId}`
    }
    const idealCanonicalUrl = `${siteUrl}/${lang}/listing/${canonicalSlug}`
    
    let enSlug = seo.slugUrl?.en || 'property'
    if (enSlug && propertyId && !enSlug.toLowerCase().endsWith(propertyId.toLowerCase())) {
      enSlug = `${enSlug}-${propertyId}`
    }
    let viSlug = seo.slugUrl?.vi || 'property'
    if (viSlug && propertyId && !viSlug.toLowerCase().endsWith(propertyId.toLowerCase())) {
      viSlug = `${viSlug}-${propertyId}`
    }
    
    const enCanonicalUrl = `${siteUrl}/en/listing/${enSlug}`
    const viCanonicalUrl = `${siteUrl}/vi/listing/${viSlug}`

    return {
      title: `${metaTitle} | 183 Housing Solutions`,
      description: metaDescription,
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
        title: ogTitle,
        description: ogDescription,
        url,
        type: 'website',
        siteName: '183 Housing Solutions',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: ogTitle }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
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

export default async function PropertyDetailPage({ params, searchParams }: PageProps) {
  let property: Record<string, unknown> | null = null
  
  const slugArray = params.slug || []
  const lastSegment = slugArray[slugArray.length - 1] || ''
  // Property IDs follow the pattern: XXX-NNNN (e.g. LSE-0047, SAL-0001, HST-0003)
  const idMatch = lastSegment.match(/([A-Z]{3}-\d{3,})$/i)
  const propertyId = idMatch ? idMatch[1] : lastSegment

  const previewToken = typeof searchParams?.previewToken === 'string' ? searchParams.previewToken : undefined

  try {
    const res = await fetchPropertyById(propertyId, previewToken)
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

  const lang = params.lang || 'vi'
  const seo = (property.seoInformation as any) || {}
  
  // Enforce correct slug for current language
  let expectedSlug = seo.slugUrl?.[lang] || 'property'
  if (expectedSlug && propertyId && !expectedSlug.toLowerCase().endsWith(propertyId.toLowerCase())) {
    expectedSlug = `${expectedSlug}-${propertyId}`
  }
  
  const currentSlugPath = (params.slug || []).join('/')
  if (currentSlugPath && currentSlugPath !== expectedSlug) {
    // Redirect to the correct localized slug
    redirect(`/${lang}/listing/${expectedSlug}`)
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
