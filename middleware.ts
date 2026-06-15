import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'vi']
const defaultLocale = 'vi'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect if there is no locale
  const cookieLocale = request.cookies.get('language')?.value
  const locale = locales.includes(cookieLocale as string) ? cookieLocale : defaultLocale
  
  // Construct new URL with locale
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  
  return NextResponse.redirect(url)
}

export const config = {
  // Skip all paths that should not be localized
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
