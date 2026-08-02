'use client'

import { usePathname } from 'next/navigation'
import Loader from '@/components/Loader'

export default function DynamicRootLoader() {
    const pathname = usePathname()
    const isHomePage = pathname === '/' || pathname === '/en' || pathname === '/vi' || pathname === '/en/' || pathname === '/vi/'
    
    if (isHomePage) return null
    return <Loader />
}
