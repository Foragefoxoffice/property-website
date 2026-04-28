'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
// @ts-ignore – lib/api will be created in Task 4
import { addFavorite as apiAddFavorite } from '@/lib/api'
import { toast } from 'react-toastify'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/language/translations'

interface FavoriteItem {
  _id: string
  property: Record<string, any>
  createdAt: string
}

interface FavoritesContextValue {
  favorites: FavoriteItem[]
  loading: boolean
  addFavorite: (property: Record<string, any>) => Promise<boolean>
  removeFavorite: (propertyId: string) => Promise<boolean>
  isFavorite: (propertyId: string) => boolean
  fetchFavorites: () => Promise<void>
  sendEnquiry: (message?: string) => Promise<void>
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('localFavorites')
      if (saved) setFavorites(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const labels = {
    adding: { en: 'Adding to favorites...', vi: 'Thêm vào mục yêu thích...' },
    removing: { en: 'Removing from favorites...', vi: 'Xóa khỏi mục yêu thích...' },
    sending: { en: 'Sending Enquiry...', vi: 'Đang gửi yêu cầu...' },
  }

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localFavorites', JSON.stringify(favorites))
    }
  }, [favorites])

  const fetchFavorites = async () => {
    // No-op for API sync as we are local-first
    setLoading(false)
  }

  const isFavorite = (propertyId: string): boolean => {
    return favorites.some((fav) => {
      const fPropId =
        fav.property._id ||
        fav.property.listingInformation?.listingInformationPropertyId
      return fPropId === propertyId
    })
  }

  const addFavorite = async (property: Record<string, any>): Promise<boolean> => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error(t.loginToAddFavorite)
      return false
    }

    if (!property) return false
    if (typeof property === 'string') {
      console.error('addFavorite requires a property object, not an ID')
      toast.error(t.errorAddingFavorite)
      return false
    }

    const propId =
      property._id || property.listingInformation?.listingInformationPropertyId

    if (isFavorite(propId)) {
      toast.warning(t.alreadyInFavorites)
      return false
    }

    const newFav: FavoriteItem = {
      _id: Date.now().toString(),
      property: property,
      createdAt: new Date().toISOString(),
    }

    setActionLoading('add')
    setFavorites((prev) => [...prev, newFav])
    setActionLoading(null)
    toast.success(t.addedToFavorites)
    return true
  }

  const removeFavorite = async (propertyId: string): Promise<boolean> => {
    if (!propertyId) return false

    setFavorites((prev) =>
      prev.filter((f) => {
        const fPropId =
          f.property._id ||
          f.property.listingInformation?.listingInformationPropertyId
        return f._id !== propertyId && fPropId !== propertyId
      })
    )

    toast.success(t.removedFromFavorites)
    return true
  }

  // Send enquiry (Sync to Backend)
  const sendEnquiry = async (messageProp = ''): Promise<void> => {
    const message = typeof messageProp === 'string' ? messageProp : ''

    if (favorites.length === 0) {
      toast.warning(t.noFavoritesToSend)
      return
    }

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error(t.loginToSendEnquiry)
      return
    }

    try {
      setActionLoading('sending')

      // Extract IDs
      const propertyIds = favorites
        .map(
          (fav) =>
            fav.property._id ||
            fav.property.listingInformation?.listingInformationPropertyId
        )
        .filter(Boolean)

      if (propertyIds.length === 0) {
        toast.error(t.invalidFavorites)
        return
      }

      await apiAddFavorite(propertyIds, message) // Pass message to API
      toast.success(t.enquirySent)
    } catch (error) {
      console.error('Error sending enquiry:', error)
      toast.error(t.errorSendingEnquiry)
    } finally {
      setActionLoading(null)
    }
  }

  const clearFavorites = () => {
    setFavorites([])
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('localFavorites')
      }
    } catch (e) {
      console.error('Error clearing favorites from localStorage', e)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        fetchFavorites,
        sendEnquiry,
        clearFavorites,
      }}
    >
      {children}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-white border-t-[#41398B] rounded-full animate-spin"></div>
            <p className="text-white text-lg tracking-wide font-medium">
              {actionLoading === 'sending'
                ? labels.sending[language as keyof typeof labels.sending]
                : actionLoading === 'add'
                ? labels.adding[language as keyof typeof labels.adding]
                : labels.removing[language as keyof typeof labels.removing]}
            </p>
          </div>
        </div>
      )}
    </FavoritesContext.Provider>
  )
}
