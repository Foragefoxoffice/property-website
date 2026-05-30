'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface LanguageContextValue {
  language: string
  toggleLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'vi',
  toggleLanguage: () => {},
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>('vi')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (saved) setLanguage(saved)
    setIsReady(true)
  }, [])

  const toggleLanguage = (lang: string) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  // Don't render children until we've read localStorage
  // This prevents the visible language flicker on refresh
  if (!isReady) return null

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
