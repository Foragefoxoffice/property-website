'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { PermissionProvider } from '@/context/PermissionContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SocketProvider } from '@/context/SocketContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Providers({ children }: { children: React.ReactNode }) {
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
