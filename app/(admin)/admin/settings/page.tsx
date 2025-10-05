export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
        <p className="mt-1 text-sm text-gray-600">시스템 설정을 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">시스템 설정 (준비 중)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>시스템 설정 기능이 곧 추가될 예정입니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
