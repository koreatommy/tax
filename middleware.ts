import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // admin-login 페이지는 항상 접근 허용 (인증 체크 전에 먼저 처리)
  if (pathname.startsWith('/admin-login')) {
    return NextResponse.next()
  }

  // 인증이 필요 없는 경로
  const publicPaths = ['/login', '/register', '/admin-login']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 관리자 경로 체크
  const isAdminPath = pathname.startsWith('/admin')
  const adminSession = request.cookies.get('admin_session')

  // 관리자 경로는 관리자 세션만 확인 (Supabase 사용자 인증 불필요)
  if (isAdminPath) {
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    // 관리자 세션이 있으면 접근 허용
    return NextResponse.next()
  }

  // 인증된 사용자가 로그인/회원가입 페이지에 접근하면 대시보드로 리다이렉트
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 미인증 사용자가 보호된 경로에 접근하면 로그인 페이지로 리다이렉트
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

