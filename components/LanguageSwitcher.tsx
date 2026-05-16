'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
      <div className="flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-1 shadow-sm transition-all hover:shadow-md">
        <button
          onClick={() => toggleLanguage('en')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            language === 'en'
              ? 'bg-[#41398B] text-white shadow-sm scale-105'
              : 'text-gray-600 hover:bg-gray-100 hover:text-[#41398B]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="rounded-full overflow-hidden shadow-sm">
            <defs>
              <clipPath id="gb_clip_login_web">
                <circle cx="12" cy="12" r="12"></circle>
              </clipPath>
            </defs>
            <g clipPath="url(#gb_clip_login_web)">
              <rect width="24" height="24" fill="#012169"></rect>
              <line x1="0" y1="0" x2="24" y2="24" stroke="#FFF" strokeWidth="6" />
              <line x1="24" y1="0" x2="0" y2="24" stroke="#FFF" strokeWidth="6" />
              <line x1="0" y1="0" x2="24" y2="24" stroke="#C8102E" strokeWidth="3" />
              <line x1="24" y1="0" x2="0" y2="24" stroke="#C8102E" strokeWidth="3" />
              <line x1="12" y1="0" x2="12" y2="24" stroke="#FFF" strokeWidth="6" />
              <line x1="0" y1="12" x2="24" y2="12" stroke="#FFF" strokeWidth="6" />
              <line x1="12" y1="0" x2="12" y2="24" stroke="#C8102E" strokeWidth="4" />
              <line x1="0" y1="12" x2="24" y2="12" stroke="#C8102E" strokeWidth="4" />
            </g>
          </svg>
          EN
        </button>
        <button
          onClick={() => toggleLanguage('vi')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            language === 'vi'
              ? 'bg-[#41398B] text-white shadow-sm scale-105'
              : 'text-gray-600 hover:bg-gray-100 hover:text-[#41398B]'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="rounded-full overflow-hidden shadow-sm">
            <defs>
              <clipPath id="vn_clip_login_web">
                <circle cx="12" cy="12" r="12"></circle>
              </clipPath>
            </defs>
            <g clipPath="url(#vn_clip_login_web)">
              <rect width="24" height="24" fill="#DA251D"></rect>
              <polygon
                fill="#FFCE00"
                points="12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927 16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927 4.867,9.682 10.237,9.573"
              ></polygon>
            </g>
          </svg>
          VN
        </button>
      </div>
    </div>
  )
}
