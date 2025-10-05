import { PayeeForm } from '@/components/payees/PayeeForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/utils/encryption'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPayeePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 지급 대상자 조회
  const { data: payeeData, error } = await supabase
    .from('payees')
    .select(`
      *,
      company:companies!inner(user_id)
    `)
    .eq('id', id)
    .single()

  if (error || !payeeData) {
    notFound()
  }

  // 권한 확인 (자신의 회사 소속인지)
  if (payeeData.company.user_id !== user.id) {
    notFound()
  }

  // 주민번호 복호화
  let residentNumber = ''
  let accountNumber = null
  
  if (payeeData.resident_number_encrypted?.startsWith('ENCRYPTED_')) {
    residentNumber = payeeData.resident_number_encrypted.replace('ENCRYPTED_', '')
  } else if (payeeData.resident_number_encrypted?.startsWith('ENC_')) {
    residentNumber = payeeData.resident_number_encrypted.replace('ENC_', '')
  } else {
    residentNumber = decrypt(payeeData.resident_number_encrypted)
  }
  
  if (payeeData.account_number_encrypted?.startsWith('ENCRYPTED_')) {
    accountNumber = payeeData.account_number_encrypted.replace('ENCRYPTED_', '')
  } else if (payeeData.account_number_encrypted?.startsWith('ENC_')) {
    accountNumber = payeeData.account_number_encrypted.replace('ENC_', '')
  } else if (payeeData.account_number_encrypted) {
    accountNumber = decrypt(payeeData.account_number_encrypted)
  }

  const payee = {
    ...payeeData,
    resident_number: residentNumber,
    account_number: accountNumber,
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

