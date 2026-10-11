'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { usePayeeAccount } from '@/hooks/use-payee-account'

export interface PayeeAccountTarget {
  payeeId: string
  payeeName: string
  paymentDate: string
  netAmount: number
}

interface PayeeAccountDialogProps {
  target: PayeeAccountTarget | null
  onClose: () => void
}

export function PayeeAccountDialog({ target, onClose }: PayeeAccountDialogProps) {
  const { account, loading, error } = usePayeeAccount(target?.payeeId ?? null)

  const renderAccountValue = (value: string | null | undefined) => {
    if (loading) return <span className="text-gray-400">불러오는 중...</span>
    if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>
    return value || <span className="text-gray-400">미등록</span>
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>지급 계좌 정보</DialogTitle>
          <DialogDescription>이체 전 계좌 정보를 확인하세요.</DialogDescription>
        </DialogHeader>

        <dl className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
          <InfoRow label="지급일자">
            {target && format(new Date(target.paymentDate), 'yyyy-MM-dd', { locale: ko })}
          </InfoRow>
          <InfoRow label="이름">{target?.payeeName}</InfoRow>
          <InfoRow label="은행">{renderAccountValue(account?.bank_name)}</InfoRow>
          <InfoRow label="계좌번호">
            <span className="font-mono">{renderAccountValue(account?.account_number)}</span>
          </InfoRow>
          <InfoRow label="실지급액">
            <span className="font-mono font-semibold text-green-600 dark:text-green-400">
              {target && formatCurrency(target.netAmount)}
            </span>
          </InfoRow>
        </dl>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="text-right font-medium text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  )
}
