import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const cookieStore = req.cookies
    const { data: { session } } = await supabase.auth.getSession()

    // Allow public access to embed routes
    if (req.nextUrl.pathname.startsWith('/embed')) {
      return res
    }

    // Allow public access to API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
      return res
    }

    // Allow public access to auth routes
    if (req.nextUrl.pathname.startsWith('/auth')) {
      // If user is already logged in, redirect to home
      if (session) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return res
    }

    // For all other routes, require authentication
    if (!session) {
      const redirectUrl = new URL('/auth/signin', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user email matches allowed email
    if (session.user.email !== process.env.ALLOWED_EMAIL) {
      await supabase.auth.signOut()
      const redirectUrl = new URL('/auth/signin', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// Update matcher to exclude API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 