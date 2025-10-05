import { ReceiptList } from '@/components/receipts/ReceiptList'

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">원천징수영수증</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          발급된 영수증을 조회하고 PDF로 다운로드할 수 있습니다
        </p>
      </div>

      <ReceiptList />
    </div>
  )
}
