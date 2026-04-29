// app/(public)/listing/page.tsx
import { fetchAllProperties } from '@/lib/serverFetch'
import ListingClientWrapper from '@/components/Listing/ListingClientWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Listings | 183 Housing Solutions',
  description: 'Browse all available properties for lease, sale, and home stay in Vietnam.',
}

export default async function ListingPage() {
  let properties: unknown[] = []
  try {
    const res = await fetchAllProperties()
    properties = res.data || []
  } catch {
    properties = []
  }

  return (
    <div className="min-h-screen bg-[#F7F6F9]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#41398B] mb-6">Property Listings</h1>
        <ListingClientWrapper initialProperties={properties} />
      </div>
    </div>
  )
}
