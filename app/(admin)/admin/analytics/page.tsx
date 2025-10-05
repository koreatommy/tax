export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">통계 분석</h1>
        <p className="mt-1 text-sm text-gray-600">상세한 통계와 분석 데이터를 확인합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">통계 분석 (준비 중)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>차트 및 분석 기능이 곧 추가될 예정입니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
