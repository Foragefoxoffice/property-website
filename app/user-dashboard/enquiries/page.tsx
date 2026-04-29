'use client'

import React, { useEffect, useState } from 'react'
import { getUserEnquiries } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/language/translations'

interface Enquiry {
  _id: string
  properties: { title?: string; _id: string }[]
  message: string
  status: string
  createdAt: string
}

export default function EnquiriesPage() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] as Record<string, string>
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserEnquiries()
      .then(res => setEnquiries(res.data?.data || []))
      .catch(() => setError('Failed to load enquiries'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 border-4 border-[#41398B] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-[#41398B] mb-6">My Enquiries</h1>
      {enquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No enquiries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map(enquiry => (
            <div key={enquiry._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  enquiry.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{enquiry.status}</span>
                <span className="text-xs text-gray-400">
                  {new Date(enquiry.createdAt).toLocaleDateString()}
                </span>
              </div>
              {enquiry.properties?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-1">Properties:</p>
                  <div className="flex flex-wrap gap-2">
                    {enquiry.properties.map(p => (
                      <span key={p._id} className="px-2 py-1 bg-[#E8E8FF] text-[#41398B] text-xs rounded-md">
                        {p.title || p._id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {enquiry.message && (
                <p className="text-sm text-gray-600 mt-2 border-t border-gray-50 pt-2">{enquiry.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
