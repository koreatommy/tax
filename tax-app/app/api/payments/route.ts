import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/utils/tax-calculator'

/**
 * GET /api/payments - 지급 내역 목록 조회
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

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams
    const payeeId = searchParams.get('payee_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const receiptIssued = searchParams.get('receipt_issued')

    let query = supabase
      .from('payments')
      .select(`
        *,
        payee:payees(id, name, business_type)
      `)
      .eq('company_id', company.id)
      .order('payment_date', { ascending: false })

    if (payeeId) query = query.eq('payee_id', payeeId)
    if (startDate) query = query.gte('payment_date', startDate)
    if (endDate) query = query.lte('payment_date', endDate)
    if (receiptIssued !== null) query = query.eq('receipt_issued', receiptIssued === 'true')

    const { data: payments, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('GET /api/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/payments - 신규 지급 등록
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
    const { payee_id, payment_date, payment_amount, payment_reason } = body

    if (!payee_id || !payment_date || !payment_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 세액 자동 계산
    const taxData = calculateTax(payment_amount)

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        company_id: company.id,
        payee_id,
        payment_date,
        payment_amount: taxData.paymentAmount,
        income_tax: taxData.incomeTax,
        local_income_tax: taxData.localIncomeTax,
        total_tax: taxData.totalTax,
        net_amount: taxData.netAmount,
        payment_reason,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: payment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

