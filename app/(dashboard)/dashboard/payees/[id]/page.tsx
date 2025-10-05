import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Trash2, User, CreditCard, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { BUSINESS_TYPES } from '@/types'

// 임시 데이터 (나중에 Supabase에서 가져옴)
const TEMP_PAYEE = {
  id: '1',
  name: '김철수',
  resident_number_encrypted: '900101-1******',
  address: '서울특별시 강남구 테헤란로 123',
  contact: '010-1234-5678',
  email: 'kim@example.com',
  bank_name: 'KB국민은행',
  account_number_encrypted: '1234-56-*******',
  business_type: 'FREELANCER' as const,
  contract_start_date: '2024-01-01',
  contract_end_date: '2024-12-31',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PayeeDetailPage({ params }: PageProps) {
  const { id } = await params
  // TODO: Supabase에서 데이터 가져오기
  const payee = TEMP_PAYEE

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.PAYEES.LIST}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{payee.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              지급 대상자 상세 정보
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={ROUTES.PAYEES.EDIT(id)}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
          </Link>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">성명</label>
              <p className="mt-1 text-lg font-semibold">{payee.name}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">주민등록번호</label>
              <p className="mt-1 font-mono text-sm">{payee.resident_number_encrypted}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">사업자 유형</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {BUSINESS_TYPES[payee.business_type]}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">상태</label>
              <div className="mt-1">
                {payee.is_active ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    활성
                  </Badge>
                ) : (
                  <Badge variant="secondary">비활성</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 연락처 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              연락처 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">주소</label>
              <p className="mt-1">{payee.address || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">연락처</label>
              <p className="mt-1">{payee.contact || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">이메일</label>
              <p className="mt-1">{payee.email || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 계좌 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              계좌 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">은행명</label>
              <p className="mt-1">{payee.bank_name || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">계좌번호</label>
              <p className="mt-1 font-mono text-sm">{payee.account_number_encrypted || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 계약 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              계약 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">계약 시작일</label>
              <p className="mt-1">{payee.contract_start_date || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">계약 종료일</label>
              <p className="mt-1">{payee.contract_end_date || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">등록일</label>
              <p className="mt-1">{new Date(payee.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 지급 이력 (향후 구현) */}
      <Card>
        <CardHeader>
          <CardTitle>지급 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500 py-8">
            지급 내역이 없습니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

