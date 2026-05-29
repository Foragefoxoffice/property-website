import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password | 183 Housing Solutions',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
