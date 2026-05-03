import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
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
  title: '183 Housing Solutions — Find Your Home in Vietnam',
  description: 'Browse properties for lease, sale, and home stay in Vietnam.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    siteName: '183 Housing Solutions',
    locale: 'en_US',
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
          <NavigationLoader />
          <SmoothScroll />
          {children}
          <FloatingContactButtons />
          <ScrollUpButton />
        </Providers>
      </body>
    </html>
  )
}
