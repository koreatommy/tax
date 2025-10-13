import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/memos
 * 메모 목록 조회 (페이징 포함)
 */
export async function GET(request: NextRequest) {
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

    // 페이징 파라미터
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    const offset = (page - 1) * limit

    // 전체 개수 조회
    const { count, error: countError } = await supabase
      .from('memos')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    if (countError) {
      return NextResponse.json(
        { error: '메모 개수 조회 실패' },
        { status: 500 }
      )
    }

    // 메모 목록 조회
    const { data: memos, error: memosError } = await supabase
      .from('memos')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (memosError) {
      return NextResponse.json(
        { error: '메모 조회 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: memos,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('메모 조회 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/memos
 * 새 메모 생성
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

    // 메모 생성
    const { data: memo, error: insertError } = await supabase
      .from('memos')
      .insert({
        company_id: company.id,
        content: content.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('메모 생성 오류:', insertError)
      return NextResponse.json(
        { error: '메모 생성에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: memo }, { status: 201 })
  } catch (error) {
    console.error('메모 생성 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

