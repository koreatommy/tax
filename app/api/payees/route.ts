import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/utils/encryption'

/**
 * GET /api/payees - 지급 대상자 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 사용자의 회사 ID 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('is_active')
    const businessType = searchParams.get('business_type')
    const search = searchParams.get('search')

    // 지급 대상자 목록 조회
    let query = supabase
      .from('payees')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    // 필터링
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    if (businessType) {
      query = query.eq('business_type', businessType)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: payees, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 주민번호 복호화 처리
    const decryptedPayees = payees?.map(payee => {
      let residentNumber = ''
      let accountNumber = null
      
      // ENCRYPTED_ 접두사가 있는 경우 (새 시드 데이터) - 접두사 제거하고 사용
      if (payee.resident_number_encrypted?.startsWith('ENCRYPTED_')) {
        residentNumber = payee.resident_number_encrypted.replace('ENCRYPTED_', '')
      } else if (payee.resident_number_encrypted?.startsWith('ENC_')) {
        residentNumber = payee.resident_number_encrypted.replace('ENC_', '')
      } else {
        // 실제 암호화된 데이터 - 복호화
        residentNumber = decrypt(payee.resident_number_encrypted)
      }
      
      // 계좌번호도 동일하게 처리
      if (payee.account_number_encrypted?.startsWith('ENCRYPTED_')) {
        accountNumber = payee.account_number_encrypted.replace('ENCRYPTED_', '')
      } else if (payee.account_number_encrypted?.startsWith('ENC_')) {
        accountNumber = payee.account_number_encrypted.replace('ENC_', '')
      } else if (payee.account_number_encrypted) {
        accountNumber = decrypt(payee.account_number_encrypted)
      }
      
      return {
        ...payee,
        resident_number: residentNumber,
        account_number: accountNumber,
      }
    }) || []

    return NextResponse.json({ data: decryptedPayees })
  } catch (error) {
    console.error('GET /api/payees error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/payees - 지급 대상자 신규 등록
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 사용자의 회사 ID 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // 요청 데이터
    const body = await request.json()
    const {
      name,
      resident_number,
      address,
      contact,
      email,
      bank_name,
      account_number,
      business_type,
      contract_start_date,
      contract_end_date,
      contract_file_url,
      notes,
    } = body

    // 필수 필드 검증
    if (!name || !resident_number || !business_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, resident_number, business_type' },
        { status: 400 }
      )
    }

    // 주민번호 암호화
    const encryptedResidentNumber = encrypt(resident_number)
    const encryptedAccountNumber = account_number ? encrypt(account_number) : null

    // 중복 확인
    const { data: existing } = await supabase
      .from('payees')
      .select('id')
      .eq('company_id', company.id)
      .eq('resident_number_encrypted', encryptedResidentNumber)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Payee with this resident number already exists' },
        { status: 409 }
      )
    }

    // 신규 등록
    const { data: payee, error } = await supabase
      .from('payees')
      .insert({
        company_id: company.id,
        name,
        resident_number_encrypted: encryptedResidentNumber,
        address,
        contact,
        email,
        bank_name,
        account_number_encrypted: encryptedAccountNumber,
        business_type,
        contract_start_date,
        contract_end_date,
        contract_file_url,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: payee }, { status: 201 })
  } catch (error) {
    console.error('POST /api/payees error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

