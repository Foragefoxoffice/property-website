'use client'

import Link from 'next/link'
import { Heart, MapPin, BedDouble, Bath } from 'lucide-react'
import { useFavorites } from '@/context/FavoritesContext'

export default function PropertyCard({ property }: { property: Record<string, unknown> }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  const id = String(property._id || '')
  const listing = (property.listingInformation as Record<string, unknown>) || {}
  const title = String(property.title || listing.title || 'Untitled Property')
  const price = String(listing.price || listing.listingPrice || listing.rentalPrice || '')
  const type = String(listing.listingType || '')
  const location = String(listing.zone || listing.area || listing.location || '')
  const images = (property.images as { url: string }[]) || []
  const thumbnail = images[0]?.url || '/images/dummy-img.jpg'
  const slug = String(property.slug || id)
  const bedrooms = String(listing.bedrooms || listing.numberOfBedrooms || '')
  const bathrooms = String(listing.bathrooms || listing.numberOfBathrooms || '')
  const favorited = isFavorite(id)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition duration-200">
      <div className="relative h-48 overflow-hidden">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        <button
          onClick={(e) => { e.preventDefault(); if (favorited) { removeFavorite(id) } else { addFavorite(property) } }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition">
          <Heart size={16} className={favorited ? 'fill-[#41398B] text-[#41398B]' : 'text-gray-400'} />
        </button>
        {type && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-[#41398B] text-white text-[11px] font-medium rounded-full">{type}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{title}</h3>
        {location && <p className="flex items-center gap-1 text-xs text-gray-500 mb-2"><MapPin size={12} />{location}</p>}
        {(bedrooms || bathrooms) && (
          <div className="flex gap-3 text-xs text-gray-500 mb-2">
            {bedrooms && <span className="flex items-center gap-1"><BedDouble size={12} />{bedrooms}</span>}
            {bathrooms && <span className="flex items-center gap-1"><Bath size={12} />{bathrooms}</span>}
          </div>
        )}
        {price && <p className="text-[#41398B] font-bold text-sm mb-3">{price}</p>}
        <Link href={`/property-showcase/${id}/${slug}`}
          className="block w-full text-center py-2 border-2 border-[#41398B] text-[#41398B] rounded-xl text-xs font-semibold hover:bg-[#41398B] hover:text-white transition">
          View Details
        </Link>
      </div>
    </div>
  )
}
