import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptStoredValue } from '@/lib/utils/encryption'
import type { PayeeAccount } from '@/types/payee-account'

/**
 * GET /api/payees/[id]/account - 지급 대상자 계좌 정보 조회 (주민번호 제외)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const { data: payee, error } = await supabase
      .from('payees')
      .select('name, bank_name, account_number_encrypted')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (error || !payee) {
      return NextResponse.json({ error: 'Payee not found' }, { status: 404 })
    }

    const account: PayeeAccount = {
      name: payee.name,
      bank_name: payee.bank_name,
      account_number: decryptStoredValue(payee.account_number_encrypted),
    }

    return NextResponse.json({ data: account })
  } catch (error) {
    console.error('GET /api/payees/[id]/account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
