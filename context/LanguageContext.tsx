'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface LanguageContextValue {
  language: string
  toggleLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'vi',
  toggleLanguage: () => {},
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname() || ''
  
  const urlLang = pathname.split('/')[1]
  const isLocale = urlLang === 'en' || urlLang === 'vi'
  const language = isLocale ? urlLang : 'vi'

  const toggleLanguage = (lang: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
      document.cookie = `language=${lang}; path=/; max-age=31536000`
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('routeChangeStart'));
    }
    
    if (isLocale) {
      const newPathname = pathname.replace(`/${urlLang}`, `/${lang}`)
      router.push(newPathname)
    } else {
      router.push(`/${lang}${pathname}`)
    }
  }



  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
