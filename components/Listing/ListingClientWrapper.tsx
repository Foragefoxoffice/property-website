'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, Skeleton, Tooltip, Pagination, ConfigProvider } from 'antd'
import { Heart, SlidersHorizontal } from 'lucide-react'
import {
  getListingProperties,
  getAllProperties,
  getAllZoneSubAreas,
  getAllBlocks,
  getAllPropertyTypes,
  getAllCurrencies,
} from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { translations } from '@/language/translations'
import { formatNumber, stripHtml } from '@/utils/display'
import { getAssetBaseURL } from '@/utils/baseURL'
import Link from '@/components/LanguageLink'
import Image from 'next/image'

const BASE = getAssetBaseURL()

function imgUrl(path: string) {
  if (!path) return '/images/property/dummy-img.avif'
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}

function loc(val: unknown, lang: string): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  const v = val as Record<string, string>
  return lang === 'vi' ? (v.vi || v.en || '') : (v.en || v.vi || '')
}

function txBadgeColor(cat: string) {
  const c = cat.toLowerCase()

  // Lease / Cho thuê
  if (
    c.includes('lease') ||
    c.includes('rent') ||
    c.includes('cho thuê')
  ) {
    return 'bg-[#058135]'
  }

  // Sale / Bán
  if (
    c.includes('sale') ||
    c.includes('sell') ||
    c.includes('bán')
  ) {
    return 'bg-[#eb4d4d]'
  }

  // Homestay
  if (
    c.includes('home stay') ||
    c.includes('homestay')
  ) {
    return 'bg-[#055381]'
  }

  return 'bg-[#055381]'
}

type Prop = Record<string, unknown>

function PropertyCard({
  property,
  language,
  t,
  selectedCategory,
  isFav,
  onToggleFav,
}: {
  property: Prop
  language: string
  t: Record<string, string>
  selectedCategory: string
  isFav: boolean
  onToggleFav: (e: React.MouseEvent, p: Prop) => void
}) {
  const listing = (property.listingInformation as Prop) || {}
  const financial = (property.financialDetails as Prop) || {}
  const propInfo = (property.propertyInformation as Prop) || {}
  const seo = (property.seoInformation as Prop) || {}
  const visListing = (property.listingInformationVisibility as Prop) || {}
  const visFin = (property.financialVisibility as Prop) || {}

  const propDisplayId = String(listing.listingInformationPropertyId || property._id)
  const slug = loc(seo.slugUrl, language)
  const url = `/listing/${slug ? slug + '-' : ''}${propDisplayId}`

  const rawTxType = loc(
    listing.listingInformationTransactionType,
    'en'
  )

  const txType =
    language === 'vi'
      ? rawTxType === 'Lease'
        ? 'Cho thuê'
        : rawTxType === 'Sale'
          ? 'Bán'
          : rawTxType === 'Home Stay'
            ? 'Homestay'
            : rawTxType
      : rawTxType
  const propType = loc(listing.listingInformationPropertyType, language)
  const title =
    (!property.titleVisibility
      ? loc(listing.listingInformationPropertyTitle, language) ||
      loc(listing.listingInformationBlockName, language) ||
      loc(listing.listingInformationProjectCommunity, language)
      : '') || t.untitledProperty || 'Untitled Property'

  const nearbyDesc = loc((property.whatNearby as Prop)?.whatNearbyDescription, language)
  const zoneDesc = !visListing.areaZone ? loc(listing.listingInformationZoneSubArea, language) : ''
  const descHtml = nearbyDesc || zoneDesc || ''

  const beds = Number(propInfo.informationBedrooms || 0)
  const baths = Number(propInfo.informationBathrooms || 0)
  const sqft = Number(propInfo.informationUnitSize || 0)

  const img = (property.imagesVideos as Record<string, string[]>)?.propertyImages?.[0] || ''

  // Price logic
  const currencyRaw = financial.financialDetailsCurrency
  const currencyCode = (typeof currencyRaw === 'object' ? (currencyRaw as Prop)?.code : currencyRaw) as string || ''
  const dispCurrency = visFin.currency ? '' : currencyCode

  const priceSale = financial.financialDetailsPrice as number
  const priceLease = financial.financialDetailsLeasePrice as number
  const priceNight = financial.financialDetailsPricePerNight as number
  const genericPrice = financial.financialDetailsPrice as number

  const cType = String(txType || '').toLowerCase()
  const isSale = cType.includes('sale') || cType.includes('sell') || cType.includes('bán')
  const isLease = cType.includes('lease') || cType.includes('rent') || cType.includes('cho thuê')
  const isHomeStay = cType.includes('home stay') || cType.includes('homestay')

  let isPriceHidden = false
  if (isSale && visFin.price) isPriceHidden = true
  else if (isLease && visFin.leasePrice) isPriceHidden = true
  else if (isHomeStay && visFin.pricePerNight) isPriceHidden = true

  const fmtP = (p: number) => `${formatNumber(p)} ${dispCurrency}`.trim()
  let displayPrice = t.contactForPrice || 'Contact for price'
  let displaySuffix = ''
  if (!isPriceHidden) {
    if (isSale && priceSale) {
      displayPrice = fmtP(priceSale)
    } else if (isLease && priceLease) {
      displayPrice = fmtP(priceLease)
      displaySuffix = '/ month'
    } else if (isHomeStay && priceNight) {
      displayPrice = fmtP(priceNight)
      displaySuffix = '/ night'
    } else if (genericPrice) {
      displayPrice = fmtP(genericPrice)
      if (selectedCategory === 'Lease') displaySuffix = '/ month'
      else if (selectedCategory === 'Home Stay') displaySuffix = '/ night'
    }
  }

  return (
    <Link
      href={url}
      target="_blank"
      onClick={(e) => {
        e.preventDefault();
        const targetHref = e.currentTarget.getAttribute('href');
        if (targetHref) {
          const langPrefix = window.location.pathname.split('/')[1] || 'vi';
          window.open(`/${langPrefix}/redirect?url=${encodeURIComponent(targetHref)}`, '_blank');
        }
      }}
      className="card-house style-default hover-image group bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500 cursor-pointer flex flex-col h-full border border-gray-100"
    >
      {/* Image */}
      <div className="relative img-style article-thumb h-56 overflow-hidden rounded-2xl flex-shrink-0">
        <Image
          src={img ? imgUrl(img) : '/images/property/dummy-img.avif'}
          alt={title}
          fill
          quality={75}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-2xl"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {txType && !visListing.transactionType && (
            <span className={`px-2 py-1.5 text-[11px] ${txBadgeColor(txType)} text-white font-bold uppercase tracking-wider rounded-sm shadow-lg`}>
              {txType}
            </span>
          )}
          {propType && !visListing.transactionType && (
            <span className="px-2 py-1.5 text-[11px] bg-[#41398B]/90 text-white font-bold uppercase tracking-wider rounded-sm shadow-lg">
              {propType}
            </span>
          )}
        </div>
        {/* Favorite */}
        <div className="absolute top-3 right-3 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFav(e, property)
            }}
            className="p-1 bg-white rounded-md shadow-sm text-black hover:scale-105 transition-transform cursor-pointer"
          >
            <Tooltip title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}>
              <Heart size={16} className={isFav ? 'fill-[#eb4d4d] text-[#eb4d4d]' : 'text-[#2a2a2a]'} />
            </Tooltip>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-2 pb-5 px-3 flex flex-col flex-1">
        {/* Price */}
        <div className="flex items-baseline gap-1 mb-0">
          <span className="text-[20px] font-bold text-[#2a2a2a]">{displayPrice}</span>
          {displaySuffix && !isPriceHidden && (
            <span className="text-md text-gray-500 font-medium">{displaySuffix}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="md:text-[17px] text-[15px] font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#41398B] transition-colors">
          {title}
        </h3>

        {/* Description */}
        {descHtml && !property.descriptionVisibility && (
          <p className="md:text-[14px] text-[14px] text-gray-500 mb-4 line-clamp-2">
            {stripHtml(descHtml)}
          </p>
        )}

        {/* Bed / Bath / Sqft */}
        {(beds > 0 || baths > 0 || sqft > 0) && (
          <div className="flex items-center pt-3 border-t border-gray-200 justify-between mt-auto">
            {beds > 0 && (
              <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                <svg className="w-5 h-5 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M5 7v10M19 7v10M3 17h18M7 10h4a2 2 0 012 2v5M7 10a2 2 0 00-2 2v5" />
                </svg>
                <span className="font-medium text-[12px]">
                  {beds} {language === 'vi' ? 'Ngủ' : 'Bed'}
                </span>
              </div>
            )}
            {baths > 0 && (
              <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                <svg className="w-5 h-5 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 14h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM6 14V9a3 3 0 0 1 6 0" />
                </svg>
                <span className="font-medium text-[12px]">
                  {baths} {language === 'vi' ? 'Vệ sinh' : 'Bath'}
                </span>
              </div>
            )}
            {sqft > 0 && (
              <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                <svg className="w-5 h-5 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 4.6a2 2 0 0 1 0 2.8l-12 12a2 2 0 0 1-2.8 0l-2-2a2 2 0 0 1 0-2.8l12-12a2 2 0 0 1 2.8 0zM12 7l2 2M10 9l2 2M8 11l2 2" />
                </svg>
                <span className="font-medium text-[12px]">
                  {formatNumber(sqft)} m2
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

function ListingInner({
  initialProperties,
  initialTotalPages,
  initialTotalItems,
}: {
  initialProperties?: any[]
  initialTotalPages?: number
  initialTotalItems?: number
}) {
  const { language } = useLanguage()
  const t = (translations[language as keyof typeof translations] || translations.en) as Record<string, string>
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const type = searchParams.get('type') || ''
    return ['Lease', 'Sale', 'Home Stay'].includes(type) ? type : 'All'
  })

  useEffect(() => {
    const type = searchParams.get('type') || ''

    if (['Lease', 'Sale', 'Home Stay'].includes(type)) {
      setSelectedCategory(type)
    } else {
      setSelectedCategory('All')
    }
  }, [searchParams])

  const [properties, setProperties] = useState<Prop[]>(initialProperties || [])
  const [loading, setLoading] = useState(!initialProperties)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalProperties, setTotalProperties] = useState(initialTotalItems || 0)

  const [projects, setProjects] = useState<Prop[]>([])
  const [zones, setZones] = useState<Prop[]>([])
  const [blocks, setBlocks] = useState<Prop[]>([])
  const [projectsAll, setProjectsAll] = useState<Prop[]>([])
  const [zonesAll, setZonesAll] = useState<Prop[]>([])
  const [blocksAll, setBlocksAll] = useState<Prop[]>([])
  const [propertyTypes, setPropertyTypes] = useState<Prop[]>([])
  const [currencies, setCurrencies] = useState<Prop[]>([])

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    projectId: searchParams.get('projectId') || '',
    zoneId: searchParams.get('zoneId') || '',
    blockId: searchParams.get('blockId') || '',
    propertyType: searchParams.get('propertyType') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    currency: searchParams.get('currency') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  })
  const [sortBy, setSortBy] = useState('default')

  // Load dropdown data
  useEffect(() => {
    Promise.all([getAllProperties(), getAllZoneSubAreas(), getAllBlocks(), getAllPropertyTypes(), getAllCurrencies()])
      .then(([pr, zr, br, tr, cr]) => {
        const active = (arr: unknown[]) => (arr as Prop[]).filter(x => x.status === 'Active')
        const pa = active(pr.data?.data || [])
        const za = active(zr.data?.data || [])
        const ba = active(br.data?.data || [])
        setProjectsAll(pa); setProjects(pa)
        setZonesAll(za); setZones(za)
        setBlocksAll(ba); setBlocks(ba)
        setPropertyTypes(active(tr.data?.data || []))
        setCurrencies(active(cr.data?.data || []))
      })
      .catch(() => { })
  }, [])

  // Cascade: project → zones
  useEffect(() => {
    if (!filters.projectId) { setZones([]); setBlocks([]); return }
    const proj = projectsAll.find(p => loc(p.name, language) === filters.projectId)
    const pid = proj?._id as string
    setZones(pid ? zonesAll.filter(z => (typeof z.property === 'string' ? z.property : (z.property as Prop)?._id) === pid) : [])
    setBlocks([])
  }, [filters.projectId, projectsAll, zonesAll, language])

  // Cascade: zone → blocks
  useEffect(() => {
    if (!filters.zoneId) { setBlocks([]); return }
    const zone = zonesAll.find(z => loc(z.name, language) === filters.zoneId)
    const zid = zone?._id as string
    setBlocks(zid ? blocksAll.filter(b => (typeof b.zone === 'string' ? b.zone : (b.zone as Prop)?._id) === zid) : [])
  }, [filters.zoneId, zonesAll, blocksAll, language])

  const fetchProperties = useCallback(async (currentPage: number, isNew = false, filterOverrides?: typeof filters) => {
    if (isNew) setLoading(true)
    else setLoadingMore(true)
    try {
      const active = filterOverrides || filters
      const params: Record<string, string | number> = {
        type: selectedCategory === 'All' ? '' : selectedCategory,
        page: currentPage,
        limit: 20,
        sortBy,
      }
      if (active.keyword) params.keyword = active.keyword
      if (active.projectId) params.projectId = active.projectId
      if (active.zoneId) params.zoneId = active.zoneId
      if (active.blockId) params.blockId = active.blockId
      if (active.propertyType) params.propertyType = active.propertyType
      if (active.bedrooms) params.bedrooms = active.bedrooms
      if (active.bathrooms) params.bathrooms = active.bathrooms
      if (active.currency) params.currency = active.currency
      if (active.minPrice) params.minPrice = active.minPrice.replace(/,/g, '')
      if (active.maxPrice) params.maxPrice = active.maxPrice.replace(/,/g, '')

      const res = await getListingProperties(params)
      if (res.data?.success) {
        const incoming = res.data.data as Prop[]
        const totalItems = res.data.total || 0
        setProperties(incoming)
        setTotalProperties(totalItems)
      }
    } catch { }
    finally { setLoading(false); setLoadingMore(false) }
  }, [selectedCategory, filters, sortBy])

  const isFirstMountCategory = useRef(true)
  // Reset + fetch on category change
  useEffect(() => {
    if (isFirstMountCategory.current && initialProperties) {
      isFirstMountCategory.current = false
      return
    }
    setProperties([]); setPage(1)
    fetchProperties(1, true)
  }, [selectedCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const isFirstMountSort = useRef(true)
  // Reset + fetch on sort change
  useEffect(() => {
    if (isFirstMountSort.current && initialProperties) {
      isFirstMountSort.current = false
      return
    }
    setProperties([]); setPage(1)
    fetchProperties(1, true)
  }, [sortBy]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchProperties(newPage, true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setProperties([]); setPage(1)
    fetchProperties(1, true)
  }

  const handleClear = () => {
    const empty = { keyword: '', projectId: '', zoneId: '', blockId: '', propertyType: '', bedrooms: '', bathrooms: '', currency: '', minPrice: '', maxPrice: '' }
    setFilters(empty)
    setZones([]); setBlocks([])
    setProperties([]); setPage(1)
    fetchProperties(1, true, empty)
  }

  const setFilter = (key: string, value: string) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'projectId') { next.zoneId = ''; next.blockId = '' }
      if (key === 'zoneId') next.blockId = ''
      return next
    })
  }

  const handleToggleFav = (e: React.MouseEvent, property: Prop) => {
    e.preventDefault(); e.stopPropagation()
    const id = String(property._id)
    if (isFavorite(id)) removeFavorite(id)
    else addFavorite(property)
  }

  const tabClass = (cat: string) =>
    `w-full md:w-auto px-4 py-4 md:py-3 md:px-10 rounded-t-lg font-bold text-sm md:text-base cursor-pointer transition-all border-none ${selectedCategory === cat ? 'bg-[#41398B] text-white shadow-lg' : 'bg-[#515151] text-white hover:bg-gray-600'
    }`

  return (
    <div className="max-w-7xl md:px-0 px-4 mx-auto py-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm mb-5">
        <Link href="/" className="text-gray-500 hover:text-[#41398B] font-medium transition-colors">{t.home || 'Home'}</Link>
        <span className="text-gray-300">/</span>
        <span className="text-[#41398B] font-semibold">{t.properties || 'Properties'}</span>
      </div>

      <div className="flex flex-col gap-10">
        {/* Filter sidebar */}
        <aside className="w-full">
          {/* Tabs */}
          <div className="bg-transparent pb-0 px-0">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:flex gap-3 justify-center">
              {['All', 'Lease', 'Sale', 'Home Stay'].map(cat => (
                <button key={cat} className={tabClass(cat)} onClick={() => setSelectedCategory(cat)}>
                  {cat === 'All' ? (t.viewAll || 'View All') : cat === 'Lease' ? (t.forRent || 'For Lease') : cat === 'Sale' ? (t.forSale || 'For Sale') : (t.homestay || 'Homestay')}
                </button>
              ))}
            </div>
          </div>

          {/* Filter card */}
          <div className="bg-white rounded-2xl shadow-sm md:p-8 p-4 border border-gray-100">


            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
              {/* Keyword */}
              <div>
                <label className="block text-[15px] font-bold text-black mb-3">{t.lookingFor || 'Looking For'}</label>
                <input
                  type="text"
                  className="w-full px-4 py-[11px] border border-[#d1d5dc] rounded-lg text-[15px] bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all font-medium"
                  placeholder={language === 'en' ? 'Search keyword' : 'Từ khóa tìm kiếm'}
                  value={filters.keyword}
                  onChange={e => setFilter('keyword', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                />
              </div>

              {/* Project */}
              <div className={showFilters ? 'block' : 'hidden md:block'}>
                <label className="block text-[15px] font-bold text-black mb-3">{t.projectCommunity || 'Project / Community'}</label>
                <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.projectId || undefined} onChange={v => setFilter('projectId', v || '')}
                  placeholder={language === 'en' ? 'Select Project' : 'Chọn Dự Án'} style={{ width: '100%' }} size="large" allowClear showSearch
                  filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                  {projects.map(p => <Select.Option key={String(p._id)} value={loc(p.name, language)}>{loc(p.name, language) || 'Unnamed'}</Select.Option>)}
                </Select>
              </div>

              {/* Zone */}
              <div className={showFilters ? 'block' : 'hidden md:block'}>
                <label className="block text-[15px] font-bold text-black mb-3">{t.areaZone || 'Area / Zone'}</label>
                <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.zoneId || undefined} onChange={v => setFilter('zoneId', v || '')}
                  placeholder={language === 'en' ? 'Select Area/Zone' : 'Chọn Khu Vực'} style={{ width: '100%' }} size="large" allowClear showSearch
                  filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                  {zones.map(z => <Select.Option key={String(z._id)} value={loc(z.name, language)}>{loc(z.name, language) || 'Unnamed'}</Select.Option>)}
                </Select>
              </div>

              {/* Block */}
              <div className={showFilters ? 'block' : 'hidden md:block'}>
                <label className="block text-[15px] font-bold text-black mb-3">{t.blockName || 'Block Name'}</label>
                <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.blockId || undefined} onChange={v => setFilter('blockId', v || '')}
                  placeholder={language === 'en' ? 'Select Block' : 'Chọn Khối'} style={{ width: '100%' }} size="large" allowClear>
                  {blocks.map(b => <Select.Option key={String(b._id)} value={loc(b.name, language)}>{loc(b.name, language) || 'Unnamed'}</Select.Option>)}
                </Select>
              </div>

              {/* Sliders + Search */}
              <div className="flex items-end gap-3 h-full">
                <button
                  className={`flex items-center justify-center p-[11px] border cursor-pointer border-[#d1d5dc] rounded-full text-gray-700 font-semibold hover:bg-gray-50 transition-all ${showFilters ? 'bg-purple-50 border-[#41398B] text-[#41398B]' : ''}`}
                  onClick={() => setShowFilters(s => !s)} style={{ minWidth: '50px' }}>
                  <SlidersHorizontal size={22} />
                </button>
                <button
                  className="w-full px-10 py-[12px] whitespace-nowrap bg-[#41398B] hover:bg-[#352e7a] text-white font-bold rounded-full hover:shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all text-base"
                  onClick={handleSearch}>
                  {t.search || 'Search...'}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="lg:contents grid gap-4 md:block">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4">
                  {/* Property Type */}
                  <div className="w-full">
                    <label className="block text-[15px] font-bold text-black mb-3">{t.propertyType || 'Property Type'}</label>
                    <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.propertyType || undefined} onChange={v => setFilter('propertyType', v || '')}
                      placeholder={t.propertyType || 'Property Type'} style={{ width: '100%' }} size="large" allowClear>
                      {propertyTypes.map(tp => <Select.Option key={String(tp._id)} value={loc(tp.name, language)}>{loc(tp.name, language) || 'Unnamed'}</Select.Option>)}
                    </Select>
                  </div>
                  {/* Bedrooms */}
                  <div className="w-full">
                    <label className="block text-[15px] font-bold text-black mb-3">{t.bedrooms || 'Bedrooms'}</label>
                    <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.bedrooms || undefined} onChange={v => setFilter('bedrooms', v || '')}
                      placeholder="Any" style={{ width: '100%' }} size="large" allowClear>
                      {['1', '2', '3', '4+'].map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                    </Select>
                  </div>
                  {/* Bathrooms */}
                  <div className="w-full">
                    <label className="block text-[15px] font-bold text-black mb-3">{t.bathrooms || 'Bathrooms'}</label>
                    <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.bathrooms || undefined} onChange={v => setFilter('bathrooms', v || '')}
                      placeholder="Any" style={{ width: '100%' }} size="large" allowClear>
                      {['1', '2', '3+'].map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                    </Select>
                  </div>
                  {/* Currency */}
                  <div className="w-full">
                    <label className="block text-[15px] font-bold text-black mb-3">{t.currency || 'Currency'}</label>
                    <Select className="custom-selectss w-full" dropdownClassName="custom-dropdown" value={filters.currency || undefined} onChange={v => setFilter('currency', v || '')}
                      placeholder={t.currency || 'Currency'} style={{ width: '100%' }} size="large" allowClear>
                      {currencies.map(c => {
                        const name = loc(c.currencyName, language) || 'N/A'
                        const code = loc(c.currencyCode, language) || ''
                        return <Select.Option key={String(c._id)} value={code}>{name} ({code})</Select.Option>
                      })}
                    </Select>
                  </div>
                  {/* Min/Max Price */}
                  <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                    <div>
                      <label className="block text-[15px] font-bold text-black mb-3">{t.minPrice || 'Min Price'}</label>
                      <input type="text" className="w-full px-4 py-[11px] border border-[#d1d5dc] rounded-lg text-[15px] bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all font-medium"
                        placeholder="Min" value={filters.minPrice} onChange={e => {
                          const raw = e.target.value.replace(/,/g, '').replace(/\D/g, '')
                          const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          setFilter('minPrice', formatted)
                        }} />
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-black mb-3">{t.maxPrice || 'Max Price'}</label>
                      <input type="text" className="w-full px-4 py-[11px] border border-[#d1d5dc] rounded-lg text-[15px] bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all font-medium"
                        placeholder="Max" value={filters.maxPrice} onChange={e => {
                          const raw = e.target.value.replace(/,/g, '').replace(/\D/g, '')
                          const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          setFilter('maxPrice', formatted)
                        }} />
                    </div>
                  </div>
                </div>

                {/* Mobile search */}
                <div className="md:hidden flex items-center gap-3 mt-8">
                  <button className={`flex items-center justify-center p-[11px] border cursor-pointer border-[#d1d5dc] rounded-full text-gray-700 font-semibold hover:bg-gray-50 transition-all ${showFilters ? 'bg-purple-50 border-[#41398B] text-[#41398B]' : ''}`}
                    onClick={() => setShowFilters(s => !s)} style={{ minWidth: '50px' }}>
                    <SlidersHorizontal size={22} />
                  </button>
                  <button className="w-full px-10 py-[12px] bg-[#41398B] whitespace-nowrap hover:bg-[#352e7a] text-white font-bold rounded-full hover:shadow-xl cursor-pointer transition-all text-base" onClick={handleSearch}>
                    {t.search || 'Search...'}
                  </button>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 text-gray-400 font-bold hover:text-[#41398B] transition-colors rounded-full text-sm cursor-pointer" onClick={handleClear}>
                    {t.clearAll || 'Clear All'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Property Grid */}
        <main>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden p-4">
                  <Skeleton.Image active className="!w-full !h-56 rounded-2xl mb-4" />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl">
              <svg className="w-24 h-24 text-purple-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">{t.noPropertiesFound || 'No properties found'}</h2>
              <p className="text-gray-500">{t.adjustFilters || 'Try adjusting your filters'}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2 md:p-0">
                {properties.map((property, index) => {
                  return (
                    <div key={String(property._id)}>
                      <PropertyCard
                        property={property}
                        language={language}
                        t={t}
                        selectedCategory={selectedCategory}
                        isFav={isFavorite(String(property._id))}
                        onToggleFav={handleToggleFav}
                      />
                    </div>
                  )
                })}
              </div>

              {totalProperties > 20 && (
                <div className="flex justify-center mt-10 mb-8">
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: '#41398B',
                      },
                    }}
                  >
                    <Pagination 
                      current={page} 
                      total={totalProperties} 
                      pageSize={20} 
                      onChange={handlePageChange} 
                      showSizeChanger={false}
                    />
                  </ConfigProvider>
                </div>
              )}
            </>
          )}
        </main>
      </div >
    </div >
  )
}

export default function ListingClientWrapper({
  initialProperties,
  initialTotalPages,
  initialTotalItems,
}: {
  initialProperties?: any[]
  initialTotalPages?: number
  initialTotalItems?: number
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading properties...</div>}>
      <ListingInner initialProperties={initialProperties} initialTotalPages={initialTotalPages} initialTotalItems={initialTotalItems} />
    </Suspense>
  )
}
