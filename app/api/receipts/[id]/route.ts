import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt, maskResidentNumber } from '@/lib/utils/encryption'

/**
 * GET /api/receipts/[id] - 영수증 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: receipt, error } = await supabase
      .from('receipts')
      .select(`
        *,
        payment:payments(*),
        payee:payees(*),
        company:companies!inner(user_id, *)
      `)
      .eq('id', id)
      .single()

    if (error || !receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    if (receipt.company.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 주민번호 복호화 및 마스킹
    const maskedReceipt = {
      ...receipt,
      payee: {
        ...receipt.payee,
        resident_number: maskResidentNumber(decrypt(receipt.payee.resident_number_encrypted)),
      },
    }

    return NextResponse.json({ data: maskedReceipt })
  } catch (error) {
    console.error('GET /api/receipts/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

