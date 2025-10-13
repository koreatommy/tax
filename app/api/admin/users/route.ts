import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/users - 전체 사용자 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    // 관리자 세션 확인
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Service Role Key를 사용하는 관리자 클라이언트 생성
    const supabase = createAdminClient()

    // Auth 사용자 목록 조회
    const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Auth users list error:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // 각 사용자의 회사 정보 조회
    const usersWithCompanies = await Promise.all(
      authUsers.users.map(async (authUser) => {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          company: company || null,
        }
      })
    )

    return NextResponse.json({ data: usersWithCompanies })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/users - 사용자 회사 정보 수정 (관리자 전용)
 */
export async function PUT(request: NextRequest) {
  try {
    // 관리자 세션 확인
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const {
      user_id,
      company_name,
      business_number,
      representative_name,
      address,
      contact,
      email,
    } = body

    if (!user_id || !company_name || !business_number || !representative_name) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 기존 회사 정보 확인
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, business_number')
      .eq('user_id', user_id)
      .single()

    // 사업자번호 중복 체크 (현재 사용자 제외)
    const { data: duplicateCheck } = await supabase
      .from('companies')
      .select('id')
      .eq('business_number', business_number)
      .neq('user_id', user_id)
      .single()

    if (duplicateCheck) {
      return NextResponse.json(
        { error: '이미 사용 중인 사업자등록번호입니다' },
        { status: 409 }
      )
    }

    if (existingCompany) {
      // 회사 정보 수정
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          company_name,
          business_number,
          representative_name,
          address: address || null,
          contact: contact || null,
          email: email || null,
        })
        .eq('user_id', user_id)

      if (updateError) {
        console.error('회사 정보 수정 오류:', updateError)
        return NextResponse.json({ 
          error: `수정 실패: ${updateError.message}`,
          details: updateError 
        }, { status: 500 })
      }
    } else {
      // 회사 정보 생성
      const { error: insertError } = await supabase
        .from('companies')
        .insert({
          user_id,
          company_name,
          business_number,
          representative_name,
          address: address || null,
          contact: contact || null,
          email: email || null,
        })

      if (insertError) {
        console.error('회사 정보 생성 오류:', insertError)
        return NextResponse.json({ 
          error: `생성 실패: ${insertError.message}`,
          details: insertError 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: '사용자 정보가 수정되었습니다' })
  } catch (error) {
    console.error('PUT /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users - 사용자 삭제 (관리자 전용)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 관리자 세션 확인
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. 회사 정보 삭제 (CASCADE로 관련 데이터도 자동 삭제됨)
    const { error: companyError } = await supabase
      .from('companies')
      .delete()
      .eq('user_id', user_id)

    if (companyError) {
      console.error('회사 정보 삭제 오류:', companyError)
    }

    // 2. Auth 사용자 삭제
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id)

    if (authError) {
      console.error('사용자 삭제 오류:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '사용자가 삭제되었습니다' })
  } catch (error) {
    console.error('DELETE /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users - 사용자 비밀번호 변경 (관리자 전용)
 */
export async function PATCH(request: NextRequest) {
  try {
    // 관리자 세션 확인
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, new_password } = body

    if (!user_id || !new_password) {
      return NextResponse.json(
        { error: '사용자 ID와 새 비밀번호가 필요합니다' },
        { status: 400 }
      )
    }

    // 비밀번호 길이 검증
    if (new_password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Supabase Admin API를 사용하여 비밀번호 변경
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    )

    if (updateError) {
      console.error('비밀번호 변경 오류:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다' })
  } catch (error) {
    console.error('PATCH /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

