'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'

function RouteLoaderInner({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const isFirstLoad = useRef(true)

    // Global click listener to catch all anchor clicks
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as Element;
            const anchor = target.closest('a');
            if (!anchor) return;
            
            const href = anchor.getAttribute('href');
            // Ignore links that don't have href or are external
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                // If it's absolute, check if it's the same origin
                const hrefUrl = anchor.href;
                if (!hrefUrl.startsWith(window.location.origin)) return;
            }
            
            const targetAttr = anchor.getAttribute('target');
            if (targetAttr === '_blank') return;

            // Ignore modified clicks (ctrl+click, etc.)
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

            try {
                // Determine if it's actually changing route
                const currentUrl = new URL(window.location.href);
                const targetUrl = new URL(anchor.href, window.location.href);
                
                // If it's a hash link on the same page, do not show loader
                if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
                    return;
                }
                
                // Escape React 18 concurrent transition batching
                setTimeout(() => {
                    setLoading(true);
                }, 0);
                
                // Safety fallback: if navigation fails or gets stuck, remove loader after 15s
                setTimeout(() => {
                    setLoading(false);
                }, 15000);
            } catch (err) {
                // Ignore parsing errors
            }
        };

        // Use capture phase to intercept clicks early
        document.addEventListener('click', handleAnchorClick, true);
        return () => document.removeEventListener('click', handleAnchorClick, true);
    }, []);

    // Listen for custom route start event (if triggered manually like in router.push)
    useEffect(() => {
        const handleStart = () => {
            setTimeout(() => setLoading(true), 0);
            setTimeout(() => setLoading(false), 15000);
        }
        window.addEventListener('routeChangeStart', handleStart)
        return () => window.removeEventListener('routeChangeStart', handleStart)
    }, [])

    // Stop loader when path or query changes (and on initial mount)
    const searchParamsStr = searchParams ? searchParams.toString() : '';
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false
            // Add a small delay on initial load so the loader is visible to the user briefly
            const timer = setTimeout(() => {
                setLoading(false)
            }, 600)
            return () => clearTimeout(timer)
        }

        setLoading(false)
    }, [pathname, searchParamsStr])

    return (
        <>
            <div id="loader-mount-point" style={{ display: 'contents' }}>
                {loading && <Loader />}
            </div>
            {children}
        </>
    )
}

export default function RouteLoader({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={<>{children}</>}>
            <RouteLoaderInner>{children}</RouteLoaderInner>
        </Suspense>
    )
}