import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { decrypt, maskResidentNumber } from '@/lib/utils/encryption'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getReceiptData(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return null
    }

    const { data: receipt, error } = await supabase
      .from('receipts')
      .select(`
        *,
        payment:payments(*),
        payee:payees(*),
        company:companies!inner(user_id, *)
      `)
      .eq('id', id)
      .single()

    if (error || !receipt) {
      return null
    }

    if (receipt.company.user_id !== user.id) {
      return null
    }

    // 주민번호 복호화 및 마스킹
    let residentNumber = '데이터 없음'
    if (receipt.payee.resident_number_encrypted) {
      try {
        const decrypted = decrypt(receipt.payee.resident_number_encrypted)
        residentNumber = decrypted ? maskResidentNumber(decrypted) : '데이터 없음'
      } catch (error) {
        console.error('Failed to decrypt resident number:', error)
        residentNumber = '데이터 없음'
      }
    }

    const maskedReceipt = {
      ...receipt,
      payee: {
        ...receipt.payee,
        resident_number: residentNumber,
      },
    }

    return maskedReceipt
  } catch (error) {
    console.error('Failed to fetch receipt:', error)
    return null
  }
}

export default async function ReceiptDetailPage({ params }: PageProps) {
  const { id } = await params
  const receipt = await getReceiptData(id)

  if (!receipt) {
    notFound()
  }

  // 영수증 미리보기용 데이터 변환
  const receiptData = {
    receiptId: receipt.id, // 실제 UUID 추가
    receiptNumber: receipt.receipt_number,
    paymentDate: receipt.payment.payment_date,
    payeeName: receipt.payee.name,
    residentNumber: receipt.payee.resident_number,
    address: receipt.payee.address,
    paymentAmount: receipt.payment.payment_amount,
    incomeTax: receipt.payment.income_tax,
    localIncomeTax: receipt.payment.local_income_tax,
    totalTax: receipt.payment.total_tax,
    netAmount: receipt.payment.net_amount,
    paymentReason: receipt.payment.payment_reason,
    companyName: receipt.company.company_name,
    companyRepresentative: receipt.company.representative_name,
    companyBusinessNumber: receipt.company.business_number,
    companyAddress: receipt.company.address,
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.RECEIPTS.LIST}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">원천징수영수증</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            영수증 번호: {receiptData.receiptNumber}
          </p>
        </div>
      </div>

      {/* 영수증 미리보기 */}
      <ReceiptPreview receiptData={receiptData} />
    </div>
  )
}