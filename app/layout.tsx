import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import ScrollUpButton from '@/components/ScrollUpButton'



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
    <html lang="en">
      <body>
        <Providers>
          {children}
          <FloatingContactButtons />
          <ScrollUpButton />
        </Providers>
      </body>
    </html>
  )
}
