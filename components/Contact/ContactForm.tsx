'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Select } from 'antd'
import { MapPin, Phone, Mail, HelpCircle } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLanguage } from '@/context/LanguageContext'

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://183housingsolutions.com/api/v1').replace(/\/api\/v1$/, '')

function imgUrl(p: string) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
}

export default function ContactForm({ data }: { data?: Record<string, unknown> }) {
  const { language } = useLanguage()
  const d = data || {}
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: 'General Inquiry', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.id]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${BASE}/api/v1/contact-enquiry`, form)
      toast.success(language === 'en' ? 'Message sent successfully!' : 'Gửi tin nhắn thành công!')
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
    } catch {
      toast.error(language === 'en' ? 'Failed to send message.' : 'Gửi tin nhắn thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const g = (en: string, vi: string, fb = '') =>
    language === 'en' ? String(d[en] || fb) : String(d[vi] || fb)

  const phones = Array.isArray(d.contactReachOutNumberContent)
    ? d.contactReachOutNumberContent as string[]
    : [String(d.contactReachOutNumberContent || '')]
  const emails = Array.isArray(d.contactReachOutEmailContent)
    ? d.contactReachOutEmailContent as string[]
    : [String(d.contactReachOutEmailContent || '')]

  type SocialItem = { type: 'image'; value: string; href: string } | { type: 'icon'; value: React.ComponentType<{ className?: string }>; href: string }
  const socialLinks: SocialItem[] = ((d.contactReachOutSocialIcons as { icon: string; link: string }[]) || []).map(item => {
    if (item.icon?.includes('/') || item.icon?.startsWith('http'))
      return { type: 'image', value: item.icon, href: item.link || '#' }
    const Icon = (LucideIcons as Record<string, unknown>)[item.icon] as React.ComponentType<{ className?: string }> | undefined
    return { type: 'icon', value: Icon || HelpCircle, href: item.link || '#' }
  })

  return (
    <section className="py-8 md:py-16 bg-white relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-start md:flex-row flex-col-reverse gap-12 justify-between">

          {/* Left: Contact info */}
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="w-full">
            <div className="bg-white rounded-3xl p-4 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e4e4e4] h-full">
              <h2 className="md:text-2xl text-xl font-semibold text-gray-900 md:mb-4 mb-2">
                {g('contactReachOutTitle_en', 'contactReachOutTitle_vn', 'Reach Out To Us')}
              </h2>
              <p className="text-gray-500 md:mb-10 mb-3 leading-relaxed md:text-lg text-sm font-light">
                {g('contactReachOutDescription_en', 'contactReachOutDescription_vn', "We're here to assist with any questions.")}
              </p>
              <div className="md:space-y-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 md:w-12 md:h-12 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold md:text-lg text-md text-gray-900 mb-1">{g('contactReachOutAddressHead_en', 'contactReachOutAddressHead_vn', 'Office Address')}</h4>
                    <p className="text-gray-500 font-light text-sm md:text-base">{g('contactReachOutAddressContent_en', 'contactReachOutAddressContent_vn', '')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 md:w-12 md:h-12 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold md:text-lg text-md text-gray-900 mb-1">{g('contactReachOutNumberHead_en', 'contactReachOutNumberHead_vn', 'Phone Number')}</h4>
                    {phones.map((p, i) => <p key={i} className="text-gray-500 font-light text-sm md:text-base">{p}</p>)}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 md:w-12 md:h-12 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold md:text-lg text-md text-gray-900 mb-1">{g('contactReachOutEmailHead_en', 'contactReachOutEmailHead_vn', 'Email Address')}</h4>
                    {emails.map((e, i) => <p key={i} className="text-gray-500 font-light text-sm md:text-base break-all">{e}</p>)}
                  </div>
                </div>
              </div>
              {socialLinks.length > 0 && (
                <div className="md:mt-8 mt-6">
                  <h4 className="font-semibold text-gray-900 md:mb-4 mb-2 md:text-lg text-md">{g('contactReachOutFollowTitle_en', 'contactReachOutFollowTitle_vn', 'Follow Us')}</h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((item, i) => (
                      <a key={i} href={item.href} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-[#41398B] text-white hover:scale-110 transition-all">
                        {item.type === 'image'
                          ? <img src={imgUrl(item.value)} alt="Social" className="w-5 h-5 object-contain" />
                          : <item.value className="w-5 h-5" />}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} className="w-full lg:pl-8">
            <div className="md:mb-8 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{g('contactReachOutGetinTitle_en', 'contactReachOutGetinTitle_vn', 'Get In Touch')}</h2>
              <p className="text-gray-500 font-light text-md">{g('contactReachOutGetinDescription_en', 'contactReachOutGetinDescription_vn', "We'd love to hear from you!")}</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                <div className="space-y-2">
                  <label className="text-md font-semibold text-black" htmlFor="firstName">{language === 'en' ? 'First Name' : 'Tên'}</label>
                  <input type="text" id="firstName" placeholder={language === 'en' ? 'First Name' : 'Tên'} value={form.firstName} onChange={handleChange} required
                    className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light" />
                </div>
                <div className="space-y-2">
                  <label className="text-md font-semibold text-black" htmlFor="lastName">{language === 'en' ? 'Last Name' : 'Họ'}</label>
                  <input type="text" id="lastName" placeholder={language === 'en' ? 'Last Name' : 'Họ'} value={form.lastName} onChange={handleChange} required
                    className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                <div className="space-y-2">
                  <label className="text-md font-semibold text-black" htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder={language === 'en' ? 'Enter your email address' : 'Nhập địa chỉ email của bạn'} value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light" />
                </div>
                <div className="space-y-2">
                  <label className="text-md font-semibold text-black" htmlFor="phone">{language === 'en' ? 'Phone Number' : 'Số Điện Thoại'}</label>
                  <input type="tel" id="phone" placeholder={language === 'en' ? 'Enter your phone number' : 'Nhập số điện thoại của bạn'} value={form.phone} onChange={handleChange} required
                    className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-md font-semibold text-black">{language === 'en' ? 'Subject' : 'Chủ đề'}</label>
                <Select className="custom-select w-full mt-2" popupClassName="custom-dropdown" value={form.subject || undefined}
                  onChange={v => setForm(p => ({ ...p, subject: v }))} size="large" style={{ width: '100%' }}>
                  <Select.Option value="General Inquiry">{language === 'en' ? 'General Inquiry' : 'Yêu cầu chung'}</Select.Option>
                  <Select.Option value="Property Viewing">{language === 'en' ? 'Property Viewing' : 'View bất động sản'}</Select.Option>
                  <Select.Option value="Partnership">{language === 'en' ? 'Partnership' : 'Hợp tác'}</Select.Option>
                  <Select.Option value="Support">{language === 'en' ? 'Support' : 'Hỗ trợ'}</Select.Option>
                  <Select.Option value="Other">{language === 'en' ? 'Other' : 'Khác'}</Select.Option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-md font-semibold text-black" htmlFor="message">{language === 'en' ? 'Message' : 'Tin Nhắn'}</label>
                <textarea id="message" rows={5} placeholder={language === 'en' ? 'Your Message' : 'Tin nhắn của bạn'} value={form.message} onChange={handleChange} required
                  className="w-full px-4 py-3 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#41398B] focus:border-[#41398B] transition-all placeholder:text-gray-400 font-light resize-none" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="w-full bg-black text-white cursor-pointer hover:bg-[#333] font-medium py-3 rounded-lg transition-colors duration-300">
                {loading ? (language === 'en' ? 'Sending...' : 'Đang gửi...') : g('contactReachOutGetinButtonText_en', 'contactReachOutGetinButtonText_vn', 'Send Message')}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
