'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from '@/components/LanguageLink'
import { useLanguage } from '@/context/LanguageContext'

import { getAssetBaseURL } from '@/utils/baseURL'
const BASE = getAssetBaseURL()

type Box = { icon?: string; title_en?: string; title_vn?: string; title?: string; description_en?: string; description_vn?: string; description?: string }

const defaultBoxes: Box[] = [
  { title_en: 'Personalized Support', title_vn: 'Hỗ Trợ Cá Nhân Hóa', description_en: 'Receive tailored assistance from our experienced team to ensure every step fits your specific needs.', description_vn: 'Nhận được sự hỗ trợ được tùy chỉnh từ đội ngũ giàu kinh nghiệm của chúng tôi.' },
  { title_en: 'Time-Saving Process', title_vn: 'Quy Trình Tiết Kiệm Thời Gian', description_en: 'From quick callbacks to streamlined procedures, we value your time and help you move forward without delays.', description_vn: 'Từ việc gọi lại nhanh chóng đến các thủ tục được sắp xếp hợp lý, chúng tôi trân trọng thời gian của bạn.' },
  { title_en: 'Trusted Expertise', title_vn: 'Chuyên Môn Đáng Tin Cậy', description_en: 'Work with professionals who bring deep industry knowledge and proven strategies to guide your decisions confidently.', description_vn: 'Làm việc với các chuyên gia mang lại kiến thức sâu sắc về ngành và chiến lược đã được chứng minh.' },
]

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } } }
const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } } }

export default function AboutWhyChoose({ data }: { data: Record<string, unknown> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { language } = useLanguage()

  const title = language === 'en' ? String(data?.aboutWhyChooseDescription_en || 'Experience The Difference With Our Solutions') : String(data?.aboutWhyChooseDescription_vn || 'Trải Nghiệm Sự Khác Biệt Với Giải Pháp Của Chúng Tôi')
  const subTitle = language === 'en' ? String(data?.aboutWhyChooseTitle_en || 'WHY CHOOSE US') : String(data?.aboutWhyChooseTitle_vn || 'TẠI SAO CHỌN CHÚNG TÔI')
  const buttonText = language === 'en' ? String(data?.aboutWhyChooseButtonText_en || 'Contact Us') : String(data?.aboutWhyChooseButtonText_vn || 'Liên Hệ')
  const buttonLink = String(data?.aboutWhyChooseButtonLink || '/contact')
  const boxes = (Array.isArray(data?.aboutWhyChooseBoxes) && (data.aboutWhyChooseBoxes as Box[]).length > 0) ? data.aboutWhyChooseBoxes as Box[] : defaultBoxes

  return (
    <section ref={ref} className="md:py-20 py-8 md:px-6 px-4 bg-[#0B0B0B] overflow-hidden text-white mx-auto">
      <div className="max-w-7xl mx-auto flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end md:mb-16 mb-8 md:gap-8 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">{subTitle}</span>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">{title}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }} transition={{ duration: 0.8 }}>
            <Link href={buttonLink} className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-[#41398B] hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
              {buttonText}
            </Link>
          </motion.div>
        </div>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 md:gap-12 gap-8" variants={containerVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          {boxes.map((box, index) => (
            <motion.div key={index} variants={itemVariants} className="group flex flex-col items-start">
              <div className="w-25 h-25 rounded-full flex items-center justify-center md:mb-8 mb-4 transition-all duration-500 bg-transparent border border-white/20 group-hover:bg-[#41398B] group-hover:border-[#41398B]">
                {box.icon ? (
                  <img
                    src={box.icon.startsWith('http') ? box.icon : `${BASE}${box.icon.startsWith('/') ? '' : '/'}${box.icon}`}
                    alt={language === 'en' ? (box.title_en || box.title || '') : (box.title_vn || box.title_en || box.title || '')}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/10 rounded-full" />
                )}
              </div>
              <h3 className="text-2xl font-bold mb-3">{language === 'en' ? (box.title_en || box.title) : (box.title_vn || box.title_en || box.title)}</h3>
              <p className="text-gray-400 text-md leading-relaxed text-base group-hover:text-gray-300 transition-colors duration-300">
                {language === 'en' ? (box.description_en || box.description) : (box.description_vn || box.description_en || box.description)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
