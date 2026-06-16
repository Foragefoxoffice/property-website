// @ts-nocheck
'use client'
'use client'

import { useLanguage } from '@/context/LanguageContext'
import { getImageUrl } from '@/utils/baseURL'
import { processRichText } from '@/utils/display'
import Image from 'next/image'

export default function ProjectIntroduction({ data }: { data: Record<string, unknown> }) {
  const { language } = useLanguage()

  if (!data) return null

  const title = language === 'en'
    ? (data.projectIntroTitle as any)?.en || ''
    : (data.projectIntroTitle as any)?.vi || (data.projectIntroTitle as any)?.en || ''

  const content = language === 'en'
    ? (data.projectIntroContent as any)?.en || ''
    : (data.projectIntroContent as any)?.vi || (data.projectIntroContent as any)?.en || ''

  const videoUrl = data.projectIntroVideo as string
  const mediaType = data.mediaType as string || 'image'

  if (!content && !videoUrl) return null

  const getYoutubeId = (url: string) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null

  return (
    <section id="introduction" className="py-16 md:py-18 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col gap-10 md:gap-14 items-center">
          <div className="w-full max-w-4xl px-4 mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-6 uppercase tracking-tight text-center">
              {title}
            </h2>
            <div
              suppressHydrationWarning
              className="
    text-[15px] md:text-[16px]
    leading-[1.8]
    text-gray-600
    max-w-none
    project-intro-content
  "
              dangerouslySetInnerHTML={{ __html: processRichText(content) }}
            />
          </div>

          <div className="w-full max-w-6xl flex flex-col mt-4 lg:mt-0">
            {mediaType === 'youtube' && youtubeId ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="Project Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : mediaType === 'image' && videoUrl ? (
              <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-50 relative aspect-video">
                <Image
                  src={getImageUrl(videoUrl)}
                  alt="Project Overview"
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
  .project-intro-content ul {
    list-style-type: disc !important;
    padding-left: 24px !important;
    margin: 16px 0 !important;
    list-style-position: outside !important;
  }

  .project-intro-content ol {
    list-style-type: decimal !important;
    padding-left: 24px !important;
    margin: 16px 0 !important;
    list-style-position: outside !important;
  }

  .project-intro-content li {
    display: list-item !important;
    margin-bottom: 8px !important;
  }

  .project-intro-content p {
    margin-bottom: 10px !important;
  }
` }} />
    </section>
  )
}