'use client'

import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { SiMessenger, SiZalo } from 'react-icons/si'
import { usePathname } from 'next/navigation'
import { getAgent } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'

const FloatingContactButtons = () => {
  const { language } = useLanguage()
  const pathname = usePathname()
  const [agentData, setAgentData] = useState<Record<string, unknown> | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const hideOnPaths = ['/dashboard', '/user-dashboard', '/login', '/register', '/forgot-password', '/reset-password']
  const shouldHide = hideOnPaths.some(path => pathname.startsWith(path))

  useEffect(() => {
    if (shouldHide) return
    getAgent()
      .then(r => { if (r.data?.success) setAgentData(r.data.data) })
      .catch(() => { })
  }, [shouldHide])

  if (shouldHide || !agentData) return null

  const { agentNumber, agentZaloLink, agentMessengerLink, agentWhatsappLink } = agentData as Record<string, unknown>
  const primaryPhone = Array.isArray(agentNumber) ? agentNumber[0] : agentNumber

  const buttons = [
    { id: 'call', icon: <Phone className="w-6 h-6" fill="white" />, link: primaryPhone ? `tel:${primaryPhone}` : null, color: 'bg-[#FF0000]', pingColor: '#FF0000', mobileColor: '#4CAF50', label: language === 'vi' ? 'Gọi ngay' : 'Call Now', mobileLabel: language === 'vi' ? 'Gọi' : 'Call' },
    { id: 'zalo', icon: <SiZalo className="w-6 h-6 md:w-7 md:h-7" title="Zalo" />, link: agentZaloLink as string, color: 'bg-[#0068FF]', pingColor: '#0068FF', mobileColor: '#0068FF', label: 'Zalo', mobileLabel: 'Zalo' },
    { id: 'messenger', icon: <SiMessenger className="w-6 h-6 md:w-7 md:h-7" title="Messenger" />, link: agentMessengerLink as string, color: 'bg-[#0084FF]', pingColor: '#0084FF', mobileColor: '#0084FF', label: 'Messenger', mobileLabel: 'Messenger' },
    { id: 'whatsapp', icon: <FaWhatsapp className="w-6 h-6 md:w-7 md:h-7" title="WhatsApp" />, link: agentWhatsappLink as string, color: 'bg-[#25D366]', pingColor: '#25D366', mobileColor: '#25D366', label: 'WhatsApp', mobileLabel: 'WhatsApp' },
  ].filter(btn => btn.link)

  if (buttons.length === 0) return null

  return (
    <>
      {/* Desktop Floating Buttons (Bottom Right) */}
      <div className="fixed right-6 bottom-20 z-[999] hidden md:flex flex-col items-end gap-3"
        onMouseLeave={() => setIsHovered(false)}>
        <div className={`flex flex-col gap-3 transition-all duration-300 ease-in-out ${isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {buttons.slice(1).map(btn => (
            <a key={btn.id} href={btn.link!} target="_blank" rel="noopener noreferrer" aria-label={btn.label}
              className={`${btn.color} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group/btn relative`}>
              {btn.icon}
              <span className="absolute right-16 bg-[#2a2a2a] text-white px-3 py-1.5 rounded-lg shadow-xl text-sm font-semibold opacity-0 group-hover/btn:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none">
                {btn.label}
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#2a2a2a] rotate-45" />
              </span>
            </a>
          ))}
        </div>
        <div className="relative cursor-pointer rounded-full" onMouseEnter={() => setIsHovered(true)}>
          <a href={buttons[0].link!} target="_blank" rel="noopener noreferrer" aria-label={buttons[0].label}
            className={`${buttons[0].color} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(255,0,0,0.3)] hover:scale-110 transition-all duration-300 relative z-10`}>
            {buttons[0].icon}
            <span className="absolute inset-0 rounded-full animate-ping opacity-25 -z-10" style={{ backgroundColor: buttons[0].pingColor }} />
          </a>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-[9999] md:hidden shadow-[0_-2px_15px_rgba(0,0,0,0.15)]">
        <div className="flex justify-around items-center h-16 px-2 pb-1">
          {buttons.map(btn => (
            <a key={btn.id} href={btn.link!} target="_blank" rel="noopener noreferrer" aria-label={btn.mobileLabel}
              className="flex flex-col items-center justify-center gap-0 min-w-[70px] active:scale-95 transition-transform">
              <div className="mb-0.5">
                {btn.id === 'messenger' && <SiMessenger className="w-7 h-7" style={{ color: btn.mobileColor }} title="Messenger" />}
                {btn.id === 'zalo' && <SiZalo className="w-7 h-7" style={{ color: btn.mobileColor }} title="Zalo" />}
                {btn.id === 'call' && <Phone className="w-7 h-7" fill={btn.mobileColor} style={{ color: btn.mobileColor }} />}
                {btn.id === 'whatsapp' && <FaWhatsapp className="w-7 h-7" style={{ color: btn.mobileColor }} title="WhatsApp" />}
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-tight">{btn.mobileLabel}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

export default FloatingContactButtons
