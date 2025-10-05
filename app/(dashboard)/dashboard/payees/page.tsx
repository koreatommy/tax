import { PayeeList } from '@/components/payees/PayeeList'

export default function PayeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">지급 대상자 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          프리랜서, 강사, 외주직원 등의 정보를 관리합니다
        </p>
      </div>

      <PayeeList />
    </div>
  )
}
