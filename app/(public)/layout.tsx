// app/(public)/layout.tsx
import PublicHeader from '@/components/Layout/PublicHeader'
import PublicFooter from '@/components/Layout/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
