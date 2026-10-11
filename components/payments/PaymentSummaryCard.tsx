import { Calculator } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/tax-calculator'

interface PaymentSummaryCardProps {
  totalPaymentAmount: number
  totalTax: number
  totalNetAmount: number
}

const SUMMARY_ITEMS = [
  { key: 'totalPaymentAmount', label: '지급액 합계', color: 'blue' },
  { key: 'totalTax', label: '세액 합계', color: 'red' },
  { key: 'totalNetAmount', label: '실지급액 합계', color: 'green' },
] as const

const COLOR_CLASSES = {
  blue: {
    box: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
  },
  red: {
    box: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
  },
  green: {
    box: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    text: 'text-green-600 dark:text-green-400',
  },
}

export function PaymentSummaryCard(summary: PaymentSummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            검색 결과 합계
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUMMARY_ITEMS.map(({ key, label, color }) => (
            <div key={key} className={`p-4 rounded-lg border ${COLOR_CLASSES[color].box}`}>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
              <div className={`text-2xl font-bold font-mono ${COLOR_CLASSES[color].text}`}>
                {formatCurrency(summary[key])}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
