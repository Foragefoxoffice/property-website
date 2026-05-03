'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Loader from './Loader'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // When pathname or searchParams change, we know a navigation has COMPLETED.
    // To show a loader DURING the transition, we would need to know when it STARTS.
    // Since Next.js doesn't expose a "routeChangeStart" event in App Router easily,
    // we can use the loading.tsx mechanism combined with Suspense.
    setLoading(false)
  }, [pathname, searchParams])

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  )
}
