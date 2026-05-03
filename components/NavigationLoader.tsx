'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Loader from './Loader'

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // 1. Global listener for ChunkLoadErrors
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = (event as any).error || (event as any).reason || event;
      const errorMessage = error?.message || '';
      
      // If we see a chunk load error, force a hard reload to get fresh assets
      if (
        errorMessage.includes('ChunkLoadError') || 
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Failed to load resource')
      ) {
        console.warn('ChunkLoadError detected. Refreshing page for latest assets...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleChunkError);

    // 2. Handle anchor clicks
    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      const target = event.target as HTMLElement
      const anchor = target.closest('a')

      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        anchor.origin === window.location.origin &&
        anchor.href.split('#')[0] !== window.location.href.split('#')[0]
      ) {
        setIsNavigating(true)
      }
    }

    // Intercept programmatic navigation
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

    // Safety timeout: If navigation takes > 10 seconds, hide loader
    const timeout = setTimeout(() => setIsNavigating(false), 10000);

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('error', handleChunkError, true);
      window.removeEventListener('unhandledrejection', handleChunkError);
      clearTimeout(timeout);
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
