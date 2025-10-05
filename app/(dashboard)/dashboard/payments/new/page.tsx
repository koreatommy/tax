import { PaymentForm } from '@/components/payments/PaymentForm'

export default function NewPaymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">신규 지급 등록</h1>
        <p className="mt-2 text-sm text-gray-600">
          지급 정보를 입력하면 세액이 자동으로 계산됩니다 (3.3%)
        </p>
      </div>

      <PaymentForm />
    </div>
  )
}
