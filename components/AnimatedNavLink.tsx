'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from '@/components/LanguageLink'

interface AnimatedNavLinkProps {
  text: string
  href?: string
  onClick?: () => void
  hasDropdown?: boolean
  isDropdownOpen?: boolean
}

const AnimatedNavLink = ({
  text,
  href,
  onClick,
}: AnimatedNavLinkProps) => {
  const [isHovered, setIsHovered] = useState(false)

  // Split text into characters
  const characters = text.split('')

  const content = (
    <div
      className="relative overflow-hidden h-6 flex items-center cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* First layer (slides up) */}
      <div className="flex text-black">
        {characters.map((char, index) => (
          <motion.span
            key={`top-${index}`}
            className="inline-block"
            animate={{ y: isHovered ? '-100%' : 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.025,
              ease: [0.5, 0, 0, 1],
            }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </div>

      {/* Second layer (slides in from bottom) - positioned absolutely */}
      <div className="absolute inset-0 flex text-[#41398B]">
        {characters.map((char, index) => (
          <motion.span
            key={`bottom-${index}`}
            className="inline-block"
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{
              duration: 0.5,
              delay: index * 0.025,
              ease: [0.5, 0, 0, 1],
            }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {content}
      </Link>
    )
  }

  return content
}

export default AnimatedNavLink
