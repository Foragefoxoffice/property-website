import { fetchAboutCms } from '@/lib/serverFetch'
import AboutBanner from '@/components/About/AboutBanner'
import AboutOverview from '@/components/About/AboutOverview'
import AboutMissionVission from '@/components/About/AboutMissionVission'
import AboutHistory from '@/components/About/AboutHistory'
import AboutWhyChoose from '@/components/About/AboutWhyChoose'
import AboutBuyProcess from '@/components/About/AboutBuyProcess'
import AboutFindProperty from '@/components/About/AboutFindProperty'
import AboutAgent from '@/components/About/AboutAgent'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetchAboutCms()
    const data = (res.data as any) || {}

    return {
      title: data.aboutSeoMetaTitle_en || 'About Us | 183 Housing Solutions',
      description:
        data.aboutSeoMetaDescription_en ||
        'Learn about 183 Housing Solutions and our mission in Vietnam.',
      openGraph: {
        title: data.aboutSeoOgTitle_en || data.aboutSeoMetaTitle_en,
        description:
          data.aboutSeoOgDescription_en ||
          data.aboutSeoMetaDescription_en,
        images: data.aboutSeoOgImage ? [data.aboutSeoOgImage] : [],
      },
    }
  } catch {
    return {
      title: 'About Us | 183 Housing Solutions',
      description:
        'Learn about 183 Housing Solutions and our mission in Vietnam.',
    }
  }
}

export default async function AboutPage() {
  let data: Record<string, unknown> = {}

  try {
    // 👇 Add delay for loader visibility
    await new Promise(resolve => setTimeout(resolve, 1500))

    const res = await fetchAboutCms()

    data = (res.data as Record<string, unknown>) || {}
  } catch { }

  return (
    <div className="min-h-screen bg-white">
      <AboutBanner data={data} />
      <AboutOverview data={data} />
      <AboutMissionVission data={data} />
      <AboutHistory data={data} />
      <AboutWhyChoose data={data} />
      <AboutBuyProcess data={data} />
      <AboutFindProperty data={data} />
      <AboutAgent data={data} />
    </div>
  )
}