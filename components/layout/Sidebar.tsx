'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText,
  ClipboardList,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants'

const navigation = [
  {
    name: '대시보드',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: '지급 대상자',
    href: ROUTES.PAYEES.LIST,
    icon: Users,
  },
  {
    name: '지급 관리',
    href: ROUTES.PAYMENTS.LIST,
    icon: CreditCard,
  },
  {
    name: '세금신고',
    href: ROUTES.TAX_REPORTS,
    icon: ClipboardList,
  },
  {
    name: '원천징수영수증',
    href: ROUTES.RECEIPTS.LIST,
    icon: FileText,
  },
  {
    name: '설정',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

interface SidebarProps {
  onLinkClick?: () => void
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <aside className="flex h-full w-full flex-col bg-white dark:bg-gray-900">
      {/* 로고 */}
      <div className="flex h-16 items-center border-b border-gray-100 dark:border-gray-800 px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">
              원천징수 관리
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tax System</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon className={cn(
                'h-5 w-5',
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* 하단 정보 */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">💡 도움말</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            지급액을 입력하면 세액(3.3%)이 자동으로 계산됩니다.
          </p>
        </div>
      </div>
    </aside>
  )
}
