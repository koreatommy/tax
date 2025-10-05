'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Company } from '@/types'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    business_number: '',
    company_name: '',
    representative_name: '',
    address: '',
    contact: '',
    email: '',
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/companies')
      const result = await res.json()
      if (result.data) {
        setCompany(result.data)
        setFormData(result.data)
      }
    } catch (error) {
      console.error('회사 정보 조회 실패:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = '/api/companies'
      const method = company ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || '저장 실패')
        return
      }

      toast.success(company ? '회사 정보가 수정되었습니다' : '회사 정보가 등록되었습니다')
      setCompany(result.data)
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="mt-2 text-sm text-gray-600">
          회사 정보를 등록하고 관리합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            회사 정보
          </CardTitle>
          <CardDescription>
            원천징수영수증에 표시될 회사 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_number">
                  사업자등록번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="business_number"
                  name="business_number"
                  placeholder="000-00-00000"
                  value={formData.business_number}
                  onChange={handleChange}
                  required
                  disabled={!!company}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  상호(법인명) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  placeholder="(주)테스트컴퍼니"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="representative_name">
                대표자명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="representative_name"
                name="representative_name"
                placeholder="홍길동"
                value={formData.representative_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">사업장 주소</Label>
              <Input
                id="address"
                name="address"
                placeholder="서울특별시 강남구 테헤란로 123"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact">연락처</Label>
                <Input
                  id="contact"
                  name="contact"
                  placeholder="02-1234-5678"
                  value={formData.contact}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? '저장 중...' : company ? '수정' : '등록'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

