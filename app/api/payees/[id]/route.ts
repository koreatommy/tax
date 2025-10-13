import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/utils/encryption'

/**
 * GET /api/payees/[id] - 지급 대상자 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 지급 대상자 조회
    const { data: payee, error } = await supabase
      .from('payees')
      .select(`
        *,
        company:companies!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (error || !payee) {
      return NextResponse.json({ error: 'Payee not found' }, { status: 404 })
    }

    // 권한 확인 (자신의 회사 소속인지)
    if (payee.company.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 주민번호 복호화 (마스킹 제거)
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
    
    const decryptedPayee = {
      ...payee,
      resident_number: residentNumber,
      account_number: accountNumber,
    }

    return NextResponse.json({ data: decryptedPayee })
  } catch (error) {
    console.error('GET /api/payees/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/payees/[id] - 지급 대상자 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 기존 데이터 조회 및 권한 확인
    const { data: existing, error: fetchError } = await supabase
      .from('payees')
      .select(`
        *,
        company:companies!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Payee not found' }, { status: 404 })
    }

    if (existing.company.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 요청 데이터
    const body = await request.json()
    const {
      name,
      address,
      contact,
      email,
      bank_name,
      account_number,
      business_type,
      contract_start_date,
      contract_end_date,
      contract_file_url,
      is_active,
      notes,
    } = body

    // 계좌번호 암호화 (변경된 경우에만)
    const encryptedAccountNumber = account_number
      ? encrypt(account_number)
      : existing.account_number_encrypted

    // 업데이트
    const { data: payee, error } = await supabase
      .from('payees')
      .update({
        name,
        address,
        contact,
        email,
        bank_name,
        account_number_encrypted: encryptedAccountNumber,
        business_type,
        contract_start_date,
        contract_end_date,
        contract_file_url,
        is_active,
        notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: payee })
  } catch (error) {
    console.error('PUT /api/payees/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/payees/[id] - 지급 대상자 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 기존 데이터 조회 및 권한 확인
    const { data: existing, error: fetchError } = await supabase
      .from('payees')
      .select(`
        *,
        company:companies!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Payee not found' }, { status: 404 })
    }

    if (existing.company.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 삭제 (CASCADE로 관련 데이터도 함께 삭제됨)
    const { error } = await supabase
      .from('payees')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Payee deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/payees/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

