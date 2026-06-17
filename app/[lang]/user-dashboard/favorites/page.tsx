'use client'

import React, { useState } from 'react'
import { Heart, Trash2, Calendar, AlertTriangle } from 'lucide-react'
import Link from '@/components/LanguageLink'
import { Skeleton } from 'antd'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { formatNumber, normalizeFancyText, stripHtml } from '@/utils/display'
import { getImageUrl } from '@/utils/baseURL'

export default function FavoritesPage() {
  const { language } = useLanguage()
  const { favorites, loading, removeFavorite, sendEnquiry } = useFavorites()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [message, setMessage] = useState('')

  // isDashboard is always true in the Next.js page
  const isDashboard = true

  const handleSendEnquiry = async () => {
    await sendEnquiry(message)
    setShowEnquiryModal(false)
    setMessage('')
  }

  const t = language === 'en' ? {
    pageTitle: 'My Favorites',
    listing: 'Listing',
    datePublished: 'Date Published',
    action: 'Action',
    noFavorites: 'No favorites yet',
    noFavoritesDesc: 'Start exploring and save properties you love to your favorites list.',
    browseProperties: 'Browse Properties',
    postingDate: 'Posting date:',
    contactForPrice: 'Contact for Price',
    delete: 'Delete',
    removeFromFavorites: 'Remove from Favorites',
    deleteConfirmation: 'Are you sure you want to remove this property from your favorites?',
    cancel: 'Cancel',
    remove: 'Remove',
    locationNA: 'Location N/A',
    untitledProperty: 'Untitled Property',
    removedSuccess: 'Removed from favorites',
    removeFail: 'Failed to remove favorite',
    removeProperty: 'Remove Property',
    sendEnquiry: 'Send Enquiry',
    message: 'Message',
    optional: 'Optional',
    enterMessage: 'Enter your message',
    favoritesEnquiryDesc: 'Send an enquiry to the property owner.',
    send: 'Send',
    favoritesEnquiryTitle: 'Send Enquiry',
  } : {
    pageTitle: 'Mục Yêu Thích',
    listing: 'Danh Sách',
    datePublished: 'Ngày Đăng',
    action: 'Hành Động',
    noFavorites: 'Chưa có mục yêu thích',
    noFavoritesDesc: 'Bắt đầu khám phá và lưu các bất động sản bạn yêu thích vào danh sách.',
    browseProperties: 'View Bất Động Sản',
    postingDate: 'Ngày đăng:',
    contactForPrice: 'Liên hệ giá',
    delete: 'Xóa',
    removeFromFavorites: 'Xóa khỏi Yêu Thích',
    deleteConfirmation: 'Bạn có chắc chắn muốn xóa bất động sản này khỏi danh sách yêu thích?',
    cancel: 'Hủy',
    remove: 'Xóa',
    locationNA: 'Vị trí không xác định',
    untitledProperty: 'Bất động sản chưa có tên',
    removedSuccess: 'Đã xóa khỏi danh sách yêu thích',
    removeFail: 'Xóa thất bại',
    removeProperty: 'Xóa Bất Động Sản',
    sendEnquiry: 'Gửi Yêu Cầu',
    message: 'Tin nhắn',
    optional: 'Tùy chọn',
    enterMessage: 'Nhập tin nhắn của bạn',
    favoritesEnquiryDesc: 'Gửi yêu cầu đến chủ sở hữu bất động sản.',
    send: 'Gửi',
    favoritesEnquiryTitle: 'Gửi Yêu Cầu',
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const success = await removeFavorite(deleteId)
      if (success) {
        setDeleteId(null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
  }

  const getLocalizedValue = (value: unknown): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      const v = value as Record<string, string>
      return language === 'vi' ? (v.vi || v.en || '') : (v.en || v.vi || '')
    }
    return ''
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  return (
    <div className={isDashboard ? 'w-full' : 'min-h-screen bg-gray-50 flex flex-col'}>
      <main className={`${isDashboard ? 'w-full' : 'flex-grow max-w-7xl mx-auto w-full px-6 py-10'} animate-slideUpFade`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Heart className="text-[#eb4d4d] fill-[#eb4d4d]" size={32} />
            <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
            <span className="ml-3 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
              {favorites.length}
            </span>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="md:ml-auto w-full md:w-auto bg-[#41398B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#352e7a] transition-colors shadow-lg hover:shadow-xl"
            >
              {t.sendEnquiry}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton active key={i} avatar paragraph={{ rows: 2 }} className="bg-white p-6 rounded-xl shadow-sm" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-gray-300" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.noFavorites}</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">{t.noFavoritesDesc}</p>
            <Link
              href="/listing"
              className="inline-block bg-[#41398B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#352e7a] transition-colors shadow-lg hover:shadow-xl"
            >
              {t.browseProperties}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header - Desktop Only */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-sm uppercase tracking-wider">
              <div className="col-span-6">{t.listing}</div>
              <div className="col-span-3">{t.datePublished}</div>
              <div className="col-span-3 text-center">{t.action}</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-100">
              {favorites.map((fav) => {
                const prop = fav.property as Record<string, unknown> | null
                if (!prop) return null

                const financialVisibility = (prop.financialVisibility as Record<string, boolean>) || {}
                const financialDetails = (prop.financialDetails as Record<string, unknown>) || {}
                const priceSale = financialDetails.financialDetailsPrice as number | undefined
                const priceLease = financialDetails.financialDetailsLeasePrice as number | undefined
                const priceNight = financialDetails.financialDetailsPricePerNight as number | undefined
                const genericPrice = financialDetails.financialDetailsPrice as number | undefined
                const currencyData = financialDetails.financialDetailsCurrency
                const currencyCode = (typeof currencyData === 'object' && currencyData ? (currencyData as Record<string, string>).code : currencyData as string) || ''
                const dispCurrency = financialVisibility.currency ? '' : currencyCode
                const listingInfo = (prop.listingInformation as Record<string, unknown>) || {}
                const rawType = getLocalizedValue(
                  listingInfo.listingInformationTransactionType
                )

                const typeLower = String(rawType || '').toLowerCase()
                const isSale = typeLower.includes('sale') || typeLower.includes('sell') || typeLower.includes('bán')
                const isLease = typeLower.includes('lease') || typeLower.includes('rent') || typeLower.includes('cho thuê')
                const isHomeStay = typeLower.includes('home stay') || typeLower.includes('homestay')

                const type =
                  language === 'vi'
                    ? isLease
                      ? 'Cho thuê'
                      : isSale
                        ? 'Bán'
                        : isHomeStay
                          ? 'Homestay'
                          : rawType
                    : rawType

                let displayPrice = t.contactForPrice
                let isPriceHidden = false

                if (isSale && financialVisibility.price) isPriceHidden = true
                else if (isLease && financialVisibility.leasePrice) isPriceHidden = true
                else if (isHomeStay && financialVisibility.pricePerNight) isPriceHidden = true

                const formatP = (p: number) => `${formatNumber(p)} ${dispCurrency}`.trim()

                if (!isPriceHidden) {
                  if (isSale && priceSale) {
                    displayPrice = formatP(priceSale)
                  } else if (isLease && priceLease) {
                    displayPrice = `${formatP(priceLease)} ${language === 'vi' ? '/ tháng' : '/ month'
                      }`
                  } else if (isHomeStay && priceNight) {
                    displayPrice = `${formatP(priceNight)} ${language === 'vi' ? '/ đêm' : '/ night'
                      }`
                  } else if (genericPrice) {
                    displayPrice = formatP(genericPrice)
                  }
                }

                const imagesVideos = (prop.imagesVideos as Record<string, unknown[]>) || {}
                const propertyImages = (imagesVideos.propertyImages as string[]) || []
                const seoInfo = (prop.seoInformation as Record<string, unknown>) || {}
                const whatNearby = (prop.whatNearby as Record<string, unknown>) || {}

                return (
                  <div key={fav._id as string} className="p-4 md:p-5 hover:bg-gray-50 transition-colors group border-b last:border-0 border-gray-100">
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center">
                      {/* Property Details */}
                      <div
                        className="md:col-span-6 flex gap-4 cursor-pointer"
                        onClick={() => {
                          const id = listingInfo.listingInformationPropertyId || prop._id
                          const slug = getLocalizedValue(seoInfo.slugUrl)
                          window.open(`/listing/${slug ? slug + '-' : ''}${id}`, '_blank')
                        }}
                      >
                        <div className="w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                          <img
                            src={getImageUrl(propertyImages[0]) || '/images/property/dummy-img.avif'}
                            alt="Property"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                            {type || 'Property'}
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-[#41398B] text-base sm:text-[20px] transition-colors">
                            {normalizeFancyText(getLocalizedValue(listingInfo.listingInformationPropertyTitle) || t.untitledProperty) as string}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1 line-clamp-2">
                            {stripHtml(
                              getLocalizedValue(whatNearby.whatNearbyDescription) ||
                              getLocalizedValue(listingInfo.listingInformationZoneSubArea) ||
                              t.locationNA
                            )}
                          </p>
                          <p className="text-[#41398B] font-bold text-base sm:text-lg">{displayPrice}</p>
                        </div>
                      </div>

                      {/* Date and Action container */}
                      <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        {/* Date */}
                        <div className="md:col-span-3 text-sm text-gray-600 flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          <span className="md:hidden font-medium mr-1 text-gray-400">{t.datePublished}: </span>
                          {formatDate((listingInfo.listingInformationDateListed || prop.createdAt || prop.updatedAt) as string)}
                        </div>

                        {/* Action */}
                        <div className="md:col-span-3 text-right md:text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmDelete(prop._id as string)
                            }}
                            className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium w-full md:w-auto"
                          >
                            <Trash2 size={16} className="mr-2" />
                            <span className="md:inline">{t.removeFromFavorites}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Confirm Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-modalPop border border-gray-100">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.removeProperty}</h3>
              <p className="text-gray-500 leading-relaxed">{t.deleteConfirmation}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-[#eb4d4d] text-white font-semibold rounded-xl hover:bg-[#d44545] transition-all shadow-lg shadow-red-100 active:scale-95"
              >
                {t.remove}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-modalPop border border-gray-100">
            <div className="flex flex-col mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t.favoritesEnquiryTitle}
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {t.favoritesEnquiryDesc}
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.message}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.enterMessage}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] transition-all resize-none h-40 text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowEnquiryModal(false)
                  setMessage('')
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSendEnquiry}
                className="flex-1 px-6 py-3 bg-[#41398B] text-white font-semibold rounded-xl hover:bg-[#352e7a] transition-all shadow-lg active:scale-95"
              >
                {t.send || 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
