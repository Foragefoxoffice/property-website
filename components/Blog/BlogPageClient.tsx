'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BlogBanner from './BlogBanner'
import BlogSidebar from './BlogSidebar'
import { useLanguage } from '@/context/LanguageContext'
import axios from 'axios'

import { getBaseURL, getImageUrl } from '@/utils/baseURL'
const BASE = getBaseURL()

type Blog = {
  _id: string
  published?: boolean
  slug?: { en?: string; vi?: string }
  title?: { en?: string; vi?: string }
  content?: { en?: string; vi?: string }
  mainImage?: string
  createdAt?: string
  category?: { name?: { en?: string; vi?: string }; slug?: { en?: string; vi?: string } }
}

type PageData = { blogTitle?: { en?: string; vi?: string }; blogBannerbg?: string }

function BlogPageInner({ pageData }: { pageData: PageData | null }) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const lang = language === 'en' ? 'en' : 'vi'

  useEffect(() => {
    axios.get(`${BASE}/blogs`).then(res => {
      setBlogs(res.data?.data || [])
    }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const filtered = blogs.filter(b => {
    if (!b.published) return false
    if (category) {
      const slug = b.category?.slug?.[lang] || b.category?.slug?.en
      if (slug !== category) return false
    }
    if (search) {
      const term = search.toLowerCase()
      const en = (b.title?.en || '').toLowerCase()
      const vi = (b.title?.vi || '').toLowerCase()
      if (!en.includes(term) && !vi.includes(term)) return false
    }
    return true
  })

  const bannerTitle = pageData?.blogTitle?.[lang] || pageData?.blogTitle?.en || (language === 'en' ? 'News & Articles' : 'Tin tức & Bài viết')
  const bannerBg = pageData?.blogBannerbg || ''

  return (
    <div className="bg-gray-50 min-h-screen">
      <BlogBanner title={bannerTitle} backgroundImage={bannerBg} />
      <div className="container mx-auto py-12 px-3 md:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtered.map(blog => {
                  const title = blog.title?.[lang] || blog.title?.en || 'Untitled'
                  const slugVal = typeof blog.slug === 'string' ? blog.slug : (blog.slug?.[lang] || blog.slug?.en || blog.slug?.vi || blog._id)
                  const content = blog.content?.[lang] || blog.content?.en || ''
                  const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                  const excerpt = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText
                  return (
                    <Link href={`/blogs/${slugVal}`} key={blog._id} className="group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                        {blog.mainImage ? (
                          <div className="overflow-hidden">
                            <img src={getImageUrl(blog.mainImage)} alt={title} className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="h-48 bg-[#E8E8FF] flex items-center justify-center">
                            <span className="text-[#41398B] text-4xl font-bold opacity-30">183</span>
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            <span className="bg-purple-50 text-[#41398B] px-3 py-1 rounded-full font-semibold text-xs">
                              {blog.category?.name?.[lang] || blog.category?.name?.en || (language === 'en' ? 'News' : 'Tin tức')}
                            </span>
                            {blog.createdAt && <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#41398B] transition-colors">{title}</h3>
                          {excerpt && <p className="text-gray-600 mb-4 text-sm flex-1 line-clamp-3">{excerpt}</p>}
                          <div className="text-[#41398B] font-semibold flex items-center gap-2 mt-auto">
                            {language === 'en' ? 'Read More' : 'Đọc thêm'}
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {language === 'en' ? 'No posts found' : 'Chưa có bài viết nào'}
                </h3>
                <p className="text-gray-500">{language === 'en' ? 'Please check back later.' : 'Vui lòng quay lại sau.'}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BlogPageClient({ pageData }: { pageData: PageData | null }) {
  return (
    <Suspense>
      <BlogPageInner pageData={pageData} />
    </Suspense>
  )
}
