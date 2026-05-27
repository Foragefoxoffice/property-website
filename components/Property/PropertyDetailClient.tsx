'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Share2, Heart, LayoutGrid, ChevronLeft, ChevronRight,
  Image as ImageIcon, X, MapPin, Phone, Bed, Bath,
  Ruler, Layers, Eye, House, SlidersHorizontal,
  Armchair, Mail, Send, PlayIcon
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { SiMessenger, SiZalo } from 'react-icons/si'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { translations } from '@/language/translations'
import { getImageUrl } from '@/utils/baseURL'
import { createEnquiry, getAgent, getListingProperties, addFavorite as apiAddFavorite } from '@/lib/api'
import { formatNumber, stripHtml } from '@/utils/display'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { Skeleton } from 'antd'

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
const safeArray = (arr: any) => (Array.isArray(arr) ? arr : [])

const cleanHtml = (html: string) => {
  if (!html) return ''
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\S\n\r]{2,}/g, ' ')
    .trim()
}

/* -------------------------------------------------------
   SUB-COMPONENTS
------------------------------------------------------- */
const OverviewCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start gap-3 p-3">
    <div className="text-[#41398B] mt-1">{icon}</div>
    <div>
      <p className="text-[11px] text-gray-500 font-bold mb-0.5">{label}</p>
      <p className="text-sm font-bold text-[#222222]">{value || '-'}</p>
    </div>
  </div>
)

const EcoparkItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <span className="text-base font-bold text-[#222222]">{value || '-'}</span>
  </div>
)

const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-sm text-[#111827] font-bold">{value || '-'}</span>
  </div>
)

const txBadgeColor = (cat: string) => {
  const c = String(cat || '').toLowerCase()
  if (c.includes('lease') || c.includes('rent')) return 'bg-[#058135]'
  if (c.includes('sale') || c.includes('sell')) return 'bg-[#eb4d4d]'
  return 'bg-[#055381]'
}

const PropertyCard = ({ property, t, language }: { property: any, t: any, language: string }) => {
  const listing = property.listingInformation || {}
  const financial = property.financialDetails || {}
  const propInfo = property.propertyInformation || {}
  const seo = property.seoInformation || {}

  const getLoc = (val: any) => {
    if (!val) return ''
    if (typeof val === 'string') return val
    return language === 'vi' ? (val.vi || val.en || '') : (val.en || val.vi || '')
  }

  const propDisplayId = listing.listingInformationPropertyId || property._id
  const slug = getLoc(seo.slugUrl)
  const url = `/property-showcase/${propDisplayId}${slug ? `/${slug}` : ''}`

  const txType = getLoc(listing.listingInformationTransactionType)
  const propType = getLoc(listing.listingInformationPropertyType)
  const title = getLoc(listing.listingInformationPropertyTitle) || property.title || t.untitledProperty

  const beds = Number(propInfo.informationBedrooms || 0)
  const baths = Number(propInfo.informationBathrooms || 0)
  const sqft = Number(propInfo.informationUnitSize || 0)
  const img = property.imagesVideos?.propertyImages?.[0]

  const priceSale = financial.financialDetailsPrice
  const priceLease = financial.financialDetailsLeasePrice
  const priceNight = financial.financialDetailsPricePerNight

  let displayPrice = t.contactForPrice
  let displaySuffix = ''
  const typeLower = txType.toLowerCase()

  if (typeLower === 'sale' && priceSale) {
    displayPrice = `${formatNumber(priceSale)} VND`
  } else if (typeLower === 'lease' && priceLease) {
    displayPrice = `${formatNumber(priceLease)} VND`
    displaySuffix = language === 'vi' ? '/ tháng' : '/ month'
  } else if (typeLower === 'home stay' && priceNight) {
    displayPrice = `${formatNumber(priceNight)} VND`
    displaySuffix = language === 'vi' ? '/ đêm' : '/ night'
  }

  const nearbyDesc = getLoc(property.whatNearby?.whatNearbyDescription)
  const zoneDesc = !property.listingInformationVisibility?.areaZone ? getLoc(listing.listingInformationZoneSubArea) : ''
  const descHtml = nearbyDesc || zoneDesc || ''

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <img src={getImageUrl(img)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        <div className="absolute top-3 left-3 flex gap-2">
          {txType && <span className={`px-2 py-1.5 text-[11px] text-white font-bold uppercase tracking-wider rounded-sm shadow-md ${txBadgeColor(txType)}`}>{txType}</span>}
          {propType && <span className="px-2 py-1.5 text-[11px] bg-[#41398B]/90 text-white font-bold uppercase tracking-wider rounded-sm shadow-md">{propType}</span>}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-[20px] font-bold text-[#2a2a2a]">{displayPrice}</span>
          {displaySuffix && <span className="text-sm text-gray-500 font-medium">{displaySuffix}</span>}
        </div>
        <h3 className="text-[17px] font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#41398B] transition-colors">{title}</h3>

        {descHtml && (
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
            <span className="text-[13px] font-bold text-gray-700">{formatNumber(sqft)} {getLoc(listing.listingInformationUnit) || 'Sqft'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function PropertyDetailClient({ property: initialProperty }: { property: Record<string, any> }) {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupIndex, setPopupIndex] = useState(0)
  const [popupDirection, setPopupDirection] = useState(0)
  const [agentData, setAgentData] = useState<any>(null)
  const [agentLoading, setAgentLoading] = useState(true)
  const [recentProperties, setRecentProperties] = useState<any[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [enquiryMsg, setEnquiryMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)
  const [decodedMap, setDecodedMap] = useState('')

  const property = initialProperty || {}
  const id = String(property._id || '')
  const favorited = isFavorite(id)

  const info = property.propertyInformation || {}
  const list = property.listingInformation || {}
  const fin = property.financialDetails || {}
  const what = property.whatNearby || {}
  const visList = property.listingInformationVisibility || {}
  const visProp = property.propertyInformationVisibility || {}
  const visFin = property.financialVisibility || {}

  const getLoc = (val: any) => {
    if (val === undefined || val === null) return ''
    if (typeof val === 'string' || typeof val === 'number') return String(val)
    if (typeof val === 'object') {
      const res = language === 'vi' ? (val.vi || val.en) : (val.en || val.vi)
      return res !== undefined ? String(res) : ''
    }
    return ''
  }

  const safeVal = (val: any) => getLoc(val)

  const images = safeArray(property?.imagesVideos?.propertyImages).filter(Boolean).map(img => getImageUrl(img))
  const videos = safeArray(property?.imagesVideos?.propertyVideo).filter(Boolean).map(v => getImageUrl(v))
  const utilities = safeArray(property?.propertyUtility)
  const transactionType = getLoc(list?.listingInformationTransactionType)
  const propertyType = getLoc(list?.listingInformationPropertyType)
  const title = getLoc(list?.listingInformationPropertyTitle) || property.title || t.untitledProperty
  const location = getLoc(list?.listingInformationCity)

  // Section Refs for sticky navigation
  const sectionRefs = {
    Overview: useRef<HTMLElement>(null),
    Utility: useRef<HTMLElement>(null),
    Payment: useRef<HTMLElement>(null),
    Video: useRef<HTMLElement>(null),
    Map: useRef<HTMLElement>(null),
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentRes, recentRes] = await Promise.all([
          getAgent(),
          getListingProperties({ page: 1, limit: 4, sortBy: 'newest' })
        ])
        setAgentData(agentRes.data?.data)

        let props = recentRes.data?.data || []
        const currentId = property._id || list.listingInformationPropertyId
        props = props.filter((item: any) => (item._id !== currentId && item.listingInformation?.listingInformationPropertyId !== currentId))
        setRecentProperties(props.slice(0, 3))
      } catch (err) {
        console.error('Error fetching supplementary data:', err)
      } finally {
        setAgentLoading(false)
        setLoadingRecent(false)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (list.listingInformationGoogleMapsIframe) {
      const raw = getLoc(list.listingInformationGoogleMapsIframe)
      if (raw) {
        const txt = document.createElement("textarea")
        txt.innerHTML = raw
        setDecodedMap(txt.value)
      }
    }
  }, [list.listingInformationGoogleMapsIframe, language])

  const handlePrev = () => {
    setDirection(-1)
    setCurrent(p => (p - 1 + images.length) % images.length)
  }
  const handleNext = () => {
    setDirection(1)
    setCurrent(p => (p + 1) % images.length)
  }

  const openPopup = (idx: number) => {
    setPopupIndex(idx)
    setIsPopupOpen(true)
  }

  const scrollTo = (name: keyof typeof sectionRefs) => {
    sectionRefs[name]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleFavoriteToggle = async () => {
    if (favorited) {
      removeFavorite(id)
      toast.success(language === 'vi' ? "Đã xóa khỏi mục yêu thích" : "Removed from favorites")
    } else {
      addFavorite(property)
      toast.success(language === 'vi' ? "Đã thêm vào mục yêu thích" : "Added to favorites")
    }
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch { }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success(t.linkCopied)
    }
  }

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) { toast.error(t.loginToSendEnquiry); return }
    setSending(true)
    try {
      await apiAddFavorite(id, enquiryMsg)
      toast.success(t.enquirySent)
      setEnquiryMsg('')
    } catch {
      toast.error(t.errorSendingEnquiry)
    } finally {
      setSending(false)
    }
  }

  const getPriceData = () => {
    const trType = safeVal(list?.listingInformationTransactionType)
    const pSale = fin?.financialDetailsPrice
    const pLease = fin?.financialDetailsLeasePrice
    const pNight = fin?.financialDetailsPricePerNight
    const currencyCode = (typeof fin?.financialDetailsCurrency === 'object' ? fin?.financialDetailsCurrency?.code : fin?.financialDetailsCurrency) || ''

    let price = t.contactForPrice
    let suffix = ""
    let isHidden = false

    if (trType === "Sale" && visFin.price) isHidden = true
    if (trType === "Lease" && visFin.leasePrice) isHidden = true
    if (trType === "Home Stay" && visFin.pricePerNight) isHidden = true

    if (isHidden) return { price: t.contactForPrice, suffix: "" }

    const dispCurrency = visFin.currency ? "" : currencyCode
    const formatPrice = (val: any) => {
      const num = Number(getLoc(val))
      return isNaN(num) ? getLoc(val) : `${formatNumber(num)} ${dispCurrency}`.trim()
    }

    if (trType === "Sale" && pSale) {
      price = formatPrice(pSale)
    } else if (trType === "Lease" && pLease) {
      price = formatPrice(pLease)
      suffix = ` / ${language === 'vi' ? 'tháng' : 'month'}`
    } else if (trType === "Home Stay" && pNight) {
      price = formatPrice(pNight)
      suffix = ` / ${language === 'vi' ? 'đêm' : 'night'}`
    } else if (pSale) {
      price = formatPrice(pSale)
    }

    return { price, suffix }
  }

  const { price, suffix } = getPriceData()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, "-")
  }

  const show = (flag: any) => flag === false || flag === undefined

  return (
    <div className="bg-[#F8F7FC] min-h-screen pt-[20px]">
      {/* 1. Header Section (Breadcrumb + Title) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-[#41398B] transition-colors">{t.home}</Link>
          <span className="text-gray-400">›</span>
          {transactionType && (
            <>
              <Link href={`/listing?type=${list?.listingInformationTransactionType}`} className="hover:text-gray-600 transition-colors">{transactionType}</Link>
              <span className="text-gray-400">›</span>
            </>
          )}
          <span className="text-[#41398B] font-semibold truncate">{title}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex gap-2 mb-4">
              {transactionType && show(visList.transactionType) && (
                <span className={`px-3 py-1.5 text-white text-xs font-bold uppercase tracking-wide rounded ${transactionType === 'Sale' ? 'bg-[#eb4d4d]' : 'bg-[#058135]'}`}>
                  {transactionType}
                </span>
              )}
              {propertyType && show(visList.transactionType) && (
                <span className="px-3 py-1.5 text-white text-xs font-bold uppercase tracking-wide bg-[#6B46C1] rounded">
                  {propertyType}
                </span>
              )}
            </div>
            {show(property.titleVisibility) && (
              <h1 className="text-2xl md:text-[32px] font-bold text-[#222222] leading-tight mb-3">
                {title}
              </h1>
            )}
            {location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-[#41398B]" />
                <span className="text-base">{location}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex items-baseline gap-1 md:mb-3 mb-2">
              <span className="text-2xl md:text-4xl font-bold text-[#41398B] tracking-tight">{price}</span>
              {suffix && <span className="text-lg text-gray-600 font-medium">{suffix}</span>}
            </div>
            <div className="flex gap-4">
              <button onClick={handleShare} className="flex items-center gap-1 text-[#41398B] font-medium text-sm hover:opacity-70 transition">
                <Share2 size={20} /> <span className="underline">{t.share}</span>
              </button>
              <button onClick={handleFavoriteToggle} className="flex items-center gap-1 text-[#41398B] font-medium text-sm hover:opacity-70 transition">
                <Heart size={20} className={favorited ? 'fill-[#eb4d4d] text-[#eb4d4d]' : ''} />
                <span className={`underline ${favorited ? 'text-[#eb4d4d]' : ''}`}>{t.favorite}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Photo Gallery Grid */}
        <div className="relative rounded-xl overflow-hidden group mb-0 shadow-sm">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[350px] lg:h-[480px]">
            <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden" onClick={() => openPopup(0)}>
              <img src={images[0]} className="w-full h-full object-cover transition-all duration-700 hover:scale-105 hover:brightness-90" alt="Main" />
            </div>
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="cursor-pointer overflow-hidden" onClick={() => openPopup(i + 1)}>
                <img src={img} className="w-full h-full object-cover transition-all duration-700 hover:scale-110 hover:brightness-90" alt={`Gallery ${i + 1}`} />
              </div>
            ))}
            {[...Array(Math.max(0, 4 - (images.length - 1)))].map((_, i) => (
              <div key={i} className="bg-gray-100 flex items-center justify-center">
                <ImageIcon className="text-gray-300" size={32} />
              </div>
            ))}
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden relative h-[300px] bg-black">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={current}
                src={images[current]}
                className="absolute inset-0 w-full h-full object-cover"
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500
                  if (swipe && offset.x > 0) handlePrev()
                  else if (swipe && offset.x < 0) handleNext()
                }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
              <button onClick={handlePrev} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white pointer-events-auto hover:bg-white/40"><ChevronLeft size={20} /></button>
              <button onClick={handleNext} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white pointer-events-auto hover:bg-white/40"><ChevronRight size={20} /></button>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              {current + 1} / {images.length}
            </div>
          </div>

          {images.length > 0 && (
            <button onClick={() => openPopup(0)} className="absolute bottom-6 right-6 flex items-center gap-2 bg-white text-[#111827] px-4 py-2 rounded-lg font-semibold text-sm shadow-sm hover:bg-[#41398B] hover:text-white transition-all duration-300 z-10 group">
              <LayoutGrid size={16} />
              {t.viewAllPhoto}
            </button>
          )}
        </div>

        {/* 3. Sticky Navigation Tabs */}
        <div className="sticky top-0 bg-[#F8F7FC]/80 backdrop-blur-md pt-4 z-40 border-b border-gray-200 mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex md:justify-center">
            {[
              { id: 'Overview', label: t.overview },
              { id: 'Utility', label: t.propertyUtility },
              { id: 'Payment', label: t.paymentOverview },
              { id: 'Video', label: t.video },
              { id: 'Map', label: t.map },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id as keyof typeof sectionRefs)}
                className="px-5 py-4 md:text-lg text-sm font-medium text-gray-500 hover:text-[#41398B] relative group transition-colors"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1320px] mx-auto">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <section id="Overview" ref={sectionRefs.Overview} className="scroll-mt-32">
              <div className="bg-white md:p-6 p-4 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-5 text-[#41398B]">{t.overview}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 pb-10 border-b border-gray-100">
                  {show(visList.projectCommunity) && <EcoparkItem label={`${t.projectCommunity}:`} value={getLoc(list?.listingInformationProjectCommunity)} />}
                  {show(visList.areaZone) && <EcoparkItem label={`${t.areaZone}:`} value={getLoc(list?.listingInformationZoneSubArea)} />}
                  {show(visList.blockName) && <EcoparkItem label={`${t.block}:`} value={getLoc(list?.listingInformationBlockName)} />}
                  {show(visList.availableFrom) && <EcoparkItem label={`${t.availableFrom}:`} value={formatDate(list?.listingInformationAvailableFrom)} />}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {show(visList.propertyId) && <OverviewCard icon={<House />} label={`${t.propertyId}:`} value={safeVal(list?.listingInformationPropertyId)} />}
                  {show(visList.transactionType) && <OverviewCard icon={<SlidersHorizontal />} label={`${t.propertyType}:`} value={getLoc(list?.listingInformationPropertyType)} />}
                  {show(visProp.bedrooms) && <OverviewCard icon={<Bed />} label={`${t.bedrooms}:`} value={`${safeVal(info?.informationBedrooms)} ${t.rooms}`} />}
                  {show(visProp.bathrooms) && <OverviewCard icon={<Bath />} label={`${t.bathrooms}:`} value={`${safeVal(info?.informationBathrooms)} ${t.rooms}`} />}
                  {show(visProp.furnishing) && <OverviewCard icon={<Armchair />} label={`${t.furnishing}:`} value={getLoc(info?.informationFurnishing)} />}
                  {show(visProp.unit) && <OverviewCard icon={<Ruler />} label={`${t.size}:`} value={`${safeVal(info?.informationUnitSize)} ${safeVal(info?.informationUnit)}`} />}
                  {show(visProp.floorRange) && <OverviewCard icon={<Layers />} label={`${t.floorRange}:`} value={getLoc(info?.informationFloors)} />}
                  {show(visProp.view) && <OverviewCard icon={<Eye />} label="View:" value={getLoc(info?.informationView)} />}
                </div>
              </div>
            </section>

            {/* Description Section */}
            {(property.descriptionVisibility === false ||
              property.descriptionVisibility === undefined) && (
                <section className="bg-white md:p-6 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold mb-5 text-[#41398B]">{t.description}</h2>
                  <div
                    className="text-gray-700 leading-6 rich-text-display property-description-summary"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(getLoc(what?.whatNearbyDescription)) || t.noDescription }}
                  />
                </section>
              )}

            {/* Utility Section */}
            {utilities.length > 0 && show(property.propertyUtilityVisibility) && (
              <section id="Utility" ref={sectionRefs.Utility} className="scroll-mt-32">
                <div className="bg-white md:p-6 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold mb-5 text-[#41398B]">{t.propertyUtility}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-12">
                    {utilities.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 border-b py-3 last:border-b-0 group">
                        <img src={item?.propertyUtilityIcon} className="w-6 h-6 object-contain" alt="" />
                        <span className="font-medium text-gray-700">{safeVal(item?.propertyUtilityUnitName)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Payment Overview */}
            <section id="Payment" ref={sectionRefs.Payment} className="scroll-mt-32">
              <div className="bg-white md:p-6 p-4 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-[#41398B]">{t.paymentOverview}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {show(visFin.deposit) && <InfoItem label={`${t.deposit}:`} value={safeVal(fin?.financialDetailsDeposit)} />}
                  {show(visFin.paymentTerm) && <InfoItem label={`${t.paymentTerms}:`} value={getLoc(fin?.financialDetailsMainFee)} />}
                  {transactionType === 'Lease' && show(visFin.contractLength) && <InfoItem label={`${t.contractLength}:`} value={getLoc(fin?.financialDetailsContractLength)} />}
                  {transactionType === 'Home Stay' && (
                    <>
                      {show(visFin.checkIn) && <InfoItem label={t.checkIn} value={safeVal(fin?.financialDetailsCheckIn)} />}
                      {show(visFin.checkOut) && <InfoItem label={t.checkOutLabel} value={safeVal(fin?.financialDetailsCheckOut)} />}
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Video Section */}
            {videos.length > 0 && show(property.videoVisibility) && (
              <section id="Video" ref={sectionRefs.Video} className="scroll-mt-32">
                <div className="bg-white md:p-6 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold mb-5 text-[#41398B]">{t.video}</h2>
                  <div className="grid gap-6">
                    {videos.map((url, i) => (
                      <div key={i} onClick={() => setPreviewVideoUrl(url)} className="relative group rounded-3xl overflow-hidden cursor-pointer h-[400px] bg-slate-900 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black to-transparent" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                            <div className="w-14 h-14 bg-[#41398B] rounded-full flex items-center justify-center">
                              <PlayIcon className="text-white fill-white ml-1" size={24} />
                            </div>
                          </div>
                          <span className="text-white font-extrabold tracking-widest text-xs uppercase">{language === 'vi' ? 'Xem Video' : 'Play Video'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Map Section */}
            {show(visList.googleMap) && (
              <section id="Map" ref={sectionRefs.Map} className="scroll-mt-32">
                <div className="bg-white md:p-6 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold mb-5 text-[#41398B]">{t.map}</h2>
                  {decodedMap ? (
                    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
                      <div
                        className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full"
                        dangerouslySetInnerHTML={{ __html: decodedMap }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-center py-12">{t.noMap}</p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Agent Card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4">
                  <h3 className="text-2xl text-[#41398B] font-semibold mb-4">{t.contact}</h3>
                </div>
                <div className="px-6 pb-6">
                  {agentLoading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41398B]" /></div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <img
                          src={agentData?.agentImage ? getImageUrl(agentData.agentImage) : "/placeholder.jpg"}
                          className="w-[250px] h-full object-cover"
                          alt="Agent"
                        />
                      </div>
                      <h4 className="text-xl text-[#41398B] font-semibold mb-4">{t.agent}</h4>

                      <div className="space-y-3 mb-8">
                        {safeArray(agentData?.agentNumber).map((p: any, idx: number) => (
                          <a key={idx} href={`tel:${getLoc(p)}`} className="flex items-center gap-3 text-gray-600 hover:text-[#41398B] transition font-bold text-sm">
                            <Phone size={16} /> {getLoc(p)}
                          </a>
                        ))}
                        {safeArray(agentData?.agentEmail).map((e: any, idx: number) => (
                          <a key={idx} href={`mailto:${getLoc(e)}`} className="flex items-center gap-3 text-gray-600 hover:text-[#41398B] transition font-bold text-sm truncate">
                            <Mail size={16} /> {getLoc(e)}
                          </a>
                        ))}
                      </div>

                      <div className="flex justify-center gap-3 pt-4 border-t">
                        {agentData?.agentZaloLink && (
                          <a href={agentData.agentZaloLink} target="_blank" className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition shadow-sm">
                            <SiZalo size={20} />
                          </a>
                        )}
                        {agentData?.agentMessengerLink && (
                          <a href={agentData.agentMessengerLink} target="_blank" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition shadow-sm">
                            <SiMessenger size={20} />
                          </a>
                        )}
                        {agentData?.agentWhatsappLink && (
                          <a href={agentData.agentWhatsappLink} target="_blank" className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition shadow-sm">
                            <FaWhatsapp size={20} />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Enquiry Form */}
              <div className="mt-6 md:p-6 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.message}</label>
                <form onSubmit={handleEnquiry} className="space-y-4">
                  <textarea
                    value={enquiryMsg}
                    onChange={e => setEnquiryMsg(e.target.value)}
                    placeholder={t.enterMessage}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] transition-all resize-none h-32 text-sm"
                  />
                  <button type="submit" disabled={sending} className="w-full text-white cursor-pointer py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-[#41398B] hover:bg-[#352e7a] disabled:bg-gray-400">
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        {t.sendRequest}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recently Updated Properties */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-10">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[#a4aeb5] font-semibold text-sm uppercase tracking-wider mb-3">{t.recentProperties}</p>
            <h2 className="text-2xl md:text-4xl font-semibold text-black transition-all duration-1000 delay-100">
              {language === 'vi' ? 'Bất động sản mới được cập nhật' : 'Recently Updated Properties'}
            </h2>
          </div>

          {loadingRecent ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-[2.5rem] p-6 h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentProperties.map((p, idx) => (
                <PropertyCard key={idx} property={p} t={t} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Modals */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <div className="p-6 flex justify-between items-center text-white z-[110]">
              <button onClick={() => setIsPopupOpen(false)} className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs hover:opacity-70">
                <X size={24} /> {t.close}
              </button>
              <div className="text-xs font-extrabold tracking-widest">{popupIndex + 1} / {images.length}</div>
              <div className="w-10" />
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4">
              <AnimatePresence initial={false} custom={popupDirection} mode="popLayout">
                <motion.img
                  key={popupIndex}
                  src={images[popupIndex]}
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl absolute inset-0 m-auto"
                  custom={popupDirection}
                  variants={{
                    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500
                    if (swipe && offset.x > 0) {
                      setPopupDirection(-1);
                      setPopupIndex(i => (i - 1 + images.length) % images.length);
                    } else if (swipe && offset.x < 0) {
                      setPopupDirection(1);
                      setPopupIndex(i => (i + 1) % images.length);
                    }
                  }}
                />
              </AnimatePresence>

              <button onClick={() => { setPopupDirection(-1); setPopupIndex(i => (i - 1 + images.length) % images.length) }} className="absolute left-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><ChevronLeft size={40} /></button>
              <button onClick={() => { setPopupDirection(1); setPopupIndex(i => (i + 1) % images.length) }} className="absolute right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><ChevronRight size={40} /></button>
            </div>

            <div className="p-10 bg-black flex gap-3 overflow-x-auto justify-start md:justify-center scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => { setPopupDirection(i > popupIndex ? 1 : -1); setPopupIndex(i) }} className={`w-20 h-14 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 ${popupIndex === i ? 'ring-4 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {previewVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <button onClick={() => setPreviewVideoUrl(null)} className="absolute top-10 right-10 text-white hover:rotate-90 transition-transform"><X size={40} /></button>
            <div className="w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-black border border-white/10">
              <video src={previewVideoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .property-description-summary ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
          list-style-position: outside !important;
        }
        .property-description-summary ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
          list-style-position: outside !important;
        }
        .property-description-summary li {
          margin-bottom: 0.5rem !important;
          color: #374151 !important;
          font-weight: 500 !important;
          display: list-item !important;
        }
        .property-description-summary strong {
          color: #111827;
          font-weight: 800;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
