'use client'

import React, { useState, useMemo } from 'react'
import ListingFilterPanel from './ListingFilterPanel'
import PropertyCard from './PropertyCard'

interface FilterState {
  type: string
  minPrice: string
  maxPrice: string
  location: string
  keyword: string
}

const DEFAULT_FILTERS: FilterState = {
  type: '',
  minPrice: '',
  maxPrice: '',
  location: '',
  keyword: '',
}

export default function ListingClientWrapper({
  initialProperties,
}: {
  initialProperties: unknown[]
}) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return (initialProperties as Record<string, unknown>[]).filter((p) => {
      const listing =
        (p.listingInformation as Record<string, unknown>) || {}
      // Filter by transaction type (Lease / Sale / Home Stay)
      if (filters.type) {
        const txType = String(
          listing.listingInformationTransactionType || ''
        ).toLowerCase()
        if (!txType.includes(filters.type.toLowerCase())) return false
      }

      // Filter by location (zone/sub-area) or keyword search
      const searchTerm = (filters.keyword || filters.location).toLowerCase()
      if (searchTerm) {
        const title = String(
          (listing.listingInformationPropertyTitle as Record<string, unknown>)
            ?.en ||
            (listing.listingInformationPropertyTitle as Record<string, unknown>)
              ?.vi ||
            listing.listingInformationPropertyTitle ||
            listing.listingInformationBlockName ||
            ''
        ).toLowerCase()
        const zone = String(
          (listing.listingInformationZoneSubArea as Record<string, unknown>)
            ?.en ||
            (listing.listingInformationZoneSubArea as Record<string, unknown>)
              ?.vi ||
            listing.listingInformationZoneSubArea ||
            ''
        ).toLowerCase()
        const project = String(
          (listing.listingInformationProjectCommunity as Record<string, unknown>)
            ?.en ||
            (listing.listingInformationProjectCommunity as Record<string, unknown>)
              ?.vi ||
            listing.listingInformationProjectCommunity ||
            ''
        ).toLowerCase()
        if (
          !title.includes(searchTerm) &&
          !zone.includes(searchTerm) &&
          !project.includes(searchTerm)
        ) {
          return false
        }
      }

      return true
    })
  }, [initialProperties, filters])

  return (
    <div>
      <ListingFilterPanel filters={filters} onFilterChange={setFilters} />
      <p className="text-sm text-gray-500 mt-3 mb-2">
        {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found
      </p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-400 py-16">
            No properties found matching your filters
          </p>
        ) : (
          filtered.map((p) => (
            <PropertyCard
              key={String((p as Record<string, unknown>)._id)}
              property={p as Record<string, unknown>}
            />
          ))
        )}
      </div>
    </div>
  )
}
