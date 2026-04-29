'use client'

import { useState, useEffect, useRef } from 'react'
import { Crown, Target } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function AboutMissionVission({ data }: { data: Record<string, unknown> }) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { language } = useLanguage()

  const missionTitle = language === 'en'
    ? String(data?.aboutMissionTitle_en || 'To simplify the real estate journey by connecting people with the right properties through trust, transparency, and technology.')
    : String(data?.aboutMissionTitle_vn || 'Đơn giản hóa hành trình bất động sản bằng cách kết nối mọi người với các bất động sản phù hợp.')
  const missionDesc = language === 'en'
    ? String(data?.aboutMissionDescription_en || 'We are committed to delivering personalized experiences, whether you\'re buying, selling, or renting.')
    : String(data?.aboutMissionDescription_vn || 'Chúng tôi cam kết mang đến trải nghiệm cá nhân hóa, cho dù bạn đang mua, bán hay cho thuê.')
  const visionTitle = language === 'en'
    ? String(data?.aboutVisionTitle_en || 'To become the most trusted real estate partner by redefining how people discover, evaluate, and engage with properties.')
    : String(data?.aboutVisionTitle_vn || 'Trở thành đối tác bất động sản đáng tin cậy nhất bằng cách định nghĩa lại cách mọi người khám phá và tương tác với bất động sản.')
  const visionDesc = language === 'en'
    ? String(data?.aboutVisionDescription_en || 'We envision a future where every individual can find their ideal home or investment with confidence.')
    : String(data?.aboutVisionDescription_vn || 'Chúng tôi hình dung một tương lai nơi mọi cá nhân có thể tìm thấy ngôi nhà hoặc khoản đầu tư lý tưởng.')

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true) }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="md:py-14 py-8 px-2 md:px-6 bg-[#fff] overflow-hidden mx-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-20">
        {/* Vision */}
        <div className={`flex flex-col items-start md:p-8 p-4 rounded-3xl transition-all duration-700 ease-out transform group shadow-sm hover:-translate-y-2 hover:bg-gray-50/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex flex-col gap-3 mb-3 w-full">
            <div className="md:w-16 md:h-16 w-12 h-12 rounded-2xl bg-[#41398B]/10 flex items-center justify-center group-hover:bg-[#41398B] transition-colors duration-500">
              <Crown className="w-8 h-8 text-[#41398B] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] leading-tight group-hover:text-[#41398B] transition-colors duration-300">{visionTitle}</h2>
          </div>
          <p className="text-gray-500 text-[16px] leading-relaxed">{visionDesc}</p>
        </div>
        {/* Mission */}
        <div className={`flex flex-col items-start md:p-8 p-4 rounded-3xl transition-all duration-700 ease-out delay-200 transform group shadow-sm hover:-translate-y-2 hover:bg-gray-50/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex flex-col gap-3 mb-3 w-full">
            <div className="md:w-16 md:h-16 w-12 h-12 rounded-2xl bg-[#41398B]/10 flex items-center justify-center group-hover:bg-[#41398B] transition-colors duration-500">
              <Target className="w-8 h-8 text-[#41398B] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] leading-tight group-hover:text-[#41398B] transition-colors duration-300">{missionTitle}</h2>
          </div>
          <p className="text-gray-500 text-[16px] leading-relaxed">{missionDesc}</p>
        </div>
      </div>
    </section>
  )
}
