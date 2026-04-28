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

  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (saved) setLanguage(saved)
  }, [])

  const toggleLanguage = (lang: string) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
