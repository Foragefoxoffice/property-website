'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1').replace(/\/api\/v1$/, '')
function imgUrl(p: string) {
  if (!p) return '/images/property/home-banner.jpg'
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
}

export default function AboutFindProperty({ data }: { data: Record<string, unknown> }) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { language } = useLanguage()

  const title = language === 'en'
    ? String(data?.aboutFindTitle_en || 'Find Your Property,\nStart Your Homeownership Journey Today')
    : String(data?.aboutFindTitle_vn || 'Tìm Bất Động Sản Của Bạn,\nBắt Đầu Hành Trình Sở Hữu Nhà Ngay Hôm Nay')
  const description = language === 'en'
    ? String(data?.aboutFindDescription_en || 'Connect with your Designer in minutes')
    : String(data?.aboutFindDescription_vn || 'Kết nối với Nhà thiết kế của bạn trong vài phút')
  const bg = imgUrl(String(data?.aboutFindBg || ''))

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true) }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[300px] md:h-[350px] bg-cover bg-center overflow-hidden flex items-center"
      style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }}
    >
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          <h2 className={`text-3xl md:text-4xl font-semibold text-white leading-tight mb-4 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {title}
          </h2>
          <p className={`text-md md:text-lg text-white/90 transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
