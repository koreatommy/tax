'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building, Save, KeyRound } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Company } from '@/types'
import { validateBusinessNumber, formatBusinessNumber } from '@/lib/utils/validators'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    business_number: '',
    company_name: '',
    representative_name: '',
    address: '',
    contact: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
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
    
    // 사업자등록번호 유효성 검증
    if (!validateBusinessNumber(formData.business_number)) {
      toast.error('올바른 사업자등록번호 형식을 입력해주세요 (예: 123-45-67890)')
      return
    }
    
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
    let value = e.target.value
    
    // 사업자등록번호 필드인 경우 포맷팅 적용
    if (e.target.name === 'business_number') {
      // 숫자만 추출
      const numbers = value.replace(/\D/g, '')
      // 10자리까지만 허용
      const limitedNumbers = numbers.slice(0, 10)
      // 포맷팅 적용
      value = formatBusinessNumber(limitedNumbers)
    }
    
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검증
    if (!passwordData.current_password) {
      toast.error('현재 비밀번호를 입력해주세요')
      return
    }

    if (!passwordData.new_password || passwordData.new_password.length < 6) {
      toast.error('새 비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('새 비밀번호가 일치하지 않습니다')
      return
    }

    if (passwordData.current_password === passwordData.new_password) {
      toast.error('새 비밀번호는 현재 비밀번호와 달라야 합니다')
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || '비밀번호 변경 실패')
        return
      }

      toast.success('비밀번호가 변경되었습니다')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error) {
      toast.error('비밀번호 변경 중 오류가 발생했습니다')
      console.error(error)
    } finally {
      setPasswordLoading(false)
    }
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

      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>
            계정의 비밀번호를 변경합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">
                현재 비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                placeholder="현재 비밀번호를 입력하세요"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                required
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new_password">
                새 비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                required
              />
              {passwordData.new_password && passwordData.new_password.length < 6 && (
                <p className="text-sm text-red-600">
                  비밀번호는 최소 6자 이상이어야 합니다
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">
                새 비밀번호 확인 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                required
              />
              {passwordData.new_password && 
               passwordData.confirm_password && 
               passwordData.new_password !== passwordData.confirm_password && (
                <p className="text-sm text-red-600">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={
                  passwordLoading ||
                  !passwordData.current_password ||
                  !passwordData.new_password ||
                  !passwordData.confirm_password ||
                  passwordData.new_password !== passwordData.confirm_password ||
                  passwordData.new_password.length < 6
                }
              >
                <KeyRound className="mr-2 h-4 w-4" />
                {passwordLoading ? '변경 중...' : '비밀번호 변경'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

