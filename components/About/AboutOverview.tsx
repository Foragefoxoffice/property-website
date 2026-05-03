'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

import { getImageUrl } from '@/utils/baseURL'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function AboutOverview({ data }: { data: Record<string, unknown> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { language } = useLanguage()

  const title = language === 'en'
    ? String(data?.aboutOverviewTitle_en || 'Your Reliable Partner In Real Estate Success')
    : String(data?.aboutOverviewTitle_vn || 'Đối Tác Đáng Tin Cậy Trong Thành Công Bất Động Sản')
  const description = language === 'en'
    ? String(data?.aboutOverviewDescription_en || '')
    : String(data?.aboutOverviewDescription_vn || '')
  const bg = getImageUrl(String(data?.aboutOverviewBg || '')) || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1932&auto=format&fit=crop'

  return (
    <section ref={ref} className="md:py-14 py-9 pb-0 md:px-6 px-2 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          className="mb-8 max-w-4xl"
        >
          <motion.span variants={itemVariants} className="text-gray-400 text-sm font-bold tracking-[0.2em] uppercase md:mb-4 mb-2 block">
            {title}
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#1a1a1a] leading-tight">
            {description}
          </motion.h2>
        </motion.div>
        <motion.div
          className="w-full h-[400px] md:h-[550px] rounded-3xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 50 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed', backgroundPosition: 'center', backgroundSize: 'cover' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
