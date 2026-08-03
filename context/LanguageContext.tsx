'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface LanguageContextValue {
  language: string
  toggleLanguage: (lang: string) => void
  setDynamicRouteSlugs: (slugs: Record<string, string> | null) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'vi',
  toggleLanguage: () => {},
  setDynamicRouteSlugs: () => {},
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname() || ''
  
  const [dynamicSlugs, setDynamicSlugs] = useState<Record<string, string> | null>(null)

  const setDynamicRouteSlugs = useCallback((slugs: Record<string, string> | null) => {
    setDynamicSlugs(prev => {
      if (!prev && !slugs) return null;
      if (prev && slugs && prev.vi === slugs.vi && prev.en === slugs.en) return prev;
      return slugs;
    })
  }, [])

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
    
    const currentPathWithoutLang = isLocale ? '/' + pathname.split('/').slice(2).join('/') : pathname;
    if (dynamicSlugs && dynamicSlugs[lang] && dynamicSlugs[language]?.toLowerCase() === currentPathWithoutLang.toLowerCase()) {
      const search = window.location.search;
      router.push(`/${lang}${dynamicSlugs[lang]}${search}`)
      return;
    }

    if (isLocale) {
      let basePath = '/' + pathname.split('/').slice(2).join('/')
      
      // Remove trailing slash for reliable matching
      if (basePath.endsWith('/') && basePath.length > 1) {
        basePath = basePath.slice(0, -1);
      }
      if (!basePath) basePath = '/'

      const slugMap: Record<string, Record<string, string>> = {
        vi: {
          '/about': '/ve-chung-toi',
          '/contact': '/lien-he',
          '/terms-conditions': '/dieu-khoan-dieu-kien',
          '/privacy-policy': '/chinh-sach-bao-mat',
          '/blogs': '/tin-tuc',
        },
        en: {
          '/about': '/about-us',
          '/contact': '/contact',
          '/terms-conditions': '/terms-and-conditions',
          '/privacy-policy': '/privacy-policy',
          '/blogs': '/blog',
        }
      };

      // 1. Find internal canonical path from current URL by searching ALL languages
      let internalPath = basePath;
      let found = false;
      
      for (const langKey of Object.keys(slugMap)) {
        if (found) break;
        for (const [canonical, translated] of Object.entries(slugMap[langKey])) {
          if (basePath.toLowerCase() === translated.toLowerCase()) {
            internalPath = canonical;
            found = true;
            break;
          }
        }
      }

      // Fallback: If it's already a canonical path like '/about', it will just stay '/about'
      
      // 2. Map to the new language's translated slug
      const newTranslatedPath = slugMap[lang]?.[internalPath] || internalPath;
      
      const search = window.location.search;
      const newPathname = `/${lang}${newTranslatedPath === '/' ? '' : newTranslatedPath}${search}`
      console.log("Language Switch Debug:", { pathname, urlLang, basePath, internalPath, newTranslatedPath, newPathname })
      router.push(newPathname)
    } else {
      const search = window.location.search;
      router.push(`/${lang}${pathname}${search}`)
    }
  }



  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setDynamicRouteSlugs }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
