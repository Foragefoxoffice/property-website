'use client'

import { useState, Suspense, useEffect } from 'react'
import { Calendar, Clock, Share2 } from 'lucide-react'
import Link from '@/components/LanguageLink'
import BlogSidebar from './BlogSidebar'
import { useLanguage } from '@/context/LanguageContext'

import { getImageUrl } from '@/utils/baseURL'

type Blog = {
  _id?: string
  title?: { en?: string; vi?: string }
  content?: { en?: string; vi?: string }
  mainImage?: string
  author?: string
  createdAt?: string
  category?: { name?: { en?: string; vi?: string } }
  tags?: { en?: string[]; vi?: string[] }
}

function BlogDetailInner({ blog }: { blog: Blog }) {
  const { language, setDynamicRouteSlugs } = useLanguage()

  useEffect(() => {
    if (setDynamicRouteSlugs && blog) {
      const seo = (blog as any).seoInformation || {}
      const blogSlugObj = (blog as any).slug || {}
      
      const viSlug = seo.slugUrl?.vi || blogSlugObj.vi || (blog as any).slug || ''
      const enSlug = seo.slugUrl?.en || blogSlugObj.en || (blog as any).slug || ''
      
      if (viSlug && enSlug) {
        setDynamicRouteSlugs({
          vi: `/blogs/${viSlug}`,
          en: `/blogs/${enSlug}`
        })
      }
      
      return () => {
        setDynamicRouteSlugs(null)
      }
    }
  }, [blog, setDynamicRouteSlugs])

  const lang = language === 'en' ? 'en' : 'vi'

  const title = blog.title?.[lang] || blog.title?.en || 'Untitled'
  const content = blog.content?.[lang] || blog.content?.en || ''
  const mainImage = getImageUrl(blog.mainImage)
  const categoryName = blog.category?.name?.[lang] || blog.category?.name?.en || ''
  const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : ''
  const tags = blog.tags?.[lang] || blog.tags?.en || []

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(() => { })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          {mainImage ? (
            <img src={mainImage} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#41398B]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center -mt-10">
          {categoryName && (
            <div className="md:mb-6 mb-4">
              <span className="inline-block px-5 py-2 bg-[#41398B] shadow-lg shadow-[#41398B]/30 rounded-full text-sm font-bold tracking-wider uppercase text-white">
                {categoryName}
              </span>
            </div>
          )}
          <h1 className="text-2xl md:text-4xl font-extrabold mb-8 max-w-5xl mx-auto leading-tight drop-shadow-lg capitalize tracking-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-gray-200 font-medium">
            {blog.author && (
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#41398B] to-purple-500 flex items-center justify-center text-[10px] font-bold border border-white/30">
                  {blog.author.charAt(0)}
                </span>
                {blog.author}
              </span>
            )}
            {dateStr && (
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Calendar size={16} className="text-purple-300" />
                {dateStr}
              </span>
            )}
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <Clock size={16} className="text-purple-300" />
              5 min read
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto md:px-11 px-2 md:py-16 py-8 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 min-w-0">
            <div className="bg-white rounded-xl shadow-xl p-4 md:p-10 border border-gray-100 ring-1 ring-black/5 overflow-hidden">
              <article
                key={lang}
                style={{ lineHeight: '1.8' }}
                className="news-content max-w-none w-full text-lg
                  [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:text-3xl [&_h1]:mb-4
                  [&_h2]:font-bold [&_h2]:text-[#41398B] [&_h2]:text-2xl [&_h2]:mb-4 [&_h2]:mt-6
                  [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:text-xl [&_h3]:mb-3 [&_h3]:mt-5
                  [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:!text-left [&_p]:mb-4
                  [&_a]:text-blue-600 [&_a]:font-medium [&_a]:underline hover:[&_a]:text-blue-800
                  [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:my-8 [&_img]:max-w-full
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#41398B] [&_blockquote]:bg-purple-50 [&_blockquote]:py-4 [&_blockquote]:px-6 [&_blockquote]:rounded-r-lg [&_blockquote]:my-6
                  [&_strong]:text-gray-900 [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4"
              >
                <div suppressHydrationWarning className="overflow-hidden" dangerouslySetInnerHTML={{ __html: content.replace(/&nbsp;/g, ' ') }} />
              </article>

              <div className="flex justify-between mt-8 pt-8 border-t border-gray-100 flex-wrap gap-6">
                {tags.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-800 block mb-3">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span key={tag + i} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#41398B] hover:text-white transition-all cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-bold text-gray-800 block mb-3">{language === 'en' ? 'Share This News:' : 'Chia sẻ:'}</span>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-gray-700 border border-gray-300 px-4 py-2 rounded-full cursor-pointer hover:bg-[#41398B] hover:text-white hover:border-[#41398B] transition-all"
                  >
                    <Share2 size={18} />
                    {language === 'en' ? 'Share' : 'Chia sẻ'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BlogDetailClient({ blog }: { blog: Blog }) {
  return (
    <Suspense>
      <BlogDetailInner blog={blog} />
    </Suspense>
  )
}
