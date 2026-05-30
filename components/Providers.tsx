'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { PermissionProvider } from '@/context/PermissionContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SocketProvider } from '@/context/SocketContext'
import { ToastContainer } from 'react-toastify'

import { useEffect } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      let message = ''
      if ('message' in event) {
        message = event.message
      } else if ('reason' in event && event.reason) {
        message = event.reason.message || String(event.reason)
      }

      const isChunkError =
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk') ||
        message.includes('unexpected token <') ||
        message.includes('Failed to fetch dynamically imported module')

      if (isChunkError) {
        window.location.reload()
      }
    }

    window.addEventListener('error', handleError as EventListener)
    window.addEventListener('unhandledrejection', handleError as EventListener)

    return () => {
      window.removeEventListener('error', handleError as EventListener)
      window.removeEventListener('unhandledrejection', handleError as EventListener)
    }
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
