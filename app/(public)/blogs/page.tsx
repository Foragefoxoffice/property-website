import { fetchBlogPage } from '@/lib/serverFetch'
import BlogPageClient from '@/components/Blog/BlogPageClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchBlogPage()
    const data = (res.data as any) || {}

    return {
      title: data.blogSeoMetaTitle_en || 'Blog | 183 Housing Solutions',
      description:
        data.blogSeoMetaDescription_en ||
        'Read the latest news, tips, and guides from 183 Housing Solutions.',
      openGraph: {
        title: data.blogSeoOgTitle_en || data.blogSeoMetaTitle_en,
        description:
          data.blogSeoOgDescription_en ||
          data.blogSeoMetaDescription_en,
        images: data.blogSeoOgImage ? [data.blogSeoOgImage] : [],
      },
    }
  } catch {
    return {
      title: 'Blog | 183 Housing Solutions',
      description:
        'Read the latest news, tips, and guides from 183 Housing Solutions.',
    }
  }
}

export const revalidate = 300

export default async function BlogsPage() {
  let pageData = null

  try {
    // 👇 Show loader on refresh/navigation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const res = await fetchBlogPage()

    pageData = (res.data as Record<string, unknown>) || null
  } catch { }

  return <BlogPageClient pageData={pageData} />
}