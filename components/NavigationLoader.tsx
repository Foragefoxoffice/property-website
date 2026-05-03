'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Loader from './Loader'

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      const target = event.target as HTMLElement
      const anchor = target.closest('a')

      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        anchor.origin === window.location.origin &&
        // Use a more robust check for different URLs
        anchor.href.split('#')[0] !== window.location.href.split('#')[0]
      ) {
        setIsNavigating(true)
      }
    }

    // Intercept programmatic navigation (router.push, router.replace)
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      const url = args[2]
      if (url && String(url) !== window.location.pathname + window.location.search) {
        setIsNavigating(true)
      }
      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function (...args) {
      const url = args[2]
      if (url && String(url) !== window.location.pathname + window.location.search) {
        setIsNavigating(true)
      }
      return originalReplaceState.apply(this, args)
    }

    document.addEventListener('click', handleAnchorClick)
    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  if (!isNavigating) return null

  return <Loader />
}

export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  )
}
