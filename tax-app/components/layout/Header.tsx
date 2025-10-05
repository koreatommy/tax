'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Search, User, LogOut, Settings, Shield, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('로그아웃 실패')
        return
      }
      toast.success('로그아웃되었습니다')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다')
      console.error(error)
    }
  }

  const handleAdminAccess = () => {
    router.push('/admin-login')
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:px-6">
      {/* 좌측 영역 */}
      <div className="flex items-center gap-3">
        {/* 모바일 햄버거 메뉴 */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>

        {/* 제목 */}
        {title && (
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        )}
      </div>

      {/* 우측 메뉴 */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* 검색 */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="검색..."
            className="w-64 pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* 테마 토글 */}
        <ThemeToggle />

        {/* 알림 */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Button>

        {/* 사용자 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors">
                <User className="h-4 w-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-medium">내 계정</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail || '로딩 중...'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                설정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAdminAccess} className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-600 dark:text-purple-400">관리자 패널</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 dark:text-red-400 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
