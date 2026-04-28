'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronDown, Heart, Lock, Menu, X, Phone, Mail } from 'lucide-react'
import { toast } from 'react-toastify'
import { useLanguage } from '@/context/LanguageContext'
import { getHeader, getAllProjects, getProjectCategories, getFooter } from '@/lib/api'
import AnimatedNavLink from '@/components/AnimatedNavLink'
import { useFavorites } from '@/context/FavoritesContext'
import { Tooltip } from 'antd'

// ChangePasswordModal placeholder — will be replaced when the modal is ported
function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Change Password</h2>
        <p className="text-gray-500 text-sm mb-6">
          Password change functionality coming soon.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 bg-[#41398B] text-white rounded-lg font-semibold hover:bg-[#352e7a] transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}

interface ProjectCategory {
  _id: string
  name: { en?: string; vi?: string } | string
  status: string
}

interface Project {
  _id: string
  title: { en?: string; vi?: string } | string
  slug?: { en?: string; vi?: string } | string
  category?: string | { _id: string }
  published?: boolean
}

interface FooterData {
  footerNumber?: string[]
  footerEmail?: string[]
  footerIcons?: Array<{ link: string; icon: string }>
}

export default function PublicHeader({ showNavigation = true }: { showNavigation?: boolean }) {
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)
  const [showPropertiesDropdown, setShowPropertiesDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPropertiesMobile, setShowPropertiesMobile] = useState(false)
  const [showProjectsMobile, setShowProjectsMobile] = useState(false)
  const [activeProjectMobile, setActiveProjectMobile] = useState<string | null>(null)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [headerLogo, setHeaderLogo] = useState('/images/login/logo.png')
  const { language: langRaw, toggleLanguage } = useLanguage()
  const language = langRaw as 'en' | 'vi'
  const { favorites, clearFavorites } = useFavorites()

  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // Guard localStorage reads client-side only
  const [token, setToken] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'))
      setUserName(localStorage.getItem('userName') || '')
      setUserImage(localStorage.getItem('userImage') || '')
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserImage(localStorage.getItem('userImage') || '')
    }
    window.addEventListener('userProfileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate)
  }, [])

  const labels = {
    logout: { en: 'Logout', vi: 'Đăng xuất' },
    loggedOut: { en: "You're Logged Out!", vi: 'Bạn đã đăng xuất!' },
    homepages: { en: 'Home', vi: 'Trang chủ' },
    properties: { en: 'Properties', vi: 'Bất động sản' },
    propertiesLease: { en: 'Properties for Lease', vi: 'Bất động sản cho thuê' },
    propertiesSale: { en: 'Properties for Sale', vi: 'Bất động sản bán' },
    propertiesHomestay: { en: 'Properties for Homestay', vi: 'Bất động sản Homestay' },
    aboutus: { en: 'About Us', vi: 'Về chúng tôi' },
    blog: { en: 'News', vi: 'Tin tức' },
    contacts: { en: 'Contact Us', vi: 'Liên hệ' },
    loginRegister: { en: 'Login/Register', vi: 'Đăng nhập/Đăng ký' },
    changePassword: { en: 'Change Password', vi: 'Đổi mật khẩu' },
    dashboard: { en: 'Dashboard', vi: 'Trang tổng quan' },
    myFavorites: { en: 'My Favorites', vi: 'Yêu thích của tôi' },
    visitSite: { en: 'Visit Site', vi: 'Truy cập trang web' },
    project: { en: 'Project', vi: 'Dự án' },
    viewAllIn: { en: 'View All in', vi: 'View tất cả trong' },
    viewAllProperty: { en: 'View All Properties', vi: 'View tất cả bất động sản' },
    myProfile: { en: 'My Profile', vi: 'Hồ sơ của tôi' },
    category: { en: 'Category', vi: 'Danh mục' },
    generalInformation: { en: 'General Information', vi: 'Thông tin chung' },
  }

  // Fetch header logo from CMS
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await getHeader()
        const logo = response.data.data?.headerLogo
        if (logo) {
          setHeaderLogo(logo)
        }
      } catch (error) {
        console.error('Error fetching header logo:', error)
      }
    }
    fetchHeaderData()
  }, [])

  // Fetch Project Categories and Projects for the "Project" menu
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesRes, projectsRes] = await Promise.all([
          getProjectCategories(),
          getAllProjects(),
        ])
        if (categoriesRes.data?.success) {
          setProjectCategories(
            categoriesRes.data.data.filter((c: ProjectCategory) => c.status === 'Active')
          )
        }
        if (projectsRes.data?.success) {
          setAllProjects(projectsRes.data.data.filter((p: Project) => p.published))
        }
      } catch (error) {
        console.error('Error fetching project dropdown data for Header:', error)
      }
    }
    fetchDropdownData()
  }, [])

  // Fetch Footer data for top nav
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await getFooter()
        if (response.data?.success) {
          setFooterData(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching footer data for Header:', error)
      }
    }
    fetchFooterData()
  }, [])

  const getLocalizedValue = (value: { en?: string; vi?: string } | string | undefined) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '')
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userImage')
    }
    clearFavorites()
    toast.error(labels.loggedOut[language])
    setToken(null)
    router.push('/login')
  }

  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'US'

  // Get logo URL with proper base path
  const getLogoUrl = (logoPath: string) => {
    if (!logoPath) return '/images/login/logo.png'
    if (logoPath.startsWith('http')) return logoPath
    if (logoPath.startsWith('/uploads')) {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || ''
      return `${base}${logoPath}`
    }
    return logoPath
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
    : ''

  // Staff Header (no public navigation — showNavigation=false)
  if (!showNavigation) {
    return (
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />
        <div className="w-full px-16 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              className="h-10 object-contain"
              src={getLogoUrl(headerLogo)}
              alt="Logo"
            />
          </div>

          <div className="flex items-center gap-5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#41398B] cursor-pointer text-white rounded-lg text-sm font-semibold transition-colors hover:bg-[#352e7a]"
            >
              {labels.visitSite[language]}
            </a>

            {/* Language Toggle */}
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-200 p-1">
              <button
                onClick={() => toggleLanguage('vi')}
                aria-pressed={language === 'vi'}
                title="Tiếng Việt"
                className={`h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                  language === 'vi' ? 'bg-white shadow scale-105' : 'hover:bg-white/20'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <clipPath id="vn_clip_staff">
                      <circle cx="12" cy="12" r="12"></circle>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#vn_clip_staff)">
                    <rect width="24" height="24" fill="#DA251D"></rect>
                    <polygon
                      fill="#FFCE00"
                      points="12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927 16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927 4.867,9.682 10.237,9.573"
                    ></polygon>
                  </g>
                </svg>
              </button>
              <button
                onClick={() => toggleLanguage('en')}
                aria-pressed={language === 'en'}
                title="English"
                className={`h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                  language === 'en' ? 'bg-white shadow scale-105' : 'hover:bg-white/20'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <clipPath id="gb_clip_staff">
                      <circle cx="12" cy="12" r="12"></circle>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#gb_clip_staff)">
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
              </button>
            </div>

            {token && (
              <div
                className="relative pointer-events-none md:pointer-events-auto"
                onMouseEnter={() => setShowLogout(true)}
                onMouseLeave={() => setShowLogout(false)}
              >
                <div className="flex items-center gap-2 md:cursor-pointer hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#41398B] text-white flex items-center justify-center text-sm font-bold overflow-hidden border border-white/20">
                    {userImage ? (
                      <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="text-[#41398B] text-sm font-medium">
                    {userName ? userName.split(' ')[0] : 'Admin'}
                  </span>
                </div>
                <AnimatePresence>
                  {showLogout && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 origin-top-right overflow-hidden hidden md:block"
                    >
                      <button
                        onClick={() => {
                          router.push('/dashboard/profile')
                          setShowLogout(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-[#41398B] transition font-medium border-b border-gray-50 cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                        {labels.dashboard[language]}
                      </button>
                      <button
                        onClick={() => {
                          setShowChangePasswordModal(true)
                          setShowLogout(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-[#41398B] transition font-medium border-b border-gray-50 cursor-pointer"
                      >
                        <Lock size={16} />
                        {labels.changePassword[language]}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition cursor-pointer font-medium"
                      >
                        <LogOut size={16} /> {labels.logout[language]}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }

  // User/Public Header (Light Theme)
  return (
    <header
      className={`w-full sticky z-50 shadow-sm transition-[top] duration-300 ease-in-out ${
        isScrolled ? 'md:-top-10 top-0' : 'top-0'
      }`}
    >
      {/* Top Navigation Bar */}
      <div className="bg-[#000] text-white py-2 h-10 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-[13px] font-medium">
          <div className="flex items-center gap-6">
            {footerData?.footerNumber?.[0] && (
              <a
                href={`tel:${footerData.footerNumber[0]}`}
                className="flex items-center gap-2 hover:text-gray-200 transition-colors"
              >
                <Phone size={14} className="text-white/80 mt-[-4px]" />
                {footerData.footerNumber[0]}
              </a>
            )}
            {footerData?.footerEmail?.[0] && (
              <a
                href={`mailto:${footerData.footerEmail[0]}`}
                className="flex items-center gap-2 hover:text-gray-200 transition-colors"
              >
                <Mail size={14} className="text-white/80 mt-[-3px]" />
                {footerData.footerEmail[0]}
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            {footerData?.footerIcons?.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 flex items-center justify-center hover:scale-110 transition-all opacity-90 hover:opacity-100"
              >
                <img
                  src={item.icon.startsWith('/') ? `${baseURL}${item.icon}` : item.icon}
                  alt="social"
                  className="w-full h-full object-contain rounded-sm"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100">
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />
        <div className="max-w-[1400px] mx-auto px-2 md:px-6 md:py-3 py-2 flex items-center justify-between relative">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-[#41398B] transition-colors rounded-lg hover:bg-gray-50"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo Section */}
          <div className="flex items-center">
            <img
              className="hidden lg:block object-contain cursor-pointer h-8 md:h-10"
              src={getLogoUrl(headerLogo)}
              alt="Logo"
              onClick={() => router.push('/')}
            />
            <div className="lg:hidden absolute left-15 flex items-center justify-center">
              <img
                className="h-6 object-contain cursor-pointer"
                src={getLogoUrl(headerLogo)}
                alt="Logo"
                onClick={() => router.push('/')}
              />
            </div>
          </div>

          {/* Center Navigation */}
          {showNavigation && (
            <nav className="hidden lg:flex items-center gap-10">
              <div className="font-semibold text-[16px]">
                <AnimatedNavLink
                  text={labels.homepages[language]}
                  onClick={() => router.push('/')}
                />
              </div>

              {/* Properties Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowPropertiesDropdown(true)}
                onMouseLeave={() => setShowPropertiesDropdown(false)}
              >
                <div className="flex items-center gap-1 font-semibold text-[16px]">
                  <AnimatedNavLink
                    onClick={() => router.push('/listing')}
                    text={labels.properties[language]}
                    hasDropdown={true}
                    isDropdownOpen={showPropertiesDropdown}
                  />
                  <motion.div
                    animate={{ rotate: showPropertiesDropdown ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ChevronDown className="w-4 h-4 text-[#000]" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showPropertiesDropdown && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{ transformOrigin: 'center top' }}
                      className="absolute left-0 top-full mt-0 w-[220px] bg-white rounded-lg shadow-[0_10px_25px_rgba(72,95,119,0.1)] z-50 overflow-hidden border border-gray-100"
                    >
                      <div className="py-0">
                        {[
                          { label: labels.viewAllProperty[language], path: '/listing', delay: 0 },
                          { label: labels.propertiesLease[language], path: '/listing?type=Lease', delay: 0.05 },
                          { label: labels.propertiesSale[language], path: '/listing?type=Sale', delay: 0.1 },
                          { label: labels.propertiesHomestay[language], path: '/listing?type=Home Stay', delay: 0.15 },
                        ].map((item, index) => (
                          <motion.button
                            key={index}
                            onClick={() => router.push(item.path)}
                            initial={{ y: 11, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: item.delay, ease: [0.5, 0, 0, 1] }}
                            whileHover={{ backgroundColor: '#f8f7ff' }}
                            className={`w-full cursor-pointer text-left px-5 py-3 text-[15px] text-[#2a2a2a] hover:text-[#41398B] font-semibold transition-colors ${
                              index < 3 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            {item.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Project Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowProjectDropdown(true)}
                onMouseLeave={() => {
                  setShowProjectDropdown(false)
                  setActiveProject(null)
                }}
              >
                <div className="flex items-center gap-1 font-semibold text-[16px]">
                  <AnimatedNavLink
                    onClick={() => router.push('/projects')}
                    text={labels.project[language]}
                    hasDropdown={true}
                    isDropdownOpen={showProjectDropdown}
                  />
                  <motion.div
                    animate={{ rotate: showProjectDropdown ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ChevronDown className="w-4 h-4 text-[#000]" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showProjectDropdown && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{ transformOrigin: 'center top' }}
                      className="absolute left-0 top-full mt-0 w-[250px] bg-white rounded-lg shadow-[0_10px_25px_rgba(72,95,119,0.1)] z-50 border border-gray-100"
                    >
                      <div className="py-0">
                        <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/30">
                          {labels.category[language]}
                        </div>
                        {projectCategories.map((category, index) => {
                          const projectsInCategory = allProjects.filter((p) => {
                            const catId =
                              typeof p.category === 'string' ? p.category : p.category?._id
                            return catId === category._id
                          })

                          return (
                            <div
                              key={category._id}
                              className="relative group/proj"
                              onMouseEnter={() => setActiveProject(category._id)}
                            >
                              <button
                                onClick={() => {
                                  router.push(`/projects?category=${category._id}`)
                                  setShowProjectDropdown(false)
                                }}
                                className={`w-full cursor-pointer text-left px-5 py-3 text-[15px] text-[#2a2a2a] hover:text-[#41398B] hover:bg-[#f8f7ff] font-semibold transition-colors flex items-center justify-between ${
                                  index < projectCategories.length - 1
                                    ? 'border-b border-gray-100'
                                    : ''
                                }`}
                              >
                                <span>{getLocalizedValue(category.name)}</span>
                                {projectsInCategory.length > 0 && (
                                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400 group-hover/proj:text-[#41398B]" />
                                )}
                              </button>

                              <AnimatePresence>
                                {activeProject === category._id &&
                                  projectsInCategory.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      className="absolute left-full top-0 ml-0.5 w-[220px] bg-white rounded-lg shadow-[0_10px_25px_rgba(72,95,119,0.1)] z-[60] border border-gray-100 overflow-hidden text-black"
                                    >
                                      <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/30">
                                        {labels.generalInformation[language]}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          router.push(`/projects?category=${category._id}`)
                                          setShowProjectDropdown(false)
                                        }}
                                        className="w-full cursor-pointer text-left px-5 py-3 text-[14px] text-[#2a2a2a] hover:text-[#41398B] hover:bg-[#f8f7ff] font-medium transition-colors border-b border-gray-100"
                                      >
                                        {labels.viewAllIn[language]}{' '}
                                        {getLocalizedValue(category.name)}
                                      </button>
                                      {projectsInCategory.map((project, pIdx) => {
                                        const slug =
                                          typeof project.slug === 'string'
                                            ? project.slug
                                            : project.slug?.[language as 'en' | 'vi'] ||
                                              project.slug?.en ||
                                              project.slug?.vi ||
                                              project._id
                                        return (
                                          <button
                                            key={project._id}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              router.push(`/projects/${slug}`)
                                              setShowProjectDropdown(false)
                                            }}
                                            className={`w-full cursor-pointer text-left px-5 py-3 text-[14px] text-[#2a2a2a] hover:text-[#41398B] hover:bg-[#f8f7ff] font-medium transition-colors ${
                                              pIdx < projectsInCategory.length - 1
                                                ? 'border-b border-gray-100'
                                                : ''
                                            }`}
                                          >
                                            {getLocalizedValue(project.title)}
                                          </button>
                                        )
                                      })}
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="font-semibold text-[16px]">
                <AnimatedNavLink
                  text={labels.aboutus[language]}
                  onClick={() => router.push('/about')}
                />
              </div>

              <div className="font-semibold text-[16px]">
                <AnimatedNavLink
                  text={labels.blog[language]}
                  onClick={() => router.push('/blogs')}
                />
              </div>

              <div className="font-semibold text-[16px]">
                <AnimatedNavLink
                  text={labels.contacts[language]}
                  onClick={() => router.push('/contact')}
                />
              </div>
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center md:gap-4 gap-2">
            {/* Favorites */}
            <Tooltip title={language === 'vi' ? 'Mục yêu thích' : 'Favorites'}>
              <button
                onClick={() => router.push('/favorites')}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group"
                title={language === 'vi' ? 'Mục yêu thích' : 'Favorites'}
              >
                <Heart
                  size={20}
                  className="text-gray-600 group-hover:text-[#41398B] transition-colors cursor-pointer"
                />
                {favorites.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                    {favorites.length}
                  </span>
                )}
              </button>
            </Tooltip>

            {!token && (
              <div className="hidden md:block">
                <Link
                  className="font-medium text-[16px] hover:text-[#41398B]"
                  href="/login"
                >
                  {labels.loginRegister[language]}
                </Link>
              </div>
            )}

            {/* Language Toggle */}
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
              <button
                onClick={() => toggleLanguage('vi')}
                aria-pressed={language === 'vi'}
                title="Tiếng Việt"
                className={`md:h-8 md:w-8 h-6 w-6 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${
                  language === 'vi' ? 'bg-white shadow scale-105' : 'hover:bg-white/70'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <clipPath id="vn_clip">
                      <circle cx="12" cy="12" r="12"></circle>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#vn_clip)">
                    <rect width="24" height="24" fill="#DA251D"></rect>
                    <polygon
                      fill="#FFCE00"
                      points="12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927 16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927 4.867,9.682 10.237,9.573"
                    ></polygon>
                  </g>
                </svg>
              </button>
              <button
                onClick={() => toggleLanguage('en')}
                aria-pressed={language === 'en'}
                title="English"
                className={`md:h-8 md:w-8 h-6 w-6 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${
                  language === 'en' ? 'bg-white shadow scale-105' : 'hover:bg-white/70'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <clipPath id="gb_clip">
                      <circle cx="12" cy="12" r="12"></circle>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#gb_clip)">
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
              </button>
            </div>

            {/* User profile dropdown */}
            {token && (
              <div
                className="relative pointer-events-none md:pointer-events-auto"
                onMouseEnter={() => setShowLogout(true)}
                onMouseLeave={() => setShowLogout(false)}
              >
                <div
                  className="md:w-9 w-7 md:h-9 h-7 rounded-full bg-[#41398B] text-white overflow-hidden flex items-center justify-center text-sm font-bold md:cursor-pointer shadow-sm md:hover:bg-[#352e7a] transition-colors"
                  onClick={() => {
                    const role =
                      typeof window !== 'undefined'
                        ? localStorage.getItem('userRole')
                        : null
                    if (role === 'user') {
                      router.push('/user-dashboard')
                    } else {
                      router.push('/dashboard/lease')
                    }
                  }}
                >
                  {userImage ? (
                    <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <AnimatePresence>
                  {showLogout && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-0 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 origin-top-right overflow-hidden hidden md:block"
                    >
                      <button
                        onClick={() => {
                          const role =
                            typeof window !== 'undefined'
                              ? localStorage.getItem('userRole')
                              : null
                          if (role === 'user') {
                            router.push('/user-dashboard/profile')
                          } else {
                            router.push('/dashboard/profile')
                          }
                          setShowLogout(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-[#41398B] transition font-medium border-b border-gray-50 cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                        {labels.dashboard[language]}
                      </button>
                      <button
                        onClick={() => {
                          const role =
                            typeof window !== 'undefined'
                              ? localStorage.getItem('userRole')
                              : null
                          if (role === 'user') {
                            router.push('/user-dashboard')
                          } else {
                            router.push('/favorites')
                          }
                          setShowLogout(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-[#41398B] transition font-medium border-b border-gray-50 cursor-pointer"
                      >
                        <Heart size={16} />
                        {labels.myFavorites[language]}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition cursor-pointer font-medium"
                      >
                        <LogOut size={16} /> {labels.logout[language]}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white shadow-2xl z-[70] lg:hidden flex flex-col overflow-hidden"
            >
              {/* Menu Header */}
              <div className="p-5 flex items-center justify-between border-b border-gray-100">
                <img
                  className="h-8 object-contain"
                  src={getLogoUrl(headerLogo)}
                  alt="Logo"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-2 px-4 flex flex-col">
                <div onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100">
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center justify-between w-full py-4 text-[16px] font-medium text-gray-700 hover:text-[#41398B] transition-colors"
                  >
                    {labels.homepages[language]}
                  </button>
                </div>

                {/* Properties Mobile */}
                <div className="flex flex-col border-b border-gray-100">
                  <button
                    onClick={() => setShowPropertiesMobile(!showPropertiesMobile)}
                    className="flex items-center justify-between w-full py-4 text-[16px] font-medium text-gray-700 hover:text-[#41398B] transition-colors"
                  >
                    {labels.properties[language]}
                    <motion.div
                      animate={{ rotate: showPropertiesMobile ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showPropertiesMobile && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-4 flex flex-col gap-1"
                      >
                        {[
                          { label: labels.viewAllProperty[language], path: '/listing' },
                          { label: labels.propertiesLease[language], path: '/listing?type=Lease' },
                          { label: labels.propertiesSale[language], path: '/listing?type=Sale' },
                          {
                            label: labels.propertiesHomestay[language],
                            path: '/listing?type=Home Stay',
                          },
                        ].map((item, idx) => (
                          <div key={idx} onClick={() => setIsMobileMenuOpen(false)}>
                            <Link
                              href={item.path}
                              className="block py-2 text-gray-600 hover:text-[#41398B] text-sm"
                            >
                              {item.label}
                            </Link>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Projects Mobile */}
                <div className="flex flex-col border-b border-gray-100">
                  <button
                    onClick={() => setShowProjectsMobile(!showProjectsMobile)}
                    className="flex items-center justify-between w-full py-4 text-[16px] font-medium text-gray-700 hover:text-[#41398B] transition-colors"
                  >
                    {labels.project[language]}
                    <motion.div
                      animate={{ rotate: showProjectsMobile ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showProjectsMobile && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-4 flex flex-col gap-1"
                      >
                        <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                          {labels.category[language]}
                        </div>
                        {projectCategories.map((category) => {
                          const projectsInCategory = allProjects.filter((p) => {
                            const catId =
                              typeof p.category === 'string' ? p.category : p.category?._id
                            return catId === category._id
                          })

                          return (
                            <div key={category._id} className="flex flex-col">
                              <button
                                onClick={() => {
                                  if (projectsInCategory.length > 0) {
                                    setActiveProjectMobile(
                                      activeProjectMobile === category._id ? null : category._id
                                    )
                                  } else {
                                    router.push(`/projects?category=${category._id}`)
                                    setIsMobileMenuOpen(false)
                                  }
                                }}
                                className="flex items-center justify-between w-full py-2 text-gray-600 hover:text-[#41398B] text-sm font-medium"
                              >
                                {getLocalizedValue(category.name)}
                                {projectsInCategory.length > 0 && (
                                  <motion.div
                                    animate={{
                                      rotate: activeProjectMobile === category._id ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown size={14} />
                                  </motion.div>
                                )}
                              </button>

                              <AnimatePresence>
                                {activeProjectMobile === category._id &&
                                  projectsInCategory.length > 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden pl-4 flex flex-col gap-1"
                                    >
                                      <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                        {labels.generalInformation[language]}
                                      </div>
                                      <button
                                        onClick={() => {
                                          router.push(`/projects?category=${category._id}`)
                                          setIsMobileMenuOpen(false)
                                        }}
                                        className="text-left py-2 text-xs text-gray-500 hover:text-[#41398B]"
                                      >
                                        {labels.viewAllIn[language]}{' '}
                                        {getLocalizedValue(category.name)}
                                      </button>
                                      {projectsInCategory.map((project) => {
                                        const slug =
                                          typeof project.slug === 'string'
                                            ? project.slug
                                            : project.slug?.[language as 'en' | 'vi'] ||
                                              project.slug?.en ||
                                              project.slug?.vi ||
                                              project._id
                                        return (
                                          <button
                                            key={project._id}
                                            onClick={() => {
                                              router.push(`/projects/${slug}`)
                                              setIsMobileMenuOpen(false)
                                            }}
                                            className="text-left py-2 text-xs text-gray-500 hover:text-[#41398B]"
                                          >
                                            {getLocalizedValue(project.title)}
                                          </button>
                                        )
                                      })}
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100">
                  <Link
                    href="/about"
                    className="block py-4 text-gray-700 hover:text-[#41398B] font-medium text-[16px] transition-colors"
                  >
                    {labels.aboutus[language]}
                  </Link>
                </div>

                <div onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100">
                  <Link
                    href="/blogs"
                    className="block py-4 text-gray-700 hover:text-[#41398B] font-medium text-[16px] transition-colors"
                  >
                    {labels.blog[language]}
                  </Link>
                </div>

                <div onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100">
                  <Link
                    href="/contact"
                    className="block py-4 text-gray-700 hover:text-[#41398B] font-medium text-[16px] transition-colors"
                  >
                    {labels.contacts[language]}
                  </Link>
                </div>

                {token && (
                  <div onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100">
                    <Link
                      href="/user-dashboard"
                      className="block py-4 text-gray-700 hover:text-[#41398B] font-medium text-[16px] transition-colors"
                    >
                      {labels.myProfile[language]}
                    </Link>
                  </div>
                )}

                {!token && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        router.push('/login')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full py-3 bg-[#41398B] text-white rounded-lg font-semibold hover:bg-[#352e7a] transition-all shadow-md active:scale-95"
                    >
                      {labels.loginRegister[language]}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
