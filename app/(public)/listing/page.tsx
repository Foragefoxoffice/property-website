import ListingClientWrapper from '@/components/Listing/ListingClientWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Listings | 183 Housing Solutions',
  description: 'Browse all available properties for lease, sale, and home stay in Vietnam.',
  alternates: {
    canonical: 'https://183housingsolutions.com/listing',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ListingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff]">
      <ListingClientWrapper />
    </div>
  )
}
