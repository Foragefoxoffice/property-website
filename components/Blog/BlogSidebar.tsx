'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useLanguage } from '@/context/LanguageContext'

import { getBaseURL, getImageUrl } from '@/utils/baseURL'
const BASE = getBaseURL()

type Blog = { _id: string; slug?: { en?: string; vi?: string }; title?: { en?: string; vi?: string }; mainImage?: string; createdAt?: string; published?: boolean }
type Category = { _id: string; slug?: { en?: string; vi?: string }; name?: { en?: string; vi?: string } }

export default function BlogSidebar() {
  const [recentPosts, setRecentPosts] = useState<Blog[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()

  useEffect(() => {
    const search = searchParams.get('search')
    setSearchTerm(search || '')
  }, [searchParams])

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/blogs`),
      axios.get(`${BASE}/categories`),
    ]).then(([blogsRes, catsRes]) => {
      const published: Blog[] = (blogsRes.data?.data || []).filter((b: Blog) => b.published)
      setRecentPosts(published.slice(0, 5))
      setCategories(catsRes.data?.data || [])
    }).catch(() => {})
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    router.push(`/blogs?search=${value}`)
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 relative inline-block">
          {language === 'en' ? 'Search' : 'Tìm kiếm'}
          <span className="absolute bottom-[-4px] left-0 w-1/2 h-1 bg-[#41398B] rounded-full" />
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder={language === 'en' ? 'Search...' : 'Tìm kiếm...'}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] transition-all"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(searchTerm) }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 relative inline-block">
            {language === 'en' ? 'Recent Posts' : 'Bài viết mới'}
            <span className="absolute bottom-[-4px] left-0 w-1/2 h-1 bg-[#41398B] rounded-full" />
          </h3>
          <div className="space-y-6">
            {recentPosts.map(post => {
              const langKey = language === 'en' ? 'en' : 'vi'
              const slugVal = typeof post.slug === 'string' ? post.slug : (post.slug?.[langKey] || post.slug?.en || post.slug?.vi || post._id)
              
              return (
              <Link href={`/blogs/${slugVal}`} key={post._id} className="flex gap-4 group">
                {post.mainImage && (
                  <img src={getImageUrl(post.mainImage)} alt={post.title?.[language === 'en' ? 'en' : 'vi'] || post.title?.en || ''} className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition-opacity" />
                )}
                <div>
                  <h4 className="font-bold text-gray-800 leading-snug mb-1 line-clamp-2 group-hover:text-[#41398B] transition-colors">
                    {post.title?.[language === 'en' ? 'en' : 'vi'] || post.title?.en}
                  </h4>
                  {post.createdAt && <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>}
                </div>
              </Link>
            )})}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 relative inline-block">
            {language === 'en' ? 'Categories' : 'Danh mục'}
            <span className="absolute bottom-[-4px] left-0 w-1/2 h-1 bg-[#41398B] rounded-full" />
          </h3>
          <ul className="space-y-2">
            {categories.map(cat => {
              const langKey = language === 'en' ? 'en' : 'vi'
              const catSlugVal = typeof cat.slug === 'string' ? cat.slug : (cat.slug?.[langKey] || cat.slug?.en || cat.slug?.vi || cat._id)

              return (
              <li key={cat._id}>
                <Link
                  href={`/blogs?category=${catSlugVal}`}
                  className="flex items-center justify-between text-gray-600 hover:text-[#41398B] transition-colors py-2 border-b border-gray-50 last:border-0"
                >
                  <span>{cat.name?.[language === 'en' ? 'en' : 'vi'] || cat.name?.en}</span>
                  <span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full">•</span>
                </Link>
              </li>
            )})}
          </ul>
        </div>
      )}
    </div>
  )
}
