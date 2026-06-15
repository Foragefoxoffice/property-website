'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'

function RedirectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

  useEffect(() => {
    if (url) {
      // Use replace to prevent building up browser history with the redirect page
      router.replace(url)
    } else {
      router.replace('/')
    }
  }, [url, router])

  // Show the loader instantly while the target page fetches via RSC
  return <Loader />
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<Loader />}>
      <RedirectInner />
    </Suspense>
  )
}
