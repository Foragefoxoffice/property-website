'use client'

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'

function isHomePagePath(path: string | null | undefined): boolean {
    if (!path) return false
    return path === '/' || path === '/en' || path === '/vi' || path === '/en/' || path === '/vi/'
}

/**
 * HomeVideoLoader lives OUTSIDE the Suspense boundary so it never gets
 * unmounted or hidden by useSearchParams() suspending during hydration.
 * It uses window.location for initial detection (SSR-safe with useState initializer).
 */
function HomeVideoLoader({ onFinished, onFading }: { onFinished: () => void, onFading: () => void }) {
    const pathname = usePathname()
    const [visible, setVisible] = useState(() => isHomePagePath(pathname))
    const [fading, setFading] = useState(false)
    const [videoKey, setVideoKey] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const hasFinished = useRef(false)
    const fadeStarted = useRef(false)

    // Duration of the crossfade in seconds
    const FADE_DURATION = 1.5
    // How many seconds before the video ends to start fading
    const FADE_START_BEFORE_END = 1.8

    // Final cleanup — called after CSS transition completes
    const fullyDismiss = useCallback(() => {
        if (hasFinished.current) return
        hasFinished.current = true
        setVisible(false)
        setFading(false)
        fadeStarted.current = false
        onFinished()
    }, [onFinished])

    // Start the fade-out (called when video is near its end)
    const startFade = useCallback(() => {
        if (fadeStarted.current) return
        fadeStarted.current = true
        setFading(true)
        onFading()

        // After CSS transition completes, fully remove the overlay
        setTimeout(() => {
            fullyDismiss()
        }, FADE_DURATION * 1000 + 100) // slight buffer past transition end
    }, [fullyDismiss, onFading])

    // Listen for events from the inner route loader to show/hide the video
    useEffect(() => {
        const handleShowHomeVideo = () => {
            hasFinished.current = false
            fadeStarted.current = false
            setFading(false)
            setVisible(true)
            setVideoKey(k => k + 1)
        }

        window.addEventListener('showHomeVideoLoader', handleShowHomeVideo)
        return () => window.removeEventListener('showHomeVideoLoader', handleShowHomeVideo)
    }, [])

    // Safety: if video fails to load or play, dismiss after 15s
    useEffect(() => {
        if (!visible) return
        const timer = setTimeout(() => {
            startFade()
        }, 15000)
        return () => clearTimeout(timer)
    }, [visible, videoKey, startFade])

    // Attach timeupdate to trigger crossfade near the end of the video
    useEffect(() => {
        if (!visible) return
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            if (video.duration && video.currentTime >= video.duration - FADE_START_BEFORE_END) {
                startFade()
            }
        }

        // If the video somehow ends before we start the fade, start it immediately
        const handleEnded = () => startFade()

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('ended', handleEnded)

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('ended', handleEnded)
        }
    }, [visible, videoKey, startFade])

    if (!visible) return null

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                zIndex: 9999, // Behind the app content which will have zIndex 10000 during transition
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: fading ? 0 : 1,
                transition: fading ? `opacity ${FADE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
                pointerEvents: fading ? 'none' : 'auto',
            }}
        >
            <video
                ref={videoRef}
                key={videoKey}
                autoPlay
                muted
                playsInline
                src="/images/property/loader_animation_home.mp4"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
    )
}

/**
 * RouteLoaderInner handles non-home-page loading states and triggers
 * the home video loader via a custom DOM event.
 */
function RouteLoaderInner({
    homeVideoActive,
}: {
    homeVideoActive: boolean
}) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchParamsStr = searchParams ? searchParams.toString() : ''

    const isFirstLoad = useRef(true)

    // Global click listener to catch navigation clicks
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as Element
            const anchor = target.closest('a')
            if (!anchor) return

            const href = anchor.getAttribute('href')
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                const hrefUrl = anchor.href
                if (!hrefUrl.startsWith(window.location.origin)) return
            }

            if (anchor.getAttribute('target') === '_blank') return
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return

            try {
                const currentUrl = new URL(window.location.href)
                const targetUrl = new URL(anchor.href, window.location.href)

                if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
                    return
                }

                if (isHomePagePath(targetUrl.pathname) && !isHomePagePath(currentUrl.pathname)) {
                    // Trigger the home video loader only when coming FROM a non-home page
                    window.dispatchEvent(new Event('showHomeVideoLoader'))
                } else if (!isHomePagePath(targetUrl.pathname)) {
                    window.dispatchEvent(new CustomEvent('setStandardLoader', { detail: true }))
                }

                // Safety fallback
                setTimeout(() => window.dispatchEvent(new CustomEvent('setStandardLoader', { detail: false })), 15000)
            } catch {
                // Ignore parsing errors
            }
        }

        document.addEventListener('click', handleAnchorClick, true)
        return () => document.removeEventListener('click', handleAnchorClick, true)
    }, [])

    // Listen for programmatic route changes (router.push)
    useEffect(() => {
        const handleStart = () => {
            window.dispatchEvent(new CustomEvent('setStandardLoader', { detail: true }))
            setTimeout(() => window.dispatchEvent(new CustomEvent('setStandardLoader', { detail: false })), 15000)
        }
        window.addEventListener('routeChangeStart', handleStart)
        return () => window.removeEventListener('routeChangeStart', handleStart)
    }, [])

    // Dismiss standard loader when route changes
    useEffect(() => {
        const isPropertyDetailPage = pathname.match(/\/listing\/.+/)
        const isRedirectPage = pathname.match(/\/redirect/)
        
        if (isFirstLoad.current) {
            isFirstLoad.current = false
            if (!isHomePagePath(pathname) && !isPropertyDetailPage && !isRedirectPage) {
                const timer = setTimeout(() => window.dispatchEvent(new CustomEvent('setStandardLoader', { detail: false })), 600)
                return () => clearTimeout(timer)
            }
            return
        }
        if (!isPropertyDetailPage && !isRedirectPage) {
            window.dispatchEvent(new CustomEvent('setStandardLoader', { detail: false }))
        }
    }, [pathname, searchParamsStr])

    return null
}

export default function RouteLoader({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [homeVideoActive, setHomeVideoActive] = useState(() => isHomePagePath(pathname))
    const [homeVideoFading, setHomeVideoFading] = useState(false)

    const handleVideoFinished = useCallback(() => {
        setHomeVideoActive(false)
        setHomeVideoFading(false)
    }, [])
    
    const handleVideoFading = useCallback(() => {
        setHomeVideoFading(true)
    }, [])

    // Also listen for the show event to re-activate
    useEffect(() => {
        const handleShow = () => {
            setHomeVideoActive(true)
            setHomeVideoFading(false)
        }
        window.addEventListener('showHomeVideoLoader', handleShow)
        return () => window.removeEventListener('showHomeVideoLoader', handleShow)
    }, [])

    const [showStandardLoader, setShowStandardLoader] = useState(() => !isHomePagePath(pathname))

    useEffect(() => {
        const handleSet = (e: any) => setShowStandardLoader(e.detail)
        const handleHide = () => setShowStandardLoader(false)
        
        window.addEventListener('setStandardLoader', handleSet)
        window.addEventListener('hideStandardLoader', handleHide)
        
        return () => {
            window.removeEventListener('setStandardLoader', handleSet)
            window.removeEventListener('hideStandardLoader', handleHide)
        }
    }, [])

    const showLoader = showStandardLoader && !homeVideoActive

    return (
        <>
            {/* Home video loader lives OUTSIDE Suspense — never unmounted by useSearchParams */}
            <HomeVideoLoader onFinished={handleVideoFinished} onFading={handleVideoFading} />
            
            {showLoader && <Loader />}

            {/* Wrap the app in a crossfading container */}
            <div 
                style={{ 
                    opacity: (homeVideoActive && !homeVideoFading) ? 0 : 1, 
                    transition: homeVideoActive ? `opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
                    position: 'relative',
                    zIndex: homeVideoActive ? 10000 : 'auto', // Place above video when active
                    minHeight: '100vh',
                    pointerEvents: (homeVideoActive && !homeVideoFading) ? 'none' : 'auto'
                }}
            >
                <Suspense fallback={null}>
                    <RouteLoaderInner homeVideoActive={homeVideoActive} />
                </Suspense>
                {children}
            </div>
        </>
    )
}