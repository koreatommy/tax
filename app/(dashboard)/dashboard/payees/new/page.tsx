import { PayeeForm } from '@/components/payees/PayeeForm'

export default function NewPayeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">신규 대상자 등록</h1>
        <p className="mt-2 text-sm text-gray-600">
          새로운 지급 대상자를 등록합니다
        </p>
      </div>

      <PayeeForm />
    </div>
  )
}
