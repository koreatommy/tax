'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EmailSendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptId: string
  payeeName: string
  payeeEmail?: string // 지급대상자 이메일 추가
}

export function EmailSendDialog({ open, onOpenChange, receiptId, payeeName, payeeEmail }: EmailSendDialogProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 다이얼로그가 열릴 때 지급대상자 이메일로 초기화
  useEffect(() => {
    if (open && payeeEmail) {
      setEmail(payeeEmail)
    } else if (open) {
      setEmail('')
    }
  }, [open, payeeEmail])

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error('이메일 주소를 입력해주세요')
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('올바른 이메일 형식을 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/receipts/${receiptId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('이메일이 성공적으로 발송되었습니다!')
        setEmail('')
        onOpenChange(false)
      } else {
        toast.error(result.error || '이메일 발송에 실패했습니다')
      }
    } catch (error) {
      console.error('Email sending error:', error)
      toast.error('이메일 발송 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmail('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Mail className="h-5 w-5" />
            이메일 발송
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-gray-100">{payeeName}</strong>님께 원천징수영수증을 이메일로 발송합니다.
            {payeeEmail && (
              <span className="block mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                📧 등록된 이메일: <span className="font-medium">{payeeEmail}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">이메일 주소</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendEmail()
                }
              }}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            {payeeEmail && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">💡</span>
                  등록된 이메일 주소가 자동으로 입력되었습니다. 필요시 변경하실 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            취소
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                발송
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}