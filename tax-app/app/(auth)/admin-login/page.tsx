'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('관리자 인증 성공!')
        router.push('/admin/dashboard')
      } else {
        toast.error(data.error || '패스워드가 올바르지 않습니다')
      }
    } catch (error) {
      toast.error('인증 중 오류가 발생했습니다')
      console.error('Admin auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 뒤로가기 */}
      <div className="text-left">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>

      {/* 로고 및 제목 */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h2 className="mt-3 text-2xl font-bold text-gray-900">
          관리자 인증
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          관리자 패널에 접근하려면 패스워드를 입력하세요
        </p>
      </div>

      {/* 로그인 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">관리자 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                관리자 패스워드
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="패스워드를 입력하세요"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? '인증 중...' : '관리자 패널 접근'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>주의:</strong> 관리자 패널은 시스템 전체 데이터에 접근할 수 있는 권한을 제공합니다.
              권한이 없는 사용자는 접근하지 마세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
