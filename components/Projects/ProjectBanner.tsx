// @ts-nocheck
'use client'
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Carousel, ConfigProvider } from 'antd'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

import { getAssetBaseURL } from '@/utils/baseURL'
const BASE = getAssetBaseURL()

function imgUrl(p: string) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
}

const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`absolute z-[20] top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full border border-white/50 text-white hover:bg-white hover:text-black transition-all duration-300 ${direction === 'left' ? 'left-8' : 'right-8'}`}
    style={{ pointerEvents: 'auto' }}
  >
    {direction === 'left' ? <ChevronLeft size={24} strokeWidth={1.5} /> : <ChevronRight size={24} strokeWidth={1.5} />}
  </button>
)

export default function ProjectBanner({ data }: { data: Record<string, unknown> }) {
  const { language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const bannerImages = (data?.projectBannerImages as string[]) || []
  if (bannerImages.length === 0) return null

  const title = language === 'en'
    ? (data?.projectBannerTitle as any)?.en || ''
    : (data?.projectBannerTitle as any)?.vi || (data?.projectBannerTitle as any)?.en || ''

  const description = language === 'en'
    ? (data?.projectBannerDesc as any)?.en || ''
    : (data?.projectBannerDesc as any)?.vi || (data?.projectBannerDesc as any)?.en || ''

  return (
    <section ref={ref} className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden group">
      <ConfigProvider
        theme={{
          token: { colorPrimary: '#FFFFFF' },
          components: { Carousel: { dotActiveWidth: 10, dotHeight: 10, dotWidth: 10 } }
        }}
      >
        <Carousel
          autoplay
          autoplaySpeed={6000}
          effect="fade"
          arrows
          prevArrow={<CustomArrow direction="left" />}
          nextArrow={<CustomArrow direction="right" />}
          className="h-full w-full"
        >
          {bannerImages.map((img, index) => (
            <div key={index} className="relative h-[60vh] md:h-[85vh] w-full">
              <img
                src={imgUrl(img)}
                alt={`${title} Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
          ))}
        </Carousel>
      </ConfigProvider>

      <div className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 text-center z-10 pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-[0.05em] mb-4 drop-shadow-lg leading-tight"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="text-sm md:text-lg text-white/90 font-medium tracking-wide drop-shadow-md"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  )
}







