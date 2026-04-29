'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, BedDouble, Bath, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFavorites } from '@/context/FavoritesContext'
import { useLanguage } from '@/context/LanguageContext'
import { createEnquiry } from '@/lib/api'
import { toast } from 'react-toastify'

export default function PropertyDetailClient({ property }: { property: Record<string, unknown> }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { language } = useLanguage()
  const [currentImage, setCurrentImage] = useState(0)
  const [enquiryMsg, setEnquiryMsg] = useState('')
  const [sending, setSending] = useState(false)

  const id = String(property._id || '')
  const listing = (property.listingInformation as Record<string, unknown>) || {}
  const title = String(property.title || listing.title || 'Property')
  const description = String(property.description || listing.description || '')
  const price = String(listing.price || listing.listingPrice || listing.rentalPrice || '')
  const type = String(listing.listingType || '')
  const location = String(listing.zone || listing.area || listing.location || '')
  const bedrooms = String(listing.bedrooms || listing.numberOfBedrooms || '')
  const bathrooms = String(listing.bathrooms || listing.numberOfBathrooms || '')
  const area = String(listing.area || listing.floorArea || '')
  const images = (property.images as { url: string }[]) || []
  const favorited = isFavorite(id)

  const prevImage = () => setCurrentImage(i => (i === 0 ? images.length - 1 : i - 1))
  const nextImage = () => setCurrentImage(i => (i === images.length - 1 ? 0 : i + 1))

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) { toast.error('Please login to send an enquiry'); return }
    setSending(true)
    try {
      await createEnquiry({ propertyIds: [id], message: enquiryMsg })
      toast.success('Enquiry sent successfully!')
      setEnquiryMsg('')
    } catch {
      toast.error('Failed to send enquiry')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/listing" className="inline-flex items-center gap-1 text-sm text-[#41398B] hover:underline mb-6">
        <ChevronLeft size={16} /> Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — images + details */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96 bg-gray-100 mb-4">
              <img src={images[currentImage]?.url} alt={title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition">
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.slice(0, 6).map((img, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${i === currentImage ? 'border-[#41398B]' : 'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl h-72 bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-gray-400">No images available</span>
            </div>
          )}

          {/* Title + meta */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {type && <span className="inline-block mt-1 px-3 py-0.5 bg-[#41398B] text-white text-xs rounded-full">{type}</span>}
            </div>
            <button onClick={() => favorited ? removeFavorite(id) : addFavorite(property)}
              className="p-3 rounded-full border border-gray-200 hover:border-[#41398B] transition">
              <Heart size={20} className={favorited ? 'fill-[#41398B] text-[#41398B]' : 'text-gray-400'} />
            </button>
          </div>

          {location && <p className="flex items-center gap-1 text-gray-500 text-sm mb-4"><MapPin size={14} />{location}</p>}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {price && <div className="bg-[#E8E8FF] rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Price</p><p className="font-bold text-[#41398B] text-sm">{price}</p></div>}
            {bedrooms && <div className="bg-gray-50 rounded-xl p-3 text-center"><BedDouble size={16} className="mx-auto mb-1 text-gray-500" /><p className="text-xs text-gray-500">Bedrooms</p><p className="font-semibold text-sm">{bedrooms}</p></div>}
            {bathrooms && <div className="bg-gray-50 rounded-xl p-3 text-center"><Bath size={16} className="mx-auto mb-1 text-gray-500" /><p className="text-xs text-gray-500">Bathrooms</p><p className="font-semibold text-sm">{bathrooms}</p></div>}
            {area && <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Area</p><p className="font-semibold text-sm">{area}</p></div>}
          </div>

          {description && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2">Description</h2>
              <div className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          )}
        </div>

        {/* Right — enquiry form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4">
            <h3 className="font-bold text-gray-800 mb-4">Send Enquiry</h3>
            <form onSubmit={handleEnquiry} className="space-y-3">
              <textarea
                value={enquiryMsg}
                onChange={e => setEnquiryMsg(e.target.value)}
                placeholder={language === 'vi' ? 'Tin nhắn của bạn...' : 'Your message...'}
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#41398B] resize-none"
              />
              <button type="submit" disabled={sending}
                className="w-full py-3 bg-[#41398B] text-white rounded-xl font-semibold text-sm hover:bg-[#41398be1] transition disabled:opacity-60">
                {sending ? 'Sending...' : language === 'vi' ? 'Gửi yêu cầu' : 'Send Enquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
