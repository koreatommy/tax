import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123!@#'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: '패스워드가 필요합니다' },
        { status: 400 }
      )
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '올바르지 않은 관리자 패스워드입니다' },
        { status: 401 }
      )
    }

    // 관리자 세션 설정 (24시간 유효)
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    })

    return NextResponse.json({ 
      success: true,
      message: '관리자 인증 성공'
    })

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: '인증 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    return NextResponse.json({ 
      isAuthenticated: adminSession?.value === 'authenticated'
    })

  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json(
      { error: '인증 상태 확인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')

    return NextResponse.json({ 
      success: true,
      message: '관리자 세션이 종료되었습니다'
    })

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
