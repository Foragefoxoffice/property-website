import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | 183 Housing Solutions',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
