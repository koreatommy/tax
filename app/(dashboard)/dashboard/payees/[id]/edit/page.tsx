import { PayeeForm } from '@/components/payees/PayeeForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPayeePage({ params }: PageProps) {
  const { id } = await params
  
  // TODO: Supabase에서 데이터 가져오기
  const payee = {
    id,
    name: '김철수',
    resident_number_encrypted: '900101-1234567',
    address: '서울특별시 강남구 테헤란로 123',
    contact: '010-1234-5678',
    email: 'kim@example.com',
    bank_name: 'KB국민은행',
    account_number_encrypted: '1234-56-7890123',
    business_type: 'FREELANCER',
    company_id: 'temp-company-id',
    contract_start_date: '2024-01-01',
    contract_end_date: '2024-12-31',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: null,
    contract_file_url: null
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.PAYEES.DETAIL(id)}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">지급 대상자 수정</h1>
          <p className="mt-2 text-sm text-gray-600">
            {payee.name}님의 정보를 수정합니다
          </p>
        </div>
      </div>

      {/* 수정 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <PayeeForm payee={payee} />
        </CardContent>
      </Card>
    </div>
  )
}

