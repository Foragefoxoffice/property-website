import type { Metadata, Viewport } from 'next'
export const dynamic = 'force-dynamic'

import { Manrope } from 'next/font/google'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

import Providers from '@/components/Providers'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import ScrollUpButton from '@/components/ScrollUpButton'
import SmoothScroll from '@/components/SmoothScroll'
import RouteLoader from '@/components/RouteLoader'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://183housingsolutions.com'),
  title: '183 Housing Solutions — Find Your Home in Vietnam',
  description:
    'Browse properties for lease, sale, and home stay in Vietnam.',
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicon.png' }],
  },
  openGraph: {
    title: '183 Housing Solutions — Find Your Home in Vietnam',
    description:
      'Browse properties for lease, sale, and home stay in Vietnam.',
    siteName: '183 Housing Solutions',
    locale: 'en_US',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.183housingsolutions.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.183housingsolutions.com" />
      </head>
      <body className={manrope.className}>
        <Providers>
          <RouteLoader>
            <div className="flex flex-col min-h-screen">
              <SmoothScroll />

              <PublicHeader />

              <main className="flex-1">
                {children}
              </main>

              <PublicFooter />

              <FloatingContactButtons />

              <ScrollUpButton />
            </div>
          </RouteLoader>
        </Providers>
      </body>
    </html>
  )
}