'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

import { getAssetBaseURL } from '@/utils/baseURL'
const BASE = getAssetBaseURL()
function imgUrl(p: string) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
}

export default function AboutBanner({ data }: { data: Record<string, unknown> }) {
  const { language } = useLanguage()
  const title = language === 'en'
    ? String(data?.aboutBannerTitle_en || 'About Us')
    : String(data?.aboutBannerTitle_vn || 'Về chúng tôi')
  const bg = data?.aboutBannerBg
    ? imgUrl(String(data.aboutBannerBg))
    : 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop'

  return (
    <div className="relative lg:h-[400px] h-96 w-full flex items-center justify-center bg-cover bg-center">
      <div className="absolute inset-0">
        <img src={bg} alt="About Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4">{title}</h1>
        <div className="flex items-center gap-2 text-white/80 text-sm md:text-base">
          <Link href="/" className="hover:text-white transition-colors">
            {language === 'en' ? 'Home' : 'Trang Chủ'}
          </Link>
          <span>&gt;</span>
          <span className="text-white">{title}</span>
        </div>
      </div>
    </div>
  )
}
