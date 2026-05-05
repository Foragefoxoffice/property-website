import type { Metadata, Viewport } from 'next'
export const dynamic = 'force-dynamic'

import { Manrope } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import ScrollUpButton from '@/components/ScrollUpButton'
import SmoothScroll from '@/components/SmoothScroll'
import NavigationLoader from '@/components/NavigationLoader'


const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
})



export const metadata: Metadata = {
  metadataBase: new URL('https://183housingsolutions.com'),
  title: '183 Housing Solutions — Find Your Home in Vietnam',
  description: 'Browse properties for lease, sale, and home stay in Vietnam.',
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png' },
    ],
  },
  openGraph: {
    title: '183 Housing Solutions — Find Your Home in Vietnam',
    description: 'Browse properties for lease, sale, and home stay in Vietnam.',
    siteName: '183 Housing Solutions',
    locale: 'en_US',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className={manrope.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <NavigationLoader />
            <SmoothScroll />
            <PublicHeader />
            <main className="flex-1">
              {children}
            </main>
            <PublicFooter />
            <FloatingContactButtons />
            <ScrollUpButton />
          </div>
        </Providers>
      </body>
    </html>
  )
}
