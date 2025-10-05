import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/companies - 전체 회사 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    // 관리자 세션 확인
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let query = supabase
      .from('companies')
      .select(`
        *,
        payees:payees(count),
        payments:payments(count),
        receipts:receipts(count)
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,business_number.ilike.%${search}%`)
    }

    const { data: companies, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: companies })
  } catch (error) {
    console.error('GET /api/admin/companies error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

