import { fetchPropertyById } from '@/lib/serverFetch'
import PropertyDetailClient from '@/components/Property/PropertyDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string; slug?: string[] }
}

export const revalidate = 300

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetchPropertyById(params.id)
    const property = res.data as Record<string, unknown>
    const listing = (property.listingInformation as Record<string, unknown>) || {}

    const title = String(property.title || listing.title || '183 Housing Solutions')
    const description = String(property.description || listing.description || 'View property details on 183 Housing Solutions')
    const images = (property.images as { url: string }[]) || []
    const imageUrl = images[0]?.url || ''
    const slug = params.slug?.[0] || String(property.slug || params.id)
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://183housingsolutions.com'}/property-showcase/${params.id}/${slug}`

    return {
      title: `${title} | 183 Housing Solutions`,
      description,
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
  } catch {
    return {
      title: 'Property | 183 Housing Solutions',
      description: 'Real estate listings in Vietnam',
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
