import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/stats - 전체 플랫폼 통계 (관리자 전용)
 */
export async function GET() {
  try {
    // 관리자 세션 확인
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 전체 통계 조회
    const [
      { count: totalCompanies },
      { count: totalPayees },
      { count: totalPayments },
      { count: totalReceipts },
      { data: payments }
    ] = await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('payees').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      supabase.from('receipts').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('payment_amount, total_tax, created_at')
    ])

    // 총 금액 계산
    const totalAmount = payments?.reduce((sum, p) => sum + parseFloat(p.payment_amount || '0'), 0) || 0
    const totalTax = payments?.reduce((sum, p) => sum + parseFloat(p.total_tax || '0'), 0) || 0

    // 최근 30일 가입자 수
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: recentCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    return NextResponse.json({
      data: {
        totalCompanies: totalCompanies || 0,
        totalPayees: totalPayees || 0,
        totalPayments: totalPayments || 0,
        totalReceipts: totalReceipts || 0,
        totalAmount,
        totalTax,
        recentCompanies: recentCompanies || 0,
      }
    })
  } catch (error) {
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

