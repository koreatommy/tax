import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/change-password - 사용자 비밀번호 변경
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // 새 비밀번호 길이 검증
    if (new_password.length < 6) {
      return NextResponse.json(
        { error: '새 비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 현재 비밀번호 확인 (재로그인 시도)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: '현재 비밀번호가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    // 비밀번호 변경
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (updateError) {
      console.error('비밀번호 변경 오류:', updateError)
      return NextResponse.json(
        { error: updateError.message || '비밀번호 변경에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: '비밀번호가 성공적으로 변경되었습니다' 
    })
  } catch (error) {
    console.error('POST /api/auth/change-password error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

