'use client'

import { useState, Suspense } from 'react'
import { Calendar, Clock, Share2 } from 'lucide-react'
import Link from 'next/link'
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
  const { language } = useLanguage()
  const lang = language === 'en' ? 'en' : 'vi'

  const title = blog.title?.[lang] || blog.title?.en || 'Untitled'
  const content = blog.content?.[lang] || blog.content?.en || ''
  const mainImage = getImageUrl(blog.mainImage)
  const categoryName = blog.category?.name?.[lang] || blog.category?.name?.en || ''
  const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
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
                style={{ lineHeight: '1.8' }}
                className="news-content prose prose-lg max-w-none w-full
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h2:text-[#41398B]
                  prose-p:text-gray-600 prose-p:leading-relaxed [&_p]:!text-left
                  prose-a:text-[#41398B] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                  prose-blockquote:border-l-4 prose-blockquote:border-[#41398B] prose-blockquote:bg-purple-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                  prose-strong:text-gray-900 prose-li:marker:text-[#41398B]"
              >
                <div className="overflow-hidden" dangerouslySetInnerHTML={{ __html: content.replace(/&nbsp;/g, ' ') }} />
              </article>

              <div className="flex justify-between mt-8 pt-8 border-t border-gray-100 flex-wrap gap-6">
                {tags.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-800 block mb-3">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#41398B] hover:text-white transition-all cursor-pointer">
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
