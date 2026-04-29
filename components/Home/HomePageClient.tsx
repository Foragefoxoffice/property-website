'use client'

import Link from 'next/link'
import PropertyCard from '@/components/Listing/PropertyCard'

interface HomePageClientProps {
  cmsData: Record<string, unknown>
  featuredProperties: unknown[]
}

export default function HomePageClient({ cmsData, featuredProperties }: HomePageClientProps) {
  const banner = (cmsData.banner as Record<string, unknown>) || {}
  const bannerTitle = String(banner.title || '183 Housing Solutions')
  const bannerSubtitle = String(banner.subtitle || 'Find your perfect home in Vietnam')
  const bannerImage = String(banner.image || '')

  return (
    <div>
      {/* Hero banner */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-[#41398B] overflow-hidden">
        {bannerImage && (
          <div className="absolute inset-0">
            <img src={bannerImage} alt="" className="w-full h-full object-cover opacity-30" />
          </div>
        )}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            {bannerTitle}
          </h1>
          <p className="text-lg text-white/80 mb-8">{bannerSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listing"
              className="px-8 py-3 bg-white text-[#41398B] font-bold rounded-full hover:bg-[#E8E8FF] transition text-sm">
              Browse Properties
            </Link>
            <Link href="/contact"
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#41398B] transition text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      {featuredProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Featured Properties</h2>
            <Link href="/listing" className="text-sm text-[#41398B] font-semibold hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProperties.map((p) => (
              <PropertyCard key={String((p as Record<string, unknown>)._id)} property={p as Record<string, unknown>} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#F7F6F9] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Looking for the perfect property?</h2>
          <p className="text-gray-500 mb-6">Our team is ready to help you find your ideal home in Vietnam.</p>
          <Link href="/contact"
            className="inline-block px-8 py-3 bg-[#41398B] text-white font-bold rounded-full hover:bg-[#41398be1] transition">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
