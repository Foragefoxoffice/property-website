// @ts-nocheck
'use client'
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import ProjectBanner from './ProjectBanner'
import ProjectIntroduction from './ProjectIntroduction'

import { getImageUrl } from '@/utils/baseURL'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

type Category = { _id: string; name?: { en?: string; vi?: string } }
type Project = {
  _id: string
  published?: boolean
  slug?: { en?: string; vi?: string }
  title?: { en?: string; vi?: string }
  mainImage?: string
  createdAt?: string
  category?: { _id?: string; name?: { en?: string; vi?: string } }
  projectMainDescription?: { en?: string; vi?: string }
  projectIntroContent?: { en?: string; vi?: string }
}

function ProjectPageInner({
  initialProjects,
  initialCategories,
  cmsData
}: {
  initialProjects: Project[];
  initialCategories: Category[];
  cmsData: Record<string, unknown>
}) {
  const [projects] = useState<Project[]>(initialProjects)
  const [categories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language } = useLanguage()
  const lang = language === 'en' ? 'en' : 'vi'

  const categoryParam = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')

  useEffect(() => {
    setSelectedCategory(categoryParam || 'all')
  }, [categoryParam])

  const filteredProjects = projects.filter(p => {
    if (!p.published) return false
    if (selectedCategory === 'all') return true
    const catId = (p.category as { _id?: string })?._id || p.category
    return catId === selectedCategory
  })

  const selectCategory = (id: string) => {
    setSelectedCategory(id)
    if (id === 'all') router.push('/projects')
    else router.push(`/projects?category=${id}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <ProjectBanner data={cmsData} />
      <ProjectIntroduction data={cmsData} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <button
            onClick={() => selectCategory('all')}
            className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedCategory === 'all' ? 'bg-[#41398B] text-white shadow-sm scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            {language === 'en' ? 'All' : 'Tất cả'}
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => selectCategory(cat._id)}
              className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedCategory === cat._id ? 'bg-[#41398B] text-white shadow-sm scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              {cat.name?.[lang] || cat.name?.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest opacity-60">
              {language === 'en' ? 'No projects found in this category.' : 'Không tìm thấy dự án nào trong danh mục này.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProjects.map(project => {
              const title = project.title?.[lang] || project.title?.en || 'Untitled'
              const slugVal = project.slug?.[lang] || project.slug?.en || project._id
              const formattedDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : ''
              const descSource = project.projectMainDescription?.[lang] || project.projectMainDescription?.en || project.projectIntroContent?.[lang] || project.projectIntroContent?.en || ''
              const plain = stripHtml(descSource)
              const excerpt = plain.length > 150 ? plain.slice(0, 150) + '...' : plain

              return (
                <Link
                  href={`/projects/${slugVal}`}
                  key={project._id}
                  className="group flex flex-col h-full bg-white rounded-[16px] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {project.mainImage ? (
                      <img src={getImageUrl(project.mainImage)} alt={title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-[#E8E8FF] flex items-center justify-center">
                        <span className="text-[#41398B] text-4xl font-bold opacity-30">183</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 pt-5 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-4 justify-between">
                      {project.category?.name && (
                        <span className="bg-[#F5F3FF] text-[#41398B] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                          {project.category.name[lang] || project.category.name.en}
                        </span>
                      )}
                      {formattedDate && <span className="text-gray-400 text-[13px] font-medium">{formattedDate}</span>}
                    </div>
                    <h3 className="text-[20px] font-bold text-[#111827] leading-tight mb-4 group-hover:text-[#41398B] transition-colors line-clamp-2">{title}</h3>
                    {excerpt && <p className="text-gray-500 text-[14.5px] leading-relaxed line-clamp-3 mb-6 font-medium">{excerpt}</p>}
                    <div className="mt-auto flex items-center gap-2 text-[#41398B] font-bold text-[15px]">
                      <span>{language === 'en' ? 'Read More' : 'Xem thêm'}</span>
                      <span className="transform transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectPageClient({
  initialProjects,
  initialCategories,
  cmsData
}: {
  initialProjects: Project[];
  initialCategories: Category[];
  cmsData: Record<string, unknown>
}) {
  return (
    <Suspense>
      <ProjectPageInner
        initialProjects={initialProjects}
        initialCategories={initialCategories}
        cmsData={cmsData}
      />
    </Suspense>
  )
}








