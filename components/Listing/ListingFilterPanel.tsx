'use client'

import React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

interface FilterState {
  type: string
  minPrice: string
  maxPrice: string
  location: string
  keyword: string
}

interface Props {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export default function ListingFilterPanel({ filters, onFilterChange }: Props) {
  const update = (key: keyof FilterState, value: string) =>
    onFilterChange({ ...filters, [key]: value })

  const hasActiveFilters =
    filters.type ||
    filters.location ||
    filters.keyword ||
    filters.minPrice ||
    filters.maxPrice

  const clearAll = () =>
    onFilterChange({
      type: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      keyword: '',
    })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={18} className="text-[#41398B]" />
        <span className="font-semibold text-gray-700 text-sm">
          Filter Properties
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Transaction type */}
        <select
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41398B] bg-white"
        >
          <option value="">All Types</option>
          <option value="Lease">For Lease</option>
          <option value="Sale">For Sale</option>
          <option value="Home Stay">Home Stay</option>
        </select>

        {/* Keyword / location search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search keyword or location..."
            value={filters.keyword}
            onChange={(e) => update('keyword', e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41398B] w-56"
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-2 text-sm text-[#41398B] border border-[#41398B] rounded-lg hover:bg-[#41398B] hover:text-white transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
