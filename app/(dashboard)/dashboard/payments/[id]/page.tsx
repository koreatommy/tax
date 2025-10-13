import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, CreditCard, User, Calendar, Calculator } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { decrypt } from '@/lib/utils/encryption'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 지급 내역 조회 (지급대상자 정보 포함)
  const { data: paymentData, error } = await supabase
    .from('payments')
    .select(`
      *,
      payee:payees!inner(
        id,
        name,
        business_type,
        contact,
        bank_name,
        account_number_encrypted
      ),
      company:companies!inner(user_id)
    `)
    .eq('id', id)
    .single()

  if (error || !paymentData) {
    notFound()
  }

  // 권한 확인 (자신의 회사 소속인지)
  if (paymentData.company.user_id !== user.id) {
    notFound()
  }

  // 계좌번호 복호화 (마스킹 처리)
  let accountNumber = '-'
  if (paymentData.payee.account_number_encrypted) {
    try {
      if (paymentData.payee.account_number_encrypted.startsWith('ENCRYPTED_')) {
        accountNumber = paymentData.payee.account_number_encrypted.replace('ENCRYPTED_', '')
      } else if (paymentData.payee.account_number_encrypted.startsWith('ENC_')) {
        accountNumber = paymentData.payee.account_number_encrypted.replace('ENC_', '')
      } else {
        const decrypted = decrypt(paymentData.payee.account_number_encrypted)
        // 계좌번호 마스킹 (뒤 4자리만 마스킹)
        if (decrypted && decrypted.length > 4) {
          accountNumber = decrypted.slice(0, -4) + '****'
        } else {
          accountNumber = decrypted
        }
      }
    } catch (e) {
      accountNumber = '****'
    }
  }

  const payment = {
    ...paymentData,
    payee: {
      ...paymentData.payee,
      account_number_display: accountNumber,
    },
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.PAYMENTS.LIST}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">지급 상세 정보</h1>
            <p className="mt-2 text-sm text-gray-600">
              {payment.payee.name}님에게 지급한 내역입니다
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {payment.receipt_issued ? (
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              영수증 확인
            </Button>
          ) : (
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              영수증 발급
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 지급 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              지급 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">지급일자</label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-lg font-semibold">
                  {format(new Date(payment.payment_date), 'yyyy년 MM월 dd일', { locale: ko })}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">지급 사유</label>
              <p className="mt-1">{payment.payment_reason || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">영수증 발급 상태</label>
              <div className="mt-1">
                {payment.receipt_issued ? (
                  <div className="space-y-1">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      발급완료
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {payment.receipt_issued_at && 
                        format(new Date(payment.receipt_issued_at), 'yyyy-MM-dd HH:mm', { locale: ko })
                      }
                    </p>
                  </div>
                ) : (
                  <Badge variant="secondary">미발급</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 대상자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              지급 대상자
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">성명</label>
              <p className="mt-1 text-lg font-semibold">{payment.payee.name}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">연락처</label>
              <p className="mt-1">{payment.payee.contact || '-'}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-600">계좌정보</label>
              <p className="mt-1">
                {payment.payee.bank_name || '-'} {payment.payee.account_number_display}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <Link href={ROUTES.PAYEES.DETAIL(payment.payee.id)}>
                <Button variant="outline" size="sm" className="w-full">
                  대상자 상세 정보 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 세액 계산 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              원천징수세액 계산 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4">
                <span className="text-lg font-medium text-gray-700">지급액</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payment.payment_amount)}
                </span>
              </div>

              <Separator />

              <div className="space-y-3 py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-700">소득세 (3%)</p>
                    <p className="text-sm text-gray-500">
                      {payment.payment_amount.toLocaleString('ko-KR')} × 3%
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    - {formatCurrency(payment.income_tax)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-700">지방소득세 (0.3%)</p>
                    <p className="text-sm text-gray-500">
                      {payment.payment_amount.toLocaleString('ko-KR')} × 0.3%
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    - {formatCurrency(payment.local_income_tax)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-medium text-gray-700">총 원천징수세액</span>
                <span className="text-xl font-bold text-red-600">
                  - {formatCurrency(payment.total_tax)}
                </span>
              </div>

              <Separator className="border-2" />

              <div className="flex justify-between items-center pt-4 bg-blue-50 -mx-6 px-6 py-4 rounded-lg">
                <span className="text-xl font-bold text-gray-900">실지급액</span>
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(payment.net_amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 등록 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">등록 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            등록일시: {format(new Date(payment.created_at), 'yyyy-MM-dd HH:mm', { locale: ko })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

