import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/receipts - 영수증 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
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

    const { data: receipts, error } = await supabase
      .from('receipts')
      .select(`
        *,
        payment:payments(
          payment_date,
          payment_amount,
          net_amount,
          payment_reason
        ),
        payee:payees(name, business_type)
      `)
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: receipts })
  } catch (error) {
    console.error('GET /api/receipts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/receipts - 영수증 생성
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { payment_id } = body

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Missing required field: payment_id' },
        { status: 400 }
      )
    }

    // 지급 내역 조회
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, payee:payees(*)')
      .eq('id', payment_id)
      .eq('company_id', company.id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // 영수증 번호 생성
    const { data: receiptNumberData } = await supabase
      .rpc('generate_receipt_number')

    const receiptNumber = receiptNumberData || `RCP-${Date.now()}`

    // 영수증 생성
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert({
        payment_id,
        payee_id: payment.payee_id,
        company_id: company.id,
        receipt_number: receiptNumber,
        issued_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 지급 내역 업데이트
    await supabase
      .from('payments')
      .update({
        receipt_issued: true,
        receipt_issued_at: new Date().toISOString(),
      })
      .eq('id', payment_id)

    return NextResponse.json({ data: receipt }, { status: 201 })
  } catch (error) {
    console.error('POST /api/receipts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

