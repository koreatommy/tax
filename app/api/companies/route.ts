import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { validateBusinessNumber } from '@/lib/utils/validators'

/**
 * GET /api/companies - 회사 정보 조회
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // 회사 정보가 없으면 null 반환
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: company })
  } catch (error) {
    console.error('GET /api/companies error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/companies - 회사 정보 등록
 */
export async function POST(request: NextRequest) {
  console.log('POST /api/companies - 요청 시작')
  
  try {
    const body = await request.json()
    console.log('요청 바디:', body)
    
    const {
      business_number,
      company_name,
      representative_name,
      address,
      contact,
      email,
      user_id, // 회원가입 직후 전달받는 user_id
    } = body

    if (!business_number || !company_name || !representative_name) {
      console.error('필수 필드 누락:', { business_number, company_name, representative_name })
      return NextResponse.json(
        { error: 'Missing required fields', details: { business_number: !!business_number, company_name: !!company_name, representative_name: !!representative_name } },
        { status: 400 }
      )
    }

    let userId = user_id
    let supabase

    // user_id가 직접 전달된 경우 (회원가입 직후) Admin 클라이언트 사용
    if (userId) {
      console.log('회원가입 직후 user_id 전달됨, Admin 클라이언트 사용:', userId)
      supabase = createAdminClient()
    } else {
      // 일반적인 경우 인증된 사용자 확인
      console.log('일반 요청, 인증된 사용자 확인')
      supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('인증 에러:', authError)
        return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
      }
      userId = user.id
      console.log('인증된 사용자 ID:', userId)
    }

    // 중복 확인
    console.log('사업자등록번호 중복 확인:', business_number)
    const { data: existing, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .eq('business_number', business_number)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('중복 확인 중 에러:', checkError)
      return NextResponse.json({ error: 'Database error during duplicate check', details: checkError.message }, { status: 500 })
    }

    if (existing) {
      console.log('중복된 사업자등록번호 발견:', existing)
      return NextResponse.json(
        { error: 'Company with this business number already exists' },
        { status: 409 }
      )
    }

    console.log('회사 정보 삽입 시도:', {
      user_id: userId,
      business_number,
      company_name,
      representative_name,
      address,
      contact,
      email,
    })

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        user_id: userId,
        business_number,
        company_name,
        representative_name,
        address,
        contact,
        email,
      })
      .select()
      .single()

    if (error) {
      console.error('Company insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ 
        error: error.message, 
        details: error.details,
        hint: error.hint,
        code: error.code 
      }, { status: 500 })
    }

    console.log('회사 정보 삽입 성공:', company)
    return NextResponse.json({ data: company }, { status: 201 })
  } catch (error) {
    console.error('POST /api/companies error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

/**
 * PUT /api/companies - 회사 정보 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      business_number,
      company_name,
      representative_name,
      address,
      contact,
      email,
    } = body

    // 필수 필드 검증
    if (!business_number || !company_name || !representative_name) {
      return NextResponse.json(
        { error: 'Missing required fields', details: { business_number: !!business_number, company_name: !!company_name, representative_name: !!representative_name } },
        { status: 400 }
      )
    }

    // 사업자등록번호 유효성 검증
    if (!validateBusinessNumber(business_number)) {
      return NextResponse.json(
        { error: 'Invalid business number format' },
        { status: 400 }
      )
    }

    // 현재 회사의 기존 사업자등록번호 조회
    const { data: currentCompany } = await supabase
      .from('companies')
      .select('business_number')
      .eq('user_id', user.id)
      .single()

    // 사업자등록번호가 변경된 경우에만 중복 체크
    if (!currentCompany || currentCompany.business_number !== business_number) {
      // 중복 확인
      const { data: existing, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('business_number', business_number)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
        console.error('중복 확인 중 에러:', checkError)
        return NextResponse.json({ error: 'Database error during duplicate check', details: checkError.message }, { status: 500 })
      }

      if (existing) {
        return NextResponse.json(
          { error: 'Company with this business number already exists' },
          { status: 409 }
        )
      }
    }

    const { data: company, error } = await supabase
      .from('companies')
      .update({
        business_number,
        company_name,
        representative_name,
        address,
        contact,
        email,
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: company })
  } catch (error) {
    console.error('PUT /api/companies error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

