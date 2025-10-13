import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Trash2, User, CreditCard, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/utils/encryption'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PayeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
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
    notFound()
  }

  // 권한 확인 (자신의 회사 소속인지)
  if (payee.company.user_id !== user.id) {
    notFound()
  }

  // 주민번호 복호화
  let residentNumber = ''
  let accountNumber = null
  
  if (payee.resident_number_encrypted?.startsWith('ENCRYPTED_')) {
    residentNumber = payee.resident_number_encrypted.replace('ENCRYPTED_', '')
  } else if (payee.resident_number_encrypted?.startsWith('ENC_')) {
    residentNumber = payee.resident_number_encrypted.replace('ENC_', '')
  } else {
    residentNumber = decrypt(payee.resident_number_encrypted)
  }
  
  if (payee.account_number_encrypted?.startsWith('ENCRYPTED_')) {
    accountNumber = payee.account_number_encrypted.replace('ENCRYPTED_', '')
  } else if (payee.account_number_encrypted?.startsWith('ENC_')) {
    accountNumber = payee.account_number_encrypted.replace('ENC_', '')
  } else if (payee.account_number_encrypted) {
    accountNumber = decrypt(payee.account_number_encrypted)
  }

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
              <p className="mt-1 font-mono text-sm">{residentNumber}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">사업자 유형</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {payee.business_type}
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
              <p className="mt-1 font-mono text-sm">{accountNumber || '-'}</p>
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

