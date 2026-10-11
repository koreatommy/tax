import { TaxReportList } from '@/components/tax-report/TaxReportList'

export default function TaxReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">세금신고</h1>
        <p className="mt-2 text-sm text-gray-600">
          대상자별 실지급액 합계를 기간별로 조회합니다 (이름 가나다순)
        </p>
      </div>

      <TaxReportList />
    </div>
  )
}
