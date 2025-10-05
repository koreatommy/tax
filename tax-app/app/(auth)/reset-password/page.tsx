'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        toast.error('비밀번호 재설정 이메일 전송에 실패했습니다.')
        console.error(error)
        return
      }

      setEmailSent(true)
      toast.success('비밀번호 재설정 이메일이 전송되었습니다!')
    } catch (error) {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">이메일 전송 완료</CardTitle>
          <CardDescription>
            비밀번호 재설정 링크를 이메일로 전송했습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>💡 이메일이 오지 않았나요?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>스팸 메일함을 확인해보세요</li>
              <li>이메일 주소가 정확한지 확인하세요</li>
              <li>몇 분 후에 다시 시도해보세요</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setEmailSent(false)}
          >
            다시 보내기
          </Button>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인으로 돌아가기
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
        <CardDescription>
          가입하신 이메일 주소를 입력하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleResetPassword}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '전송 중...' : '재설정 링크 받기'}
          </Button>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인으로 돌아가기
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

