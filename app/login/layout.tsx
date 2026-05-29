import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | 183 Housing Solutions',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
