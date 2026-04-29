'use client'

import { motion } from 'framer-motion'

const DEFAULT_MAP = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1655823793786!5m2!1sen!2sbd'

function extractSrc(input: string): string {
  if (!input) return DEFAULT_MAP
  if (input.trim().startsWith('http')) return input
  const decoded = input.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  const m = decoded.match(/src=["']([^"']+)["']/)
  return m ? m[1] : DEFAULT_MAP
}

export default function ContactMap({ data }: { data: Record<string, unknown> }) {
  const src = extractSrc(String(data?.contactMapIframe || data?.mapLink || ''))

  return (
    <section className="py-6 md:py-16 bg-white overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e4e4e4]"
        >
          <iframe
            src={src}
            width="100%" height="100%"
            style={{ border: 0 }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Contact Map"
          />
        </motion.div>
      </div>
    </section>
  )
}
