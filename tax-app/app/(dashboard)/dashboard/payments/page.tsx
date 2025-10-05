import { PaymentList } from '@/components/payments/PaymentList'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">지급 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          지급 내역을 등록하고 관리합니다 (세액 자동 계산 3.3%)
        </p>
      </div>

      <PaymentList />
    </div>
  )
}
