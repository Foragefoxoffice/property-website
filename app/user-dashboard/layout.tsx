// app/user-dashboard/layout.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Heart, User, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { translations } from '@/language/translations'
import PublicHeader from '@/components/Layout/PublicHeader'

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const { favorites } = useFavorites()
  const t = translations[language as keyof typeof translations]
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('userRole')
    if (!token || role !== 'user') {
      router.replace('/login')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#41398B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (path: string) => pathname.startsWith(path)

  const navItems = [
    { href: '/user-dashboard/profile', icon: <User size={20} />, label: String((t as Record<string, string>).myProfile || 'My Profile') },
    { href: '/user-dashboard/favorites', icon: <Heart size={20} />, label: String((t as Record<string, string>).myFavorites || 'My Favorites') },
    { href: '/user-dashboard/enquiries', icon: <MessageSquare size={20} />, label: 'My Enquiries' },
  ]

  return (
    <>
      <PublicHeader />
      <div className="flex h-[calc(100vh-80px)] bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD] pt-4 pb-16 lg:pb-0 relative">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-[280px] flex-col items-center py-6 h-full overflow-y-auto scrollbar-hide" data-lenis-prevent>
          <div className="flex flex-col w-full gap-4 px-4">
            {navItems.map(({ href, icon, label }) => (
              <Link key={href} href={href}
                className={`group flex items-center gap-3 px-2 py-2 rounded-full transition
                  ${isActive(href) ? 'bg-[#41398B] text-white' : 'text-[#41398B] hover:bg-[#41398B] hover:text-white'}`}>
                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">{icon}</span>
                <span className={`font-medium ${isActive(href) ? 'text-[#fff]' : 'hover:text-[#fff]'}`}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" data-lenis-prevent>{children}</div>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-[9999] lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {navItems.map(({ href, icon, label }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-colors
                  ${active ? 'text-[#41398B]' : 'text-gray-400'}`}>
                {React.cloneElement(icon as React.ReactElement, {
                  className: active ? 'fill-[#41398B]/10' : ''
                })}
                {href.includes('favorites') && favorites.length > 0 && (
                  <span className="absolute top-2 right-1/4 bg-[#41398B] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white pulse">
                    {favorites.length}
                  </span>
                )}
                <span className="text-[10px] font-medium mt-1">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
