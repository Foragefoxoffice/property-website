'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

import { getAssetBaseURL } from '@/utils/baseURL'
const BASE = getAssetBaseURL()
function imgUrl(p: string) {
  if (!p) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop'
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
}
const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 10 } },
}

export default function BlogBanner({ title, backgroundImage }: { title: string; backgroundImage?: string }) {
  const { language } = useLanguage()
  const bg = imgUrl(backgroundImage || '')

  return (
    <div className="relative lg:h-[400px] h-96 w-full flex items-center justify-center bg-cover bg-center">
      <div className="absolute inset-0">
        <img src={bg} alt="News Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <motion.div className="relative z-10 text-center text-white px-4" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>
          {title}
        </motion.h1>
        <motion.div className="flex items-center justify-center space-x-2 text-sm md:text-base text-gray-200" variants={itemVariants}>
          <Link href="/" className="hover:text-white transition-colors duration-200">
            {language === 'en' ? 'Home' : 'Trang Chủ'}
          </Link>
          <span>&gt;</span>
          <span className="text-white font-medium">{title}</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
