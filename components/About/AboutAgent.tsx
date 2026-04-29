'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

import { getAssetBaseURL } from '@/utils/baseURL'
const BASE = getAssetBaseURL()
function imgUrl(p: string) {
  if (!p) return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop'
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, duration: 0.6 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } } }
const imageVariants = { hidden: { opacity: 0, x: 50, scale: 0.95 }, visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' as const } } }

export default function AboutAgent({ data }: { data: Record<string, unknown> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { language } = useLanguage()

  const subTitle = language === 'en' ? String(data?.aboutAgentTitle_en || 'TOP AGENT') : String(data?.aboutAgentTitle_vn || 'ĐẠI LÝ HÀNG ĐẦU')
  const title = language === 'en' ? String(data?.aboutAgentSubTitle_en || 'Jessica Lane') : String(data?.aboutAgentSubTitle_vn || 'Jessica Lane')
  const stats = language === 'en' ? String(data?.aboutAgentDescription_en || 'Total Sales Volume: $48M+ in Closed Sales') : String(data?.aboutAgentDescription_vn || 'Tổng Doanh Số Bán Hàng: $48M+ Trong Doanh Số Đóng')
  const description = language === 'en'
    ? String(data?.aboutAgentContent_en || 'With over a decade of real estate experience in luxury coastal properties, Jessica is known for her integrity, deep market knowledge and commitment to her clients.')
    : String(data?.aboutAgentContent_vn || 'Với hơn một thập kỷ kinh nghiệm bất động sản trong bất động sản ven biển cao cấp, Jessica được biết đến với sự chính trực và cam kết với khách hàng.')
  const buttonText = language === 'en' ? String(data?.aboutAgentButtonText_en || 'View Agent') : String(data?.aboutAgentButtonText_vn || 'View Đại Lý')
  const buttonLink = String(data?.aboutAgentButtonLink || '#')
  const agentImage = imgUrl(String(data?.aboutAgentImage || ''))

  return (
    <section ref={ref} className="md:py-24 py-8 md:px-6 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div className="lg:col-span-5 flex flex-col justify-center" initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={containerVariants}>
            <motion.span variants={itemVariants} className="text-gray-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">{subTitle}</motion.span>
            <motion.h2 variants={itemVariants} className="text-2xl md:text-4xl font-bold text-[#1a1a1a] md:mb-6 mb-4">{title}</motion.h2>
            <motion.p variants={itemVariants} className="md:text-xl text-lg font-bold text-[#1a1a1a] mb-2">{stats}</motion.p>
            <motion.p variants={itemVariants} className="text-gray-500 text-md leading-relaxed mb-8">{description}</motion.p>
            <motion.div variants={itemVariants}>
              <a href={buttonLink} className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#41398B] transition-colors duration-300 group">
                {buttonText}
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
          <motion.div className="lg:col-span-7 relative flex items-center justify-center" initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={imageVariants}>
            <div className="relative rounded-3xl overflow-hidden">
              <img src={agentImage} alt={title} className="w-[550px] h-full object-cover transform hover:scale-105 transition-transform duration-700" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
