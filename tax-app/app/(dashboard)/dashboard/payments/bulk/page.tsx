import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Upload, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function BulkPaymentPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.PAYMENTS.LIST}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">일괄 지급 등록</h1>
          <p className="mt-2 text-sm text-gray-600">
            엑셀 파일을 업로드하여 여러 건의 지급을 한 번에 등록할 수 있습니다
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 템플릿 다운로드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              1단계: 템플릿 다운로드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              먼저 엑셀 템플릿을 다운로드하여 지급 정보를 입력하세요.
            </p>
            
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet className="h-12 w-12 text-green-600" />
                <div className="text-center">
                  <p className="font-medium">지급_일괄등록_템플릿.xlsx</p>
                  <p className="text-sm text-gray-500">엑셀 템플릿 파일</p>
                </div>
                <Button variant="outline" className="mt-2">
                  <Download className="mr-2 h-4 w-4" />
                  템플릿 다운로드
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium">템플릿 작성 가이드:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>대상자명: 등록된 대상자의 이름 정확히 입력</li>
                <li>지급일자: YYYY-MM-DD 형식 (예: 2024-10-15)</li>
                <li>지급액: 숫자만 입력 (콤마 제외)</li>
                <li>지급사유: 선택사항</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 파일 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              2단계: 파일 업로드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              작성한 엑셀 파일을 업로드하세요.
            </p>
            
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <p className="font-medium text-gray-700">
                    파일을 드래그하여 놓거나 클릭하여 선택
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    .xlsx, .xls 파일 지원
                  </p>
                </div>
                <Button className="mt-2">
                  파일 선택
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800 font-medium">⚠️ 주의사항</p>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>업로드 전 데이터를 꼭 확인하세요</li>
                <li>대상자는 사전에 등록되어 있어야 합니다</li>
                <li>최대 100건까지 한 번에 등록 가능</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 미리보기 영역 (향후 구현) */}
      <Card>
        <CardHeader>
          <CardTitle>3단계: 데이터 확인 및 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>파일을 업로드하면 데이터를 확인할 수 있습니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

