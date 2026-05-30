'use client'

import { useLanguage } from '@/context/LanguageContext'
import { cleanHTML } from '@/lib/htmlSanitizer'

export default function TermsConditionContent({ data }: { data: Record<string, unknown> }) {
  const { language } = useLanguage()

  const contentTitle = language === 'en'
    ? data?.termsConditionContentTitle_en as string
    : data?.termsConditionContentTitle_vn as string

  const contentBody = language === 'en'
    ? data?.termsConditionContent_en as string
    : data?.termsConditionContent_vn as string

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {contentTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4 border-gray-200">
          {contentTitle}
        </h2>
      )}

      {contentBody ? (
        <div
          suppressHydrationWarning
          className="prose prose-lg max-w-none text-gray-600 prose-headings:font-bold prose-headings:text-gray-800 prose-a:text-[#41398B] prose-a:no-underline hover:prose-a:underline"
          style={{
            wordBreak: 'initial',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            display: 'block',
            width: '100%'
          }}
          dangerouslySetInnerHTML={{ __html: cleanHTML(contentBody) }}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          {language === 'en' ? 'No content available.' : 'Chưa có nội dung.'}
        </div>
      )}
    </div>
  )
}
