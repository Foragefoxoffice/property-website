'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { PermissionProvider } from '@/context/PermissionContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SocketProvider } from '@/context/SocketContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useEffect } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message && e.message.includes('ChunkLoadError')) {
        window.location.reload()
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <LanguageProvider>
      <PermissionProvider>
        <FavoritesProvider>
          <SocketProvider>
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </SocketProvider>
        </FavoritesProvider>
      </PermissionProvider>
    </LanguageProvider>
  )
}
