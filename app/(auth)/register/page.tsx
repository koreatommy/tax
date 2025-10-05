'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessNumber: '',
    representativeName: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    // 비밀번호 강도 확인
    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      // 1. 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.companyName,
          },
          emailRedirectTo: `${window.location.origin}/login`, // 이메일 확인 후 로그인 페이지로 리다이렉트
        },
      })

      if (authError) {
        // Supabase 에러 메시지를 사용자 친화적으로 변환
        let errorMessage = authError.message
        if (errorMessage.includes('invalid')) {
          errorMessage = '유효하지 않은 이메일 주소입니다. 실제 이메일 주소를 사용해주세요.'
        } else if (errorMessage.includes('already registered')) {
          errorMessage = '이미 등록된 이메일입니다.'
        }
        toast.error(errorMessage)
        return
      }

      console.log('회원가입 완료:', authData)
      console.log('사용자 ID:', authData.user?.id)
      console.log('세션:', authData.session)

      if (!authData.user) {
        toast.error('회원가입에 실패했습니다. 다시 시도해주세요.')
        return
      }

      // 이메일 확인이 필요한 경우 처리
      if (!authData.session) {
        console.log('세션이 없습니다. 이메일 확인이 필요합니다.')
        toast.success('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.')
        
        // 이메일 확인 안내 메시지와 함께 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        // 이메일 확인이 필요하지 않은 경우 (즉시 세션 생성됨)
        console.log('이메일 확인 없이 즉시 로그인 완료')
        
        // 회사 정보 저장 로직은 로그인 후 설정 페이지에서 처리
        toast.success('회원가입이 완료되었습니다! 로그인 후 설정에서 회사 정보를 등록해주세요.')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (error) {
      toast.error('회원가입 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">회원가입</CardTitle>
        <CardDescription>
          새 계정을 만들어 원천징수 관리를 시작하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">회사명</Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="(주)테스트컴퍼니"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessNumber">사업자등록번호</Label>
            <Input
              id="businessNumber"
              name="businessNumber"
              type="text"
              placeholder="1234567890 (10자리)"
              value={formData.businessNumber}
              onChange={handleChange}
              required
              maxLength={10}
              pattern="[0-9]{10}"
            />
            <p className="text-xs text-gray-500">숫자 10자리 입력</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="representativeName">대표자명</Label>
            <Input
              id="representativeName"
              name="representativeName"
              type="text"
              placeholder="홍길동"
              value={formData.representativeName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <p className="text-xs text-gray-500">최소 6자 이상</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '가입 처리 중...' : '회원가입'}
          </Button>
          <div className="text-sm text-center text-gray-600 dark:text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              로그인
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

