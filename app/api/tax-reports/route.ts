import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptStoredValue } from '@/lib/utils/encryption'
import { aggregateByPayee, getPeriodRange } from '@/lib/tax-report/aggregate'
import type { TaxReportResponse } from '@/types/tax-report'

/**
 * GET /api/tax-reports?year=2026&month=3 - 대상자별 실지급액 합계 (month 생략 시 연간)
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

    const searchParams = request.nextUrl.searchParams
    const year = Number(searchParams.get('year') ?? new Date().getFullYear())
    const monthParam = searchParams.get('month')
    const month = monthParam ? Number(monthParam) : null

    if (!Number.isInteger(year) || (month !== null && !(Number.isInteger(month) && month >= 1 && month <= 12))) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 })
    }

    const { start, end } = getPeriodRange(year, month)

    const [paymentsResult, datesResult] = await Promise.all([
      supabase
        .from('payments')
        .select('payee_id, net_amount, payee:payees(name, resident_number_encrypted)')
        .eq('company_id', company.id)
        .gte('payment_date', start)
        .lt('payment_date', end),
      supabase
        .from('payments')
        .select('payment_date')
        .eq('company_id', company.id),
    ])

    if (paymentsResult.error || datesResult.error) {
      const message = paymentsResult.error?.message ?? datesResult.error?.message
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const payments = paymentsResult.data.map((payment) => {
      const payee = Array.isArray(payment.payee) ? payment.payee[0] : payment.payee
      return {
        payee_id: payment.payee_id,
        net_amount: payment.net_amount,
        payee: payee
          ? { name: payee.name, resident_number: decryptStoredValue(payee.resident_number_encrypted) }
          : null,
      }
    })

    const years = [...new Set(datesResult.data.map((p) => Number(p.payment_date.slice(0, 4))))]
      .sort((a, b) => b - a)

    const response: TaxReportResponse = { rows: aggregateByPayee(payments), years }
    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('GET /api/tax-reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
