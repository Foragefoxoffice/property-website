'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Select } from 'antd'
import { SlidersHorizontal, Heart, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { translations } from '@/language/translations'
import { getAllZoneSubAreas, getAllBlocks, getAllPropertyTypes, getAllCurrencies, getAllProperties, getVisibleTestimonials } from '@/lib/api'

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1').replace(/\/api\/v1$/, '')

function getImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}

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
  const [tab, setTab] = useState('View All')
  const [showMore, setShowMore] = useState(false)
  const [zones, setZones] = useState<Record<string, unknown>[]>([])
  const [blocks, setBlocks] = useState<Record<string, unknown>[]>([])
  const [zonesAll, setZonesAll] = useState<Record<string, unknown>[]>([])
  const [blocksAll, setBlocksAll] = useState<Record<string, unknown>[]>([])
  const [projects, setProjects] = useState<Record<string, unknown>[]>([])
  const [propertyTypes, setPropertyTypes] = useState<Record<string, unknown>[]>([])
  const [currencies, setCurrencies] = useState<Record<string, unknown>[]>([])
  const [filters, setFilters] = useState({ keyword: '', projectId: '', zoneId: '', blockId: '', propertyType: '', currency: '', minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '' })

  useEffect(() => {
    Promise.all([getAllProperties(), getAllZoneSubAreas(), getAllBlocks(), getAllPropertyTypes(), getAllCurrencies()])
      .then(([pr, zr, br, tr, cr]) => {
        const active = (arr: unknown[]) => (arr as Record<string, unknown>[]).filter(x => x.status === 'Active')
        setProjects(active(pr.data?.data || []))
        setZonesAll(active(zr.data?.data || []))
        setBlocksAll(active(br.data?.data || []))
        setPropertyTypes(active(tr.data?.data || []))
        setCurrencies(active(cr.data?.data || []))
        setZones([])
        setBlocks([])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!filters.projectId) { setZones([]); setBlocks([]); return }
    const proj = projects.find(p => loc(p.name, lang) === filters.projectId)
    const pid = proj?._id as string
    setZones(pid ? zonesAll.filter(z => (typeof z.property === 'string' ? z.property : (z.property as Record<string, unknown>)?._id) === pid) : [])
    setBlocks([])
  }, [filters.projectId, projects, zonesAll, lang])

  useEffect(() => {
    if (!filters.zoneId) { setBlocks([]); return }
    const zone = zonesAll.find(z => loc(z.name, lang) === filters.zoneId)
    const zid = zone?._id as string
    setBlocks(zid ? blocksAll.filter(b => (typeof b.zone === 'string' ? b.zone : (b.zone as Record<string, unknown>)?._id) === zid) : [])
  }, [filters.zoneId, zonesAll, blocksAll, lang])

  const setFilter = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v, ...(k === 'projectId' ? { zoneId: '', blockId: '' } : k === 'zoneId' ? { blockId: '' } : {}) }))

  const search = () => {
    const type = tab === 'For Lease' ? 'Lease' : tab === 'For Sale' ? 'Sale' : tab === 'Home Stay' ? 'Home Stay' : 'All'
    const params = new URLSearchParams({ type })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`/listing?${params}`)
  }

  const bg = d?.backgroundImage ? getImageUrl(String(d.backgroundImage)) : '/images/property/home-banner.jpg'
  const heroTitle = lang === 'en' ? String(d?.heroTitle_en || 'Find The Best Place') : String(d?.heroTitle_vn || 'Tìm Nơi Tốt Nhất')
  const heroDesc = lang === 'en' ? String(d?.heroDescription_en || '') : String(d?.heroDescription_vn || '')

  const tabClass = (name: string) => `px-2 py-2 md:py-3 md:px-8 rounded-t-md font-medium text-base cursor-pointer transition-all ${tab === name ? 'bg-white text-[#41398B]' : 'bg-black/40 text-white hover:bg-gray-200 hover:text-[#41398B]'}`
  const tabs = [{ key: 'View All', label: t.viewAll }, { key: 'For Lease', label: t.forRent }, { key: 'For Sale', label: t.forSale }, { key: 'Home Stay', label: t.homestay }]

  return (
    <>
      <div className="relative min-h-[70vh] md:min-h-[85vh] bg-cover bg-center bg-no-repeat place-content-center"
        style={{ backgroundImage: `url(${bg})` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-medium text-white mb-4">{heroTitle}</h1>
            {heroDesc && <p className="md:text-xl text-lg text-gray-200 font-medium max-w-2xl mx-auto">{heroDesc}</p>}
          </div>
        </div>
      </div>

      <div className="mt-[-80px] mx-4 md:mx-0 relative z-20">
        <div className="flex gap-2 md:gap-3 md:justify-center justify-between">
          {tabs.map(({ key, label }) => <button key={key} className={tabClass(key)} onClick={() => setTab(key)}>{label}</button>)}
        </div>
        <div className="bg-white md:rounded-2xl rounded-t-none shadow-sm p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Looking For' : 'Tìm Kiếm'}</label>
              <input className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                placeholder={lang === 'en' ? 'Search keyword' : 'Từ khóa tìm kiếm'}
                value={filters.keyword} onChange={e => setFilter('keyword', e.target.value)} />
            </div>
            <div className={showMore ? 'block' : 'hidden lg:block'}>
              <label className="block text-md font-bold text-black mb-2">{t.projectCommunity}</label>
              <Select className="custom-selectss" popupClassName="custom-dropdown" value={filters.projectId || undefined}
                onChange={v => setFilter('projectId', v || '')} placeholder={lang === 'en' ? 'Select Project' : 'Chọn Dự Án'}
                style={{ width: '100%' }} size="large" allowClear showSearch
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                {projects.map(p => <Select.Option key={String(p._id)} value={loc(p.name, lang)}>{loc(p.name, lang) || 'Unnamed'}</Select.Option>)}
              </Select>
            </div>
            <div className={showMore ? 'block' : 'hidden lg:block'}>
              <label className="block text-md font-bold text-black mb-2">{t.areaZone}</label>
              <Select className="custom-selectss" popupClassName="custom-dropdown" value={filters.zoneId || undefined}
                onChange={v => setFilter('zoneId', v || '')} placeholder={lang === 'en' ? 'Select Area/Zone' : 'Chọn Khu Vực'}
                style={{ width: '100%' }} size="large" allowClear showSearch
                filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                {zones.map(z => <Select.Option key={String(z._id)} value={loc(z.name, lang)}>{loc(z.name, lang) || 'Unnamed'}</Select.Option>)}
              </Select>
            </div>
            <div className={showMore ? 'block' : 'hidden lg:block'}>
              <label className="block text-md font-bold text-black mb-2">{t.blockName}</label>
              <Select className="custom-selectss" popupClassName="custom-dropdown" value={filters.blockId || undefined}
                onChange={v => setFilter('blockId', v || '')} placeholder={lang === 'en' ? 'Select Block' : 'Chọn Khối'}
                style={{ width: '100%' }} size="large" allowClear>
                {blocks.map(b => <Select.Option key={String(b._id)} value={loc(b.name, lang)}>{loc(b.name, lang) || 'Unnamed'}</Select.Option>)}
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border cursor-pointer border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                onClick={() => setShowMore(s => !s)}>
                <SlidersHorizontal size={20} />
                <span className="lg:hidden">{lang === 'en' ? 'Filters' : 'Bộ lọc'}</span>
              </button>
              <button className="flex-1 px-8 py-2.5 bg-[#41398B] hover:bg-[#41398be1] text-white font-bold rounded-lg cursor-pointer transition-all" onClick={search}>
                {lang === 'en' ? 'Search' : 'Tìm Kiếm'}
              </button>
            </div>
            {showMore && (
              <div className="lg:contents grid gap-4 md:block">
                <div>
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Bedrooms' : 'Phòng Ngủ'}</label>
                  <Select className="custom-selectss" value={filters.bedrooms || undefined} onChange={v => setFilter('bedrooms', v || '')}
                    placeholder={lang === 'en' ? 'Any' : 'Bất Kỳ'} style={{ width: '100%' }} size="large" allowClear>
                    {['1','2','3','4+'].map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Bathrooms' : 'Phòng Tắm'}</label>
                  <Select className="custom-selectss" value={filters.bathrooms || undefined} onChange={v => setFilter('bathrooms', v || '')}
                    placeholder={lang === 'en' ? 'Any' : 'Bất Kỳ'} style={{ width: '100%' }} size="large" allowClear>
                    {['1','2','3+'].map(v => <Select.Option key={v} value={v}>{v}</Select.Option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Property Type' : 'Loại căn'}</label>
                  <Select className="custom-selectss" value={filters.propertyType || undefined} onChange={v => setFilter('propertyType', v || '')}
                    placeholder={lang === 'en' ? 'Select Type' : 'Chọn Loại'} style={{ width: '100%' }} size="large" allowClear showSearch
                    filterOption={(input, opt) => String(opt?.children ?? '').toLowerCase().includes(input.toLowerCase())}>
                    {propertyTypes.map(tp => <Select.Option key={String(tp._id)} value={loc(tp.name, lang)}>{loc(tp.name, lang) || 'Unnamed'}</Select.Option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Currency' : 'Tiền Tệ'}</label>
                  <Select className="custom-selectss" value={filters.currency || undefined} onChange={v => setFilter('currency', v || '')}
                    placeholder={lang === 'en' ? 'Select Currency' : 'Chọn Tiền Tệ'} style={{ width: '100%' }} size="large" allowClear>
                    {currencies.map(c => <Select.Option key={String(c._id)} value={loc((c as Record<string, unknown>).currencyCode, lang)}>{loc((c as Record<string, unknown>).currencyName, lang) || 'N/A'}</Select.Option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Min Price' : 'Giá Tối Thiểu'}</label>
                  <input className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                    placeholder="Min" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value.replace(/,/g, ''))} />
                </div>
                <div>
                  <label className="block text-md font-bold text-black mb-2">{lang === 'en' ? 'Max Price' : 'Giá Tối Đa'}</label>
                  <input className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                    placeholder="Max" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value.replace(/,/g, ''))} />
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
    <section ref={ref} className="py-8 md:py-20 px-4 md:px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-16 gap-8 items-start">
          <div className={`space-y-6 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider">{subtitle}</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-black leading-tight">{title}</h2>
            <p className="text-md text-gray-600 leading-relaxed">{desc}</p>
            <Link href={btnLink} className="inline-block mt-4 px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1">{btnText}</Link>
          </div>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <div key={s.num} className={`flex gap-6 transition-all duration-1000 ease-out hover:translate-x-2 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
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
  const btnLink = String(d?.homeFeatureButtonLink || '/listing')

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
          <p className={`text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>{title}</p>
          {desc && <h2 className={`text-2xl md:text-4xl font-semibold text-black transition-all duration-1000 delay-100 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>{desc}</h2>}
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl">
            <p className="text-gray-500">{t.noPropertiesFound || 'No properties found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
            {(properties as Record<string, unknown>[]).map((property, index) => {
              const info = (property.listingInformation as Record<string, unknown>) || {}
              const seo = (property.seoInformation as Record<string, unknown>) || {}
              const imgVideos = (property.imagesVideos as Record<string, string[]>) || {}
              const imgs = imgVideos.propertyImages || []
              const id = String(info.listingInformationPropertyId || property._id)
              const slug = loc(seo.slugUrl, lang)
              const title = loc(info.listingInformationPropertyTitle, lang) || 'Untitled Property'
              const txType = loc(info.listingInformationTransactionType, lang)
              const price = (property.financialDetails as Record<string, unknown>)?.financialDetailsPrice
              const propId = String(property._id)
              const favorited = isFavorite(propId)

              return (
                <div key={propId}
                  className={`card-house bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                  onClick={() => router.push(`/property-showcase/${id}${slug ? `/${slug}` : ''}`)}>
                  <div className="relative h-56 overflow-hidden">
                    <img src={imgs[0] || '/images/property/dummy-img.avif'} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <button onClick={e => { e.stopPropagation(); if (favorited) { removeFavorite(propId) } else { addFavorite(property) } }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition">
                      <Heart size={16} className={favorited ? 'fill-[#41398B] text-[#41398B]' : 'text-gray-400'} />
                    </button>
                    {txType && <span className={`absolute top-3 left-3 px-2 py-1 text-white text-[11px] font-medium rounded-full ${badgeClass(txType)}`}>{txType}</span>}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 hover:text-[#41398B] transition-colors">{title}</h3>
                    {!!price && <p className="text-[#41398B] font-bold text-lg mt-auto">{Number(price).toLocaleString()}</p>}
                  </div>
                </div>
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
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  const faqSub = lang === 'en' ? String(d?.homeFaqTitle_en || 'FAQS') : String(d?.homeFaqTitle_vn || 'CÂU HỎI THƯỜNG GẶP')
  const faqTitle = lang === 'en' ? String(d?.homeFaqDescription_en || 'Ask Us Anything') : String(d?.homeFaqDescription_vn || 'Hỏi Chúng Tôi')
  const cardTitle = lang === 'en' ? String(d?.homeFaqImageTitle_en || 'Get in Touch With Us') : String(d?.homeFaqImageTitle_vn || 'Liên Hệ Với Chúng Tôi')
  const cardDesc = lang === 'en' ? String(d?.homeFaqImageDescription_en || '') : String(d?.homeFaqImageDescription_vn || '')
  const btnText = lang === 'en' ? String(d?.homeFaqImageButtonText_en || 'Schedule a Consultation') : String(d?.homeFaqImageButtonText_vn || 'Đặt Lịch Tư Vấn')
  const btnLink = String(d?.homeFaqImageButtonLink || '/contact')
  const cardBg = d?.homeFaqBg ? getImageUrl(String(d.homeFaqBg)) : '/images/property/property1.jpg'

  const rawFaqs = (d?.faqs as Record<string, string>[]) || []
  const faqs = rawFaqs.length > 0 ? rawFaqs : [
    { header_en: 'How do I start the home buying process?', header_vn: 'Làm thế nào để bắt đầu quá trình mua nhà?', content_en: 'Getting pre-approved for a mortgage helps you understand your budget. A real estate agent can guide you through finding and purchasing your new home.', content_vn: 'Được phê duyệt trước cho khoản vay thế chấp giúp bạn hiểu ngân sách của mình.' },
    { header_en: 'What costs are involved in buying a home?', header_vn: 'Chi phí nào liên quan đến việc mua nhà?', content_en: 'Beyond the purchase price, expect closing costs, inspection fees, taxes, and moving expenses.', content_vn: 'Ngoài giá mua, hãy tính đến chi phí đóng cửa, phí kiểm tra, thuế và chi phí chuyển nhà.' },
    { header_en: 'How long does it take to buy a home?', header_vn: 'Mất bao lâu để mua nhà?', content_en: 'The process typically takes 30–60 days from offer acceptance to closing, though this can vary.', content_vn: 'Quá trình này thường mất 30–60 ngày từ khi chấp nhận đề nghị đến khi đóng cửa.' },
  ]

  const navigate = (link: string) => {
    if (link.startsWith('http')) { window.location.href = link; return }
    router.push(link)
  }

  return (
    <section ref={ref} className="py-10 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Card with CTA */}
          <div className="relative rounded-2xl overflow-hidden h-80 md:h-[420px] flex items-end"
            style={{ backgroundImage: `url(${cardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-8">
              <h3 className="text-2xl font-bold text-white mb-3">{cardTitle}</h3>
              {cardDesc && <p className="text-white/80 mb-6 text-sm">{cardDesc}</p>}
              <button className="px-6 py-3 bg-white text-[#41398B] font-bold rounded-full hover:bg-[#E8E8FF] transition"
                onClick={() => navigate(btnLink)}>{btnText}</button>
            </div>
          </div>

          {/* Right: FAQ accordion */}
          <div className={`transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3">{faqSub}</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-black mb-8">{faqTitle}</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(open === i ? -1 : i)}>
                    <span>{lang === 'en' ? faq.header_en : faq.header_vn}</span>
                    <span className="text-[#41398B] text-lg ml-4">{open === i ? '−' : '+'}</span>
                  </button>
                  {open === i && (
                    <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                      {lang === 'en' ? faq.content_en : faq.content_vn}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
    getVisibleTestimonials().then(r => { if (r.data?.success) setTestimonials(r.data.data || []) }).catch(() => {})
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
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  const title = lang === 'en' ? String(d?.homeFindTitle_en || 'Find Your Property,\nStart Your Journey Today') : String(d?.homeFindTitle_vn || 'Tìm Bất Động Sản Của Bạn')
  const desc = lang === 'en' ? String(d?.homeFindDescription_en || '') : String(d?.homeFindDescription_vn || '')
  const bg = d?.homeFindBg ? getImageUrl(String(d.homeFindBg)) : '/images/property/home-banner.jpg'

  return (
    <section ref={ref} className="relative w-full h-[350px] bg-cover bg-center overflow-hidden flex items-center"
      style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          <h2 className={`text-3xl md:text-4xl font-semibold text-white leading-tight mb-4 transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ whiteSpace: 'pre-line' }}>{title}</h2>
          {desc && <p className={`text-lg text-white/90 transition-all duration-1000 delay-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>{desc}</p>}
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
    if (!el || blogs.length === 0) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [blogs.length])

  useEffect(() => {
    import('@/lib/api').then(({ getBlogs }) => {
      getBlogs().then(r => {
        if (r.data?.success) {
          setBlogs((r.data.data as Record<string, unknown>[]).filter(b => b.published).sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime()).slice(0, 3))
        }
      }).catch(() => {})
    })
  }, [])

  const title = lang === 'en' ? String(d?.homeBlogTitle_en || 'Latest News & Insights') : String(d?.homeBlogTitle_vn || 'Tin Tức Mới Nhất')
  const desc = lang === 'en' ? String(d?.homeBlogDescription_en || '') : String(d?.homeBlogDescription_vn || '')

  if (blogs.length === 0) return null

  return (
    <section ref={ref} className="py-10 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3">{title}</p>
          {desc && <h2 className={`text-2xl md:text-4xl font-bold text-gray-900 max-w-2xl mx-auto leading-tight transition-all duration-1000 delay-100 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>{desc}</h2>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, i) => {
            const btitle = loc(blog.title, lang) || 'Untitled'
            const slug = String(blog.slug || blog._id)
            const imgs = (blog.images as { url: string }[]) || []
            const cover = imgs[0]?.url || ''
            const excerpt = loc(blog.excerpt, lang) || ''
            return (
              <Link key={String(blog._id)} href={`/blogs/${slug}`}
                className={`group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}>
                <div className="h-48 overflow-hidden">
                  {cover ? <img src={cover} alt={btitle} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full bg-[#E8E8FF] flex items-center justify-center"><span className="text-[#41398B] text-4xl font-bold opacity-30">183</span></div>}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#41398B] transition">{btitle}</h3>
                  {excerpt && <p className="text-sm text-gray-500 line-clamp-2">{excerpt}</p>}
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
