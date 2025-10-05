'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Mail } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { downloadReceiptPDF } from '@/lib/pdf/receipt-generator'
import { EmailSendDialog } from './EmailSendDialog'
import { toast } from 'sonner'

interface ReceiptPreviewProps {
  receiptData: {
    receiptNumber: string
    paymentDate: string
    payeeName: string
    residentNumber: string
    address?: string
    paymentAmount: number
    incomeTax: number
    localIncomeTax: number
    totalTax: number
    netAmount: number
    paymentReason?: string
    companyName: string
    companyRepresentative: string
    companyBusinessNumber: string
    companyAddress?: string
  }
}

export function ReceiptPreview({ receiptData }: ReceiptPreviewProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const handleDownload = () => {
    try {
      downloadReceiptPDF(receiptData)
      toast.success('영수증이 다운로드되었습니다')
    } catch (error) {
      toast.error('PDF 생성 중 오류가 발생했습니다')
      console.error(error)
    }
  }

  const handleSendEmail = () => {
    setEmailDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          PDF 다운로드
        </Button>
        <Button variant="outline" onClick={handleSendEmail}>
          <Mail className="mr-2 h-4 w-4" />
          이메일 발송
        </Button>
      </div>

      {/* 영수증 미리보기 */}
      <Card className="max-w-3xl">
        <CardContent className="p-8 space-y-6">
          {/* 제목 */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">사업소득 원천징수영수증</h2>
            <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>영수증 번호: {receiptData.receiptNumber}</span>
              <span>발급일자: {format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}</span>
            </div>
          </div>

          {/* 원천징수의무자 */}
          <div>
            <h3 className="font-bold text-lg border-b pb-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">원천징수의무자</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">상호(법인명)</span>
                <span className="col-span-2 font-medium text-gray-900 dark:text-gray-100">{receiptData.companyName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">대표자</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">{receiptData.companyRepresentative}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">사업자등록번호</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">{receiptData.companyBusinessNumber}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">주소</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">{receiptData.companyAddress || '-'}</span>
              </div>
            </div>
          </div>

          {/* 소득자 */}
          <div>
            <h3 className="font-bold text-lg border-b pb-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">소득자</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">성명</span>
                <span className="col-span-2 font-medium text-gray-900 dark:text-gray-100">{receiptData.payeeName}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">주민등록번호</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">{receiptData.residentNumber}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">주소</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">{receiptData.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* 지급 내역 */}
          <div>
            <h3 className="font-bold text-lg border-b pb-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">지급 내역</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">지급일자</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">
                  {format(new Date(receiptData.paymentDate), 'yyyy년 MM월 dd일', { locale: ko })}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600 dark:text-gray-400">지급 사유</span>
                <span className="col-span-2 text-gray-900 dark:text-gray-100">{receiptData.paymentReason || '-'}</span>
              </div>
            </div>
          </div>

          {/* 세액 계산 */}
          <div>
            <h3 className="font-bold text-lg border-b pb-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">원천징수세액 계산</h3>
            <div className="mt-3">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-gray-600 dark:text-gray-400">지급액</td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(receiptData.paymentAmount)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-gray-600 dark:text-gray-400">소득세 (3%)</td>
                    <td className="py-3 text-right text-red-600 dark:text-red-400">
                      {formatCurrency(receiptData.incomeTax)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-gray-600 dark:text-gray-400">지방소득세 (0.3%)</td>
                    <td className="py-3 text-right text-red-600 dark:text-red-400">
                      {formatCurrency(receiptData.localIncomeTax)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-gray-600 dark:text-gray-400">총 원천징수세액</td>
                    <td className="py-3 text-right font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(receiptData.totalTax)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <td className="py-4 text-lg font-bold text-gray-900 dark:text-gray-100">실지급액</td>
                    <td className="py-4 text-right text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(receiptData.netAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

             {/* 하단 안내문 */}
             <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
               본 영수증은 소득세법에 의거하여 발급되었습니다.
             </div>
           </CardContent>
         </Card>

         {/* 이메일 발송 다이얼로그 */}
         <EmailSendDialog
           open={emailDialogOpen}
           onOpenChange={setEmailDialogOpen}
           receiptId={receiptData.receiptNumber}
           payeeName={receiptData.payeeName}
         />
       </div>
     )
   }

