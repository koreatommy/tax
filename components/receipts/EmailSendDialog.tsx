'use client'

import { useState } from 'react'
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
}

export function EmailSendDialog({ open, onOpenChange, receiptId, payeeName }: EmailSendDialogProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 발송
          </DialogTitle>
          <DialogDescription>
            <strong>{payeeName}</strong>님께 원천징수영수증을 이메일로 발송합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일 주소</Label>
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
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="min-w-[100px]"
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
