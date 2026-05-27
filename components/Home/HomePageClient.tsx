'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Select } from 'antd'
import { SlidersHorizontal, Heart, Star, Quote, ChevronLeft, ChevronRight, Bed, Bath, Ruler, MapPin } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { translations } from '@/language/translations'
import { getAllZoneSubAreas, getAllBlocks, getAllPropertyTypes, getAllCurrencies, getAllProperties, getVisibleTestimonials } from '@/lib/api'
import { formatNumber, parseNumber, stripHtml } from '@/utils/display'
import { usePermissions } from '@/context/PermissionContext'

import { getAssetBaseURL, getImageUrl } from '@/utils/baseURL'
const BASE = getAssetBaseURL()

function loc(val: unknown, lang: string): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  const v = val as Record<string, string>
  return lang === 'vi' ? (v.vi || v.en || '') : (v.en || v.vi || '')
}

interface HomePageClientProps {
  cmsData: Record<string, unknown>
  featuredProperties: unknown[]
}

// ─── BANNER ─────────────────────────────────────────────────────────────────

function HomeBanner({ d, lang, t }: { d: Record<string, unknown>; lang: string; t: Record<string, string> }) {
  const router = useRouter()
  const { can } = usePermissions()
  const [tab, setTab] = useState('View All')
  const [showMore, setShowMore] = useState(false)
  const [zones, setZones] = useState<Record<string, unknown>[]>([])
  const [blocks, setBlocks] = useState<Record<string, unknown>[]>([])
  const [zonesAll, setZonesAll] = useState<Record<string, unknown>[]>([])
  const [blocksAll, setBlocksAll] = useState<Record<string, unknown>[]>([])
  const [projects, setProjects] = useState<Record<string, unknown>[]>([])
  const [projectsAll, setProjectsAll] = useState<Record<string, unknown>[]>([])
  const [propertyTypes, setPropertyTypes] = useState<Record<string, unknown>[]>([])
  const [currencies, setCurrencies] = useState<Record<string, unknown>[]>([])
  const [filters, setFilters] = useState({
    keyword: '',
    projectId: '',
    zoneId: '',
    blockId: '',
    propertyType: '',
    currency: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pr, zr, br, tr, cr] = await Promise.all([
          getAllProperties(),
          getAllZoneSubAreas(),
          getAllBlocks(),
          getAllPropertyTypes(),
          getAllCurrencies()
        ])

        const active = (arr: unknown[]) => (arr as Record<string, unknown>[]).filter(x => x.status === 'Active')

        const activeProjects = active(pr.data?.data || [])
        const activeZones = active(zr.data?.data || [])
        const activeBlocks = active(br.data?.data || [])

        setProjectsAll(activeProjects)
        setZonesAll(activeZones)
        setBlocksAll(activeBlocks)

        setProjects(activeProjects)
        setZones([])
        setBlocks([])

        // Filter property types based on permissions if needed, but for now active only
        setPropertyTypes(active(tr.data?.data || []))
        setCurrencies(active(cr.data?.data || []))
      } catch (err) {
        console.error('Error loading dropdown data:', err)
      }
    }
    loadData()
  }, [can])

  useEffect(() => {
    if (!filters.projectId) {
      setZones([])
      setBlocks([])
      return
    }
    const proj = projectsAll.find(p => loc(p.name, lang) === filters.projectId)
    const pid = proj?._id as string
    if (pid) {
      setZones(zonesAll.filter(z => {
        const pId = typeof z.property === 'string' ? z.property : (z.property as Record<string, unknown>)?._id
        return pId === pid
      }))
    } else {
      setZones([])
    }
    setBlocks([])
  }, [filters.projectId, projectsAll, zonesAll, lang])

  useEffect(() => {
    if (!filters.zoneId) {
      setBlocks([])
      return
    }
    const zone = zonesAll.find(z => loc(z.name, lang) === filters.zoneId)
    const zid = zone?._id as string
    if (zid) {
      setBlocks(blocksAll.filter(b => {
        const zId = typeof b.zone === 'string' ? b.zone : (b.zone as Record<string, unknown>)?._id
        return zId === zid
      }))
    } else {
      setBlocks([])
    }
  }, [filters.zoneId, zonesAll, blocksAll, lang])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      let processedValue = value
      if (key === 'minPrice' || key === 'maxPrice') {
        processedValue = formatNumber(value)
      }

      const newFilters = { ...prev, [key]: processedValue }
      if (key === 'projectId') {
        newFilters.zoneId = ''
        newFilters.blockId = ''
      } else if (key === 'zoneId') {
        newFilters.blockId = ''
      }
      return newFilters
    })
  }

  const search = () => {
    const type = tab === 'For Lease' ? 'Lease' : tab === 'For Sale' ? 'Sale' : tab === 'Home Stay' ? 'Home Stay' : 'All'
    const params = new URLSearchParams({ type })

    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.projectId) params.set('projectId', filters.projectId)
    if (filters.zoneId) params.set('zoneId', filters.zoneId)
    if (filters.blockId) params.set('blockId', filters.blockId)
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms)
    if (filters.currency) params.set('currency', filters.currency)
    if (filters.minPrice) params.set('minPrice', String(parseNumber(filters.minPrice)))
    if (filters.maxPrice) params.set('maxPrice', String(parseNumber(filters.maxPrice)))

    router.push(`/listing?${params.toString()}`)
  }

  const bg = d?.backgroundImage ? getImageUrl(String(d.backgroundImage)) : '/images/property/home-banner.jpg'
  const heroTitle = lang === 'en' ? String(d?.heroTitle_en || 'Find The Best Place') : String(d?.heroTitle_vn || 'Tìm Nơi Tốt Nhất')
  const heroDesc = lang === 'en' ? String(d?.heroDescription_en || 'This stunning coastal villa in Malibu offers panoramic ocean views, open-concept living, and elegant modern design.') : String(d?.heroDescription_vn || 'Biệt thự ven biển tuyệt đẹp này ở Malibu mang đến tầm nhìn toàn cảnh ra đại dương, không gian sống mở và thiết kế hiện đại thanh lịch.')

  const tabClass = (name: string) => `px-2 py-2 md:py-3 md:px-8 rounded-t-md font-medium text-base cursor-pointer transition-all ${tab === name ? 'bg-white text-[#41398B]' : 'bg-black/40 text-white hover:bg-gray-200 hover:text-[#41398B]'}`
  const tabs = [
    { key: 'View All', label: t.viewAll },
    { key: 'For Lease', label: t.forRent },
    { key: 'For Sale', label: t.forSale },
    { key: 'Home Stay', label: t.homestay }
  ]

  return (
    <>
      <div className="relative min-h-[70vh] md:min-h-[85vh] bg-cover bg-center bg-no-repeat place-content-center"
        style={{ backgroundImage: `url(${bg})` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-medium text-white mb-4 animate-fadeInUp">
              {heroTitle}
            </h1>
            <p className="md:text-xl text-lg text-gray-200 font-medium max-w-2xl mx-auto animate-fadeInUp animation-delay-200">
              {heroDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-[-120px] mx-4 md:mx-0 relative z-999 animate-slideUpFade animation-delay-400">
        <div className="flex gap-2 md:gap-3 md:justify-center justify-between">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={tabClass(key)}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="bg-white md:rounded-2xl rounded-t-none shadow-sm p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            {/* Looking For */}
            <div className="order-1">
              <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Looking For' : 'Tìm Kiếm'}</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white text-black placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                placeholder={lang === 'en' ? 'Search keyword' : 'Từ khóa tìm kiếm'}
                value={filters.keyword}
                onChange={e => handleFilterChange('keyword', e.target.value)}
              />
            </div>

            {/* Project */}
            <div className={`order-2 ${showMore ? 'block' : 'hidden lg:block'}`}>
              <label className="block text-md font-bold text-black mb-2">{t.projectCommunity}</label>
              <Select
                className="custom-selectss"
                popupClassName="custom-dropdown"
                value={filters.projectId || undefined}
                onChange={v => handleFilterChange('projectId', v || '')}
                placeholder={lang === 'en' ? 'Select Project' : 'Chọn Dự Án'}
                style={{ width: '100%' }}
                size="large"
                allowClear
                showSearch
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                {projects.map(p => (
                  <Select.Option key={String(p._id)} value={loc(p.name, lang)}>
                    {loc(p.name, lang) || 'Unnamed'}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Area/Zone */}
            <div className={`order-3 ${showMore ? 'block' : 'hidden lg:block'}`}>
              <label className="block text-md font-bold text-black mb-2">{t.areaZone}</label>
              <Select
                className="custom-selectss"
                popupClassName="custom-dropdown"
                value={filters.zoneId || undefined}
                onChange={v => handleFilterChange('zoneId', v || '')}
                placeholder={lang === 'en' ? 'Select Area/Zone' : 'Chọn Khu Vực'}
                style={{ width: '100%' }}
                size="large"
                allowClear
                showSearch
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                {zones.map(z => (
                  <Select.Option key={String(z._id)} value={loc(z.name, lang)}>
                    {loc(z.name, lang) || 'Unnamed'}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Block */}
            <div className={`order-4 ${showMore ? 'block' : 'hidden lg:block'}`}>
              <label className="block text-md font-bold text-black mb-2">{t.blockName}</label>
              <Select
                className="custom-selectss"
                popupClassName="custom-dropdown"
                value={filters.blockId || undefined}
                onChange={v => handleFilterChange('blockId', v || '')}
                placeholder={lang === 'en' ? 'Select Block' : 'Chọn Khối'}
                style={{ width: '100%' }}
                size="large"
                allowClear
                showSearch
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
              >
                {blocks.map(b => (
                  <Select.Option key={String(b._id)} value={loc(b.name, lang)}>
                    {loc(b.name, lang) || 'Unnamed'}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Buttons */}
            <div className="order-last lg:order-5 flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2.5 border cursor-pointer border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                onClick={() => setShowMore(s => !s)}
              >
                <SlidersHorizontal size={20} />
                <span className="lg:hidden">{lang === 'en' ? 'Filters' : 'Bộ lọc'}</span>
              </button>
              <button
                className="flex-1 px-8 py-2.5 bg-[#41398B] hover:bg-[#41398be1] text-white font-bold rounded-lg hover:shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all"
                onClick={search}
              >
                {lang === 'en' ? 'Search' : 'Tìm Kiếm'}
              </button>
            </div>

            {/* Advanced Filters */}
            {showMore && (
              <div className="lg:contents grid gap-4 md:block">
                {/* Bedrooms */}
                <div className="order-5 lg:order-6">
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Bedrooms' : 'Phòng Ngủ'}</label>
                  <Select
                    className="custom-selectss"
                    popupClassName="custom-dropdown"
                    value={filters.bedrooms || undefined}
                    onChange={v => handleFilterChange('bedrooms', v || '')}
                    placeholder={lang === 'en' ? 'Any Bedrooms' : 'Bất Kỳ'}
                    style={{ width: '100%' }}
                    size="large"
                    allowClear
                  >
                    <Select.Option value="1">1</Select.Option>
                    <Select.Option value="2">2</Select.Option>
                    <Select.Option value="3">3</Select.Option>
                    <Select.Option value="4">4+</Select.Option>
                  </Select>
                </div>

                {/* Bathrooms */}
                <div className="order-6 lg:order-7">
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Bathrooms' : 'Phòng Tắm'}</label>
                  <Select
                    className="custom-selectss"
                    popupClassName="custom-dropdown"
                    value={filters.bathrooms || undefined}
                    onChange={v => handleFilterChange('bathrooms', v || '')}
                    placeholder={lang === 'en' ? 'Any' : 'Bất Kỳ'}
                    style={{ width: '100%' }}
                    size="large"
                    allowClear
                  >
                    <Select.Option value="1">1</Select.Option>
                    <Select.Option value="2">2</Select.Option>
                    <Select.Option value="3">3+</Select.Option>
                  </Select>
                </div>

                {/* Property Type */}
                <div className="order-7 lg:order-8">
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Property Type' : 'Loại căn'}</label>
                  <Select
                    className="custom-selectss"
                    popupClassName="custom-dropdown"
                    value={filters.propertyType || undefined}
                    onChange={v => handleFilterChange('propertyType', v || '')}
                    placeholder={lang === 'en' ? 'Select Type' : 'Chọn Loại'}
                    style={{ width: '100%' }}
                    size="large"
                    allowClear
                    showSearch
                    filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {propertyTypes.map(tp => (
                      <Select.Option key={String(tp._id)} value={loc(tp.name, lang)}>
                        {loc(tp.name, lang) || 'Unnamed'}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Currency */}
                <div className="order-8 lg:order-9">
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Currency' : 'Tiền Tệ'}</label>
                  <Select
                    className="custom-selectss"
                    popupClassName="custom-dropdown"
                    value={filters.currency || undefined}
                    onChange={v => handleFilterChange('currency', v || '')}
                    placeholder={lang === 'en' ? 'Select Currency' : 'Chọn Tiền Tệ'}
                    style={{ width: '100%' }}
                    size="large"
                    allowClear
                  >
                    {currencies.map(c => (
                      <Select.Option key={String(c._id)} value={loc((c as Record<string, unknown>).currencyCode, lang)}>
                        {loc((c as Record<string, unknown>).currencyName, lang) || 'N/A'}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Min Price */}
                <div className="order-9 lg:order-10">
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Min Price' : 'Giá Tối Thiểu'}</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white text-black placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                    placeholder={lang === 'en' ? 'Min' : 'Tối Thiểu'}
                    value={filters.minPrice}
                    onChange={e => handleFilterChange('minPrice', e.target.value.replace(/,/g, ''))}
                  />
                </div>

                {/* Max Price */}
                <div className="order-10 lg:order-11">
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Max Price' : 'Giá Tối Đa'}</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white text-black placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                    placeholder={lang === 'en' ? 'Max' : 'Tối Đa'}
                    value={filters.maxPrice}
                    onChange={e => handleFilterChange('maxPrice', e.target.value.replace(/,/g, ''))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}


// ─── ABOUT ───────────────────────────────────────────────────────────────────

function HomeAbout({ d, lang }: { d: Record<string, unknown>; lang: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  const subtitle = lang === 'en' ? String(d?.homeAboutSubTitle_en || 'ABOUT US') : String(d?.homeAboutSubTitle_vn || 'VỀ CHÚNG TÔI')
  const title = lang === 'en' ? String(d?.homeAboutTitle_en || 'Building Dreams, One Home At A Time') : String(d?.homeAboutTitle_vn || 'Xây Dựng Ước Mơ, Từng Ngôi Nhà')
  const desc = lang === 'en' ? String(d?.homeAboutDescription_en || 'Our mission goes beyond real estate — it\'s about guiding you through one of life\'s biggest milestones.') : String(d?.homeAboutDescription_vn || '')
  const btnText = lang === 'en' ? String(d?.homeAboutButtonText_en || 'View Properties') : String(d?.homeAboutButtonText_vn || 'View Bất Động Sản')
  const btnLink = String(d?.homeAboutButtonLink || '/listing')

  const steps = [
    { num: '01', title: lang === 'en' ? String(d?.homeAboutStep1Title_en || 'Buy A New Home') : String(d?.homeAboutStep1Title_vn || 'Mua Nhà Mới'), desc: lang === 'en' ? String(d?.homeAboutStep1Des_en || 'Discover your dream home effortlessly.') : String(d?.homeAboutStep1Des_vn || '') },
    { num: '02', title: lang === 'en' ? String(d?.homeAboutStep2Title_en || 'Rent A Home') : String(d?.homeAboutStep2Title_vn || 'Thuê Nhà'), desc: lang === 'en' ? String(d?.homeAboutStep2Des_en || 'Discover your perfect rental effortlessly.') : String(d?.homeAboutStep2Des_vn || '') },
    { num: '03', title: lang === 'en' ? String(d?.homeAboutStep3Title_en || 'Sell A Home') : String(d?.homeAboutStep3Title_vn || 'Bán Nhà'), desc: lang === 'en' ? String(d?.homeAboutStep3Des_en || 'Sell confidently with expert guidance.') : String(d?.homeAboutStep3Des_vn || '') },
  ]

  return (
    <section ref={ref} className="px-4 md:px-6 bg-white overflow-hidden mt-[-60px] pt-[130px] pb-[60px]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-16 gap-8 items-start">
          <div className={`space-y-6 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}>
            <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider">{subtitle}</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-black leading-tight">{title}</h2>
            <p className="text-md text-gray-600 leading-relaxed">{desc}</p>
            <Link href={btnLink} className="inline-block mt-4 px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1">{btnText}</Link>
          </div>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <div key={s.num} className={`flex gap-6 transition-all duration-1000 ease-out hover:translate-x-2 ${visible ? 'opacity-100 translate-x-0' : 'opacity-1 translate-x-12'}`}
                style={{ transitionDelay: `${150 * (i + 1)}ms` }}>
                <span className="flex-shrink-0 text-xl md:text-2xl font-semibold text-black">{s.num}.</span>
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-semibold text-[#2a2a2a]">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FEATURED PROPERTIES ─────────────────────────────────────────────────────

function HomeFeaturedProperties({ properties, d, lang, t }: { properties: unknown[]; d: Record<string, unknown>; lang: string; t: Record<string, string> }) {
  const router = useRouter()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  const title = lang === 'en' ? String(d?.homeFeatureTitle_en || 'FEATURED PROPERTIES') : String(d?.homeFeatureTitle_vn || 'BẤT ĐỘNG SẢN NỔI BẬT')
  const desc = lang === 'en' ? String(d?.homeFeatureDescription_en || '') : String(d?.homeFeatureDescription_vn || '')
  const btnText = lang === 'en' ? String(d?.homeFeatureButtonText_en || 'View Properties') : String(d?.homeFeatureButtonText_vn || 'View Bất Động Sản')
  const btnLink = "listing"

  const badgeClass = (cat: string) => {
    const c = cat.toLowerCase()
    if (c.includes('lease') || c.includes('rent')) return 'bg-[#058135]'
    if (c.includes('sale')) return 'bg-[#eb4d4d]'
    return 'bg-[#055381]'
  }

  return (
    <section ref={ref} className="py-6 md:px-6 px-4 md:py-10 bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff] mx-auto border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <p className={`text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}>{title}</p>
          {desc && <h2 className={`text-2xl md:text-4xl  font-semibold text-black transition-all duration-1000 delay-100 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}>{desc}</h2>}
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl">
            <p className="text-gray-500">{t.noPropertiesFound || 'No properties found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 mt-3">
            {(properties as Record<string, any>[]).map((property, index) => {
              const info = property.listingInformation || {}
              const financial = property.financialDetails || {}
              const propInfo = property.propertyInformation || {}
              const seo = property.seoInformation || {}
              const visFin = property.financialVisibility || {}
              const visListing = property.listingInformationVisibility || {}
              const imgs = property.imagesVideos?.propertyImages || []

              const id = String(info.listingInformationPropertyId || property._id)
              const slug = loc(seo.slugUrl, lang)
              const title = !property.titleVisibility ? loc(info.listingInformationPropertyTitle, lang) || 'Untitled Property' : ''
              const txType = loc(info.listingInformationTransactionType, lang)
              const propType = loc(info.listingInformationPropertyType, lang)
              const propId = String(property._id)
              const favorited = isFavorite(propId)

              const beds = Number(propInfo.informationBedrooms || 0)
              const baths = Number(propInfo.informationBathrooms || 0)
              const sqft = Number(propInfo.informationUnitSize || 0)

              // Price logic
              const typeLower = String(txType || '').toLowerCase()
              const priceSale = financial.financialDetailsPrice
              const priceLease = financial.financialDetailsLeasePrice
              const priceNight = financial.financialDetailsPricePerNight

              const nearbyDesc = loc(property.whatNearby?.whatNearbyDescription, lang)
              const zoneDesc = !visListing.areaZone ? loc(info.listingInformationZoneSubArea, lang) : ''
              const descHtml = nearbyDesc || zoneDesc || ''

              const t = translations[lang as keyof typeof translations]
              let displayPrice = t.contactForPrice
              let displaySuffix = ''

              if (typeLower === 'sale' && priceSale) {
                displayPrice = `${formatNumber(priceSale)} VND`
              } else if (typeLower === 'lease' && priceLease) {
                displayPrice = `${formatNumber(priceLease)} VND`
                displaySuffix = lang === 'en' ? '/ month' : '/ tháng'
              } else if (typeLower === 'home stay' && priceNight) {
                displayPrice = `${formatNumber(priceNight)} VND`
                displaySuffix = lang === 'en' ? '/ night' : '/ đêm'
              }

              return (
                <Link key={propId}
                  href={`/property-showcase/${id}${slug ? `/${slug}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 flex flex-col cursor-pointer border border-gray-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}>
                  <div className="relative h-56 overflow-hidden">
                    <img src={getImageUrl(imgs[0]) || '/images/property/dummy-img.avif'} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />

                    <div className="absolute top-3 left-3 flex gap-2">
                      {txType && !visListing.transactionType && <span className={`px-2 py-1.5 text-[11px] text-white font-bold uppercase tracking-wider rounded-sm shadow-md ${badgeClass(txType)}`}>{txType}</span>}
                      {propType && !visListing.transactionType && <span className="px-2 py-1.5 text-[11px] bg-[#41398B]/90 text-white font-bold uppercase tracking-wider rounded-sm shadow-md">{propType}</span>}
                    </div>

                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); if (favorited) { removeFavorite(propId) } else { addFavorite(property) } }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-md shadow-md hover:scale-110 transition-transform z-20">
                      <Heart size={16} className={favorited ? 'fill-[#eb4d4d] text-[#eb4d4d]' : 'text-[#2a2a2a]'} />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-[20px] font-bold text-[#2a2a2a]">{displayPrice}</span>
                      {displaySuffix && <span className="text-sm text-gray-500 font-medium">{displaySuffix}</span>}
                    </div>
                    {title && <h3 className="text-[17px] font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#41398B] transition-colors">{title}</h3>}

                    {descHtml && !property.descriptionVisibility && (
                      <p className="text-[14px] text-gray-500 mb-4 line-clamp-2">
                        {stripHtml(descHtml)}
                      </p>
                    )}

                    <div className="flex items-center pt-3 border-t border-gray-100 justify-between mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Bed size={18} className="text-[#41398B]" />
                        <span className="text-[13px] font-bold text-gray-700">{beds} {t.rooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath size={18} className="text-[#41398B]" />
                        <span className="text-[13px] font-bold text-gray-700">{baths} {t.rooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ruler size={18} className="text-[#41398B]" />
                        <span className="text-[13px] font-bold text-gray-700">{formatNumber(sqft)} {loc(info.listingInformationUnit, lang) || 'Sqft'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href={btnLink} className="inline-block px-8 py-3 bg-[#41398B] text-white font-bold rounded-full hover:bg-[#41398be1] transition">{btnText}</Link>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function HomeFaq({ d, lang }: { d: Record<string, unknown>; lang: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  const faqSub = lang === 'en' ? String(d?.homeFaqTitle_en || 'FAQS') : String(d?.homeFaqTitle_vn || 'CÂU HỎI THƯỜNG GẶP')
  const faqTitle = lang === 'en' ? String(d?.homeFaqDescription_en || 'Ask Us Anything About Home Buying & Selling') : String(d?.homeFaqDescription_vn || 'Hỏi Chúng Tôi Bất Cứ Điều Gì Về Mua Bán Nhà')

  const cardTitle = lang === 'en' ? String(d?.homeFaqImageTitle_en || 'Get in Touch With Us') : String(d?.homeFaqImageTitle_vn || 'Liên Hệ Với Chúng Tôi')
  const cardDesc = lang === 'en' ? String(d?.homeFaqImageDescription_en || 'Reach out today for expert real estate advice, personalized support, and a dedicated team ready to guide you every step of the way.') : String(d?.homeFaqImageDescription_vn || 'Liên hệ ngay hôm nay để được tư vấn bất động sản chuyên nghiệp, hỗ trợ cá nhân hóa và đội ngũ tận tâm sẵn sàng hướng dẫn bạn từng bước.')
  const btnText = lang === 'en' ? String(d?.homeFaqImageButtonText_en || 'Schedule a Consultation') : String(d?.homeFaqImageButtonText_vn || 'Đặt Lịch Tư Vấn')
  const btnLink = String(d?.homeFaqImageButtonLink || '/contact')
  const cardBg = d?.homeFaqBg ? getImageUrl(String(d.homeFaqBg)) : '/images/property/property1.jpg'

  const rawFaqs = (d?.faqs as Record<string, string>[]) || []
  const faqs = rawFaqs.length > 0 ? rawFaqs : [
    { header_en: 'How do I start the home buying process?', header_vn: 'Làm thế nào để bắt đầu quá trình mua nhà?', content_en: 'Starting the home buying process involves getting pre-approved for a mortgage to understand your budget, finding a real estate agent to guide you, and identifying your needs and preferences for your new home.', content_vn: 'Bắt đầu quá trình mua nhà bao gồm việc được phê duyệt trước cho khoản vay thế chấp để hiểu ngân sách của bạn, tìm một đại lý bất động sản để hướng dẫn bạn và xác định nhu cầu và sở thích của bạn cho ngôi nhà mới.' },
    { header_en: 'What costs are involved in buying a home?', header_vn: 'Chi phí nào liên quan đến việc mua nhà?', content_en: 'Our approach combines personalized strategies, data-driven insights, and dedicated support to help you reach your financial goals. Each step is crafted to maximize growth, reduce risk, and build lasting financial confidence.', content_vn: 'Phương pháp của chúng tôi kết hợp các chiến lược cá nhân hóa, thông tin chi tiết dựa trên dữ liệu và hỗ trợ tận tâm để giúp bạn đạt được mục tiêu tài chính.' },
    { header_en: 'How long does it take to buy a home?', header_vn: 'Mất bao lâu để mua nhà?', content_en: 'The timeline varies but typically takes 30-45 days from contract to closing. Finding the right home can take weeks or months depending on the market and your specific criteria.', content_vn: 'Thời gian thay đổi nhưng thường mất 30-45 ngày từ hợp đồng đến kết thúc.' },
  ]

  const navigate = (link: string) => {
    if (link.startsWith('http')) { window.location.href = link; return }
    router.push(link)
  }

  return (
    <section ref={ref} className="py-10 md:py-20 px-4 md:px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24">
        {/* Left Side: Contact Card */}
        <div className={`relative rounded-3xl overflow-hidden min-h-[500px] flex flex-col bg-cover bg-center transition-all duration-1000 ease-out transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-1 -translate-x-12'}`}
          style={{ backgroundImage: `url(${cardBg})` }}>
          <div className="absolute inset-0 bg-black/20 z-0" />
          <div className="relative z-10 p-6 md:p-12 flex flex-col h-full items-start">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2 md:mb-6 leading-tight">{cardTitle}</h2>
            <p className="text-white/90 text-lg mb-2 md:mb-8 leading-relaxed max-w-md">{cardDesc}</p>
            <button className="mt-4 px-6 py-3 bg-black cursor-pointer text-white font-semibold rounded-md hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
              onClick={() => navigate(btnLink)}>{btnText}</button>
          </div>
        </div>

        {/* Right Side: FAQ Accordion */}
        <div className="flex flex-col justify-start pt-4">
          <span className={`text-sm font-semibold tracking-[0.2em] text-gray-400 uppercase mb-3 transition-all duration-700 delay-300 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-8'}`}>
            {faqSub}
          </span>
          <h2 className={`text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-3 md:mb-5 leading-tight transition-all duration-700 delay-500 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-8'}`}>
            {faqTitle}
          </h2>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className={`border-b border-gray-200 transition-all duration-700 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-8'}`}
                style={{ transitionDelay: `${700 + i * 100}ms` }}>
                <button className="w-full py-4 flex items-center justify-between text-left group cursor-pointer"
                  onClick={() => setOpen(open === i ? -1 : i)}>
                  <span className="text-md md:text-lg font-medium text-[#1a1a1a] pr-8 group-hover:text-[#41398B] transition-colors duration-300">
                    {lang === 'en' ? (faq.header_en || (faq as any).header) : (faq.header_vn || faq.header_en || (faq as any).header)}
                  </span>
                  <span className={`transform transition-transform duration-300 ${open === i ? 'rotate-180 text-[#41398B]' : 'rotate-0 text-gray-400 group-hover:text-[#41398B]'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open === i ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-1'}`}>
                  <p className="text-gray-500 leading-relaxed text-[16px]">
                    {lang === 'en' ? (faq.content_en || (faq as any).content) : (faq.content_vn || faq.content_en || (faq as any).content)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function HomeTestimonials({ d, lang }: { d: Record<string, unknown>; lang: string }) {
  const [testimonials, setTestimonials] = useState<Record<string, unknown>[]>([])
  const [idx, setIdx] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(3)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getVisibleTestimonials().then(r => { if (r.data?.success) setTestimonials(r.data.data || []) }).catch(() => { })
  }, [])

  useEffect(() => {
    const onResize = () => setItemsToShow(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const max = Math.max(0, testimonials.length - itemsToShow)
  const next = useCallback(() => setIdx(p => p >= max ? 0 : p + 1), [max])
  const prev = useCallback(() => setIdx(p => p <= 0 ? max : p - 1), [max])

  useEffect(() => {
    if (!paused && testimonials.length > itemsToShow) {
      timerRef.current = setTimeout(next, 4000)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [idx, paused, testimonials.length, itemsToShow, next])

  const sub = lang === 'en' ? String(d?.homeTestimonialsTitle_en || 'TESTIMONIALS') : String(d?.homeTestimonialsTitle_vn || 'ĐÁNH GIÁ')
  const title = lang === 'en' ? String(d?.homeTestimonialsDescription_en || 'What Our Clients Say') : String(d?.homeTestimonialsDescription_vn || 'Khách Hàng Nói Gì')

  if (testimonials.length === 0) return null

  return (
    <section className="py-10 md:py-20 px-4 md:px-6 bg-[#f8f7ff]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3">{sub}</p>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${idx * (100 / itemsToShow)}%)` }}>
              {testimonials.map((t, i) => {
                const name = String(t.name || 'Client')
                const rating = Number(t.rating || 5)
                const review = String(loc(t.review, lang) || loc(t.message, lang) || '')
                const avatar = t.avatar ? getImageUrl(String(t.avatar)) : ''
                return (
                  <div key={i} className="flex-shrink-0 px-3" style={{ width: `${100 / itemsToShow}%` }}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
                      <Quote size={24} className="text-[#41398B] opacity-30 mb-4" />
                      <p className="text-gray-600 text-sm leading-relaxed flex-1">{review}</p>
                      <div className="flex items-center gap-3 mt-6">
                        {avatar ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-[#41398B] flex items-center justify-center text-white font-bold text-sm">{name[0]}</div>}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{name}</p>
                          <div className="flex gap-0.5">{Array.from({ length: rating }).map((_, j) => <Star key={j} size={12} className="fill-amber-400 text-amber-400" />)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {testimonials.length > itemsToShow && (
            <div className="flex justify-center gap-3 mt-8">
              <button onClick={prev} className="p-2 rounded-full border border-gray-300 hover:border-[#41398B] hover:text-[#41398B] transition"><ChevronLeft size={20} /></button>
              <button onClick={next} className="p-2 rounded-full border border-gray-300 hover:border-[#41398B] hover:text-[#41398B] transition"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── FIND PROPERTY ────────────────────────────────────────────────────────────

function HomeFindProperty({ d, lang }: { d: Record<string, unknown>; lang: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  const title = lang === 'en' ? String(d?.homeFindTitle_en || 'Find Your Property,\nStart Your Homeownership Journey Today') : String(d?.homeFindTitle_vn || 'Tìm Bất Động Sản Của Bạn,\nBắt Đầu Hành Trình Sở Hữu Nhà Ngay Hôm Nay')
  const description = lang === 'en' ? String(d?.homeFindDescription_en || 'Connect with your Designer in minutes') : String(d?.homeFindDescription_vn || 'Kết nối với Nhà thiết kế của bạn trong vài phút')
  const bg = d?.homeFindBg ? getImageUrl(String(d.homeFindBg)) : '/images/property/home-banner.jpg'

  return (
    <section ref={ref} className="relative w-full h-[350px] md:h-[350px] bg-cover bg-center overflow-hidden flex items-center"
      style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          <h2 className={`text-3xl md:text-4xl lg:text-4xl font-semibold text-white leading-tight mb-4 transition-all duration-1000 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}
            style={{ whiteSpace: 'pre-line' }}>{title}</h2>
          {description && (
            <p className={`text-md md:text-lg text-white/90 transition-all duration-1000 delay-300 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}


// ─── LATEST BLOGS ─────────────────────────────────────────────────────────────

function HomeLatestBlogs({ d, lang }: { d: Record<string, unknown>; lang: string }) {
  const [blogs, setBlogs] = useState<Record<string, unknown>[]>([])
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    import('@/lib/api').then(({ getBlogs }) => {
      getBlogs().then(r => {
        if (r.data?.success) {
          setBlogs((r.data.data as Record<string, unknown>[]).filter(b => b.published).sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime()).slice(0, 3))
        }
      }).catch(() => { })
    })
  }, [])

  const title = lang === 'en' ? String(d?.homeBlogTitle_en || 'LATEST NEWS & INSIGHTS') : String(d?.homeBlogTitle_vn || 'TIN TỨC MỚI NHẤT')
  const desc = lang === 'en' ? String(d?.homeBlogDescription_en || '') : String(d?.homeBlogDescription_vn || '')

  if (blogs.length === 0) return null

  return (
    <section ref={ref} className="py-6 md:px-6 px-4 md:py-10 bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff] mx-auto border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-28">
          <p className={`text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}>{title}</p>
          {desc && <h2 className={`text-2xl md:text-4xl font-semibold text-black transition-all duration-1000 delay-100 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-12'}`}>{desc}</h2>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
          {blogs.map((blog, i) => {
            const btitle = loc(blog.title, lang) || 'Untitled'
            const slugRaw = blog.slug || blog._id
            let slug = ''
            if (typeof slugRaw === 'string') {
              slug = slugRaw
            } else if (typeof slugRaw === 'object' && slugRaw !== null) {
              slug = (slugRaw as any)[lang] || (slugRaw as any).en || (slugRaw as any).vi || String(blog._id)
            } else {
              slug = String(blog._id)
            }
            const imgs = (blog.images as { url: string }[]) || []
            const cover = (blog.mainImage as string) || imgs[0]?.url || ''
            
            let excerpt = loc(blog.excerpt, lang) || ''
            if (!excerpt && blog.content) {
                const content = loc(blog.content, lang) || ''
                const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                excerpt = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText
            }

            const categoryName = (blog.category as any)?.name?.[lang] || (blog.category as any)?.name?.en || (lang === 'en' ? 'News' : 'Tin tức')

            return (
              <Link key={String(blog._id)} href={`/blogs/${slug}`} className="group">
                <div 
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1 ${visible ? 'opacity-100 translate-y-0' : 'opacity-1 translate-y-1'}`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  {cover ? (
                    <div className="overflow-hidden">
                      <img src={getImageUrl(cover)} alt={btitle} className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-48 bg-[#E8E8FF] flex items-center justify-center">
                      <span className="text-[#41398B] text-4xl font-bold opacity-30">183</span>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="bg-purple-50 text-[#41398B] px-3 py-1 rounded-full font-semibold text-xs">
                        {categoryName}
                      </span>
                      {blog.createdAt ? <span>{new Date(String(blog.createdAt)).toLocaleDateString()}</span> : null}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#41398B] transition-colors">{btitle}</h3>
                    {excerpt && <p className="text-gray-600 mb-4 text-sm flex-1 line-clamp-3">{excerpt}</p>}
                    <div className="text-[#41398B] font-semibold flex items-center gap-2 mt-auto">
                      {lang === 'en' ? 'Read More' : 'Đọc thêm'}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="text-center mt-10">
          <Link href="/blogs" className="inline-block px-8 py-3 bg-[#41398B] text-white font-bold rounded-full hover:bg-[#41398be1] transition">
            {lang === 'en' ? 'View All Articles' : 'Xem Tất Cả Bài Viết'}
          </Link>
        </div>
      </div>
    </section>
  )
}


// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function HomePageClient({ cmsData, featuredProperties }: HomePageClientProps) {
  const { language } = useLanguage()
  const t = (translations[language as keyof typeof translations] || translations.en) as Record<string, string>

  return (
    <div>
      <HomeBanner d={cmsData} lang={language} t={t} />
      <HomeAbout d={cmsData} lang={language} />
      <HomeFeaturedProperties properties={featuredProperties} d={cmsData} lang={language} t={t} />
      <HomeFaq d={cmsData} lang={language} />
      <HomeTestimonials d={cmsData} lang={language} />
      <HomeFindProperty d={cmsData} lang={language} />
      <HomeLatestBlogs d={cmsData} lang={language} />
    </div>
  )
}
