import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/memos/[id]
 * 메모 수정
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 회사 정보 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: '회사 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 메모 존재 여부 및 권한 확인
    const { data: existingMemo, error: fetchError } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (fetchError || !existingMemo) {
      return NextResponse.json(
        { error: '메모를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { content } = body

    // 유효성 검사
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '메모 내용을 입력해주세요' },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: '메모는 500자 이내로 입력해주세요' },
        { status: 400 }
      )
    }

    // 메모 수정
    const { data: memo, error: updateError } = await supabase
      .from('memos')
      .update({
        content: content.trim(),
      })
      .eq('id', id)
      .eq('company_id', company.id)
      .select()
      .single()

    if (updateError) {
      console.error('메모 수정 오류:', updateError)
      return NextResponse.json(
        { error: '메모 수정에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: memo })
  } catch (error) {
    console.error('메모 수정 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/memos/[id]
 * 메모 삭제
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 회사 정보 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: '회사 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 메모 삭제
    const { error: deleteError } = await supabase
      .from('memos')
      .delete()
      .eq('id', id)
      .eq('company_id', company.id)

    if (deleteError) {
      console.error('메모 삭제 오류:', deleteError)
      return NextResponse.json(
        { error: '메모 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (error) {
    console.error('메모 삭제 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

