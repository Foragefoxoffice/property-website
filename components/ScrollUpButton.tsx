'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function ScrollUpButton() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  const hideOnPaths = ['/dashboard', '/user-dashboard', '/login', '/register', '/forgot-password', '/reset-password']
  const shouldHide = hideOnPaths.some(p => pathname.startsWith(p))

  useEffect(() => {
    if (shouldHide) return
    let ticking = false;
    const toggle = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 300)
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', toggle, { passive: true })
    return () => window.removeEventListener('scroll', toggle)
  }, [shouldHide])

  if (shouldHide) return null

  return (
    <div className="fixed bottom-24 md:bottom-4 right-6 md:right-5 z-50">
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`p-3 rounded-full bg-[#41398B] cursor-pointer text-white shadow-lg transition-all duration-300 hover:bg-[#352e7a] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#41398B] focus:ring-offset-2 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  )
}
