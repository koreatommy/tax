'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navigation = [
  {
    name: '관리자 대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '사용자 관리',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: '회사 관리',
    href: '/admin/companies',
    icon: Building2,
  },
  {
    name: '통계 분석',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: '시스템 설정',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      // 일반 로그아웃
      await supabase.auth.signOut()
      
      // 관리자 세션도 삭제
      await fetch('/api/admin/auth', {
        method: 'DELETE',
      })
      
      toast.success('로그아웃되었습니다')
      router.push('/login')
    } catch (error) {
      toast.error('로그아웃 실패')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="flex w-64 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* 로고 */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">
                관리자 패널
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* 사용자 모드로 돌아가기 */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              사용자 모드로
            </Button>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* 하단 */}
        <div className="border-t border-gray-100 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
