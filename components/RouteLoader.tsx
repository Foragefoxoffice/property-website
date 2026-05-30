'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Loader from '@/components/Loader'

export default function RouteLoader({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)
    const isFirstLoad = useRef(true)

    useEffect(() => {
        // Skip loader on initial page load / refresh
        if (isFirstLoad.current) {
            isFirstLoad.current = false
            return
        }

        setLoading(true)

        const timer = setTimeout(() => {
            setLoading(false)
        }, 700)

        return () => clearTimeout(timer)
    }, [pathname])

    return (
        <>
            {loading && <Loader />}
            {children}
        </>
    )
}