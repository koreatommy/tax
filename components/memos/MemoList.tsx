'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Trash2, Edit2, Check, X, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Memo } from '@/types/database'

interface MemoListResponse {
  data: Memo[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function MemoList() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(false)
  const [newMemo, setNewMemo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  })

  // 메모 목록 조회
  const fetchMemos = async (currentPage: number = page) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/memos?page=${currentPage}&limit=5`)
      
      if (!res.ok) {
        throw new Error('메모 조회 실패')
      }

      const result: MemoListResponse = await res.json()
      setMemos(result.data)
      setPagination(result.pagination)
    } catch (error) {
      console.error('메모 조회 오류:', error)
      toast.error('메모를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemos()
  }, [])

  // 메모 추가
  const handleAddMemo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMemo.trim()) {
      toast.error('메모 내용을 입력해주세요')
      return
    }

    if (newMemo.length > 500) {
      toast.error('메모는 500자 이내로 입력해주세요')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMemo }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '메모 추가 실패')
      }

      toast.success('메모가 추가되었습니다')
      setNewMemo('')
      await fetchMemos(1) // 첫 페이지로 이동
      setPage(1)
    } catch (error: any) {
      console.error('메모 추가 오류:', error)
      toast.error(error.message || '메모 추가에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 메모 수정 시작
  const handleStartEdit = (memo: Memo) => {
    setEditingId(memo.id)
    setEditContent(memo.content)
  }

  // 메모 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  // 메모 수정 완료
  const handleUpdateMemo = async (id: string) => {
    if (!editContent.trim()) {
      toast.error('메모 내용을 입력해주세요')
      return
    }

    if (editContent.length > 500) {
      toast.error('메모는 500자 이내로 입력해주세요')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/memos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '메모 수정 실패')
      }

      toast.success('메모가 수정되었습니다')
      setEditingId(null)
      setEditContent('')
      await fetchMemos()
    } catch (error: any) {
      console.error('메모 수정 오류:', error)
      toast.error(error.message || '메모 수정에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 메모 삭제
  const handleDeleteMemo = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '메모 삭제 실패')
      }

      toast.success('메모가 삭제되었습니다')
      
      // 현재 페이지에 메모가 1개만 남아있고, 마지막 페이지가 아니면 이전 페이지로
      const newPage = memos.length === 1 && page > 1 ? page - 1 : page
      await fetchMemos(newPage)
      setPage(newPage)
    } catch (error: any) {
      console.error('메모 삭제 오류:', error)
      toast.error(error.message || '메모 삭제에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 페이지 변경
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPage(newPage)
    await fetchMemos(newPage)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          메모
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 메모 추가 폼 */}
        <form onSubmit={handleAddMemo} className="flex gap-2">
          <Input
            placeholder="메모를 입력하세요 (최대 500자)"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            maxLength={500}
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            추가
          </Button>
        </form>

        {/* 메모 목록 */}
        <div className="space-y-2">
          {loading && memos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              로딩 중...
            </div>
          ) : memos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              메모가 없습니다. 첫 메모를 작성해보세요!
            </div>
          ) : (
            memos.map((memo) => (
              <div
                key={memo.id}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {editingId === memo.id ? (
                  // 수정 모드
                  <div className="space-y-2">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      maxLength={500}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateMemo(memo.id)}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words text-gray-900 dark:text-gray-100">{memo.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {memo.created_at && format(new Date(memo.created_at), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(memo)}
                        disabled={loading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMemo(memo.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 페이징 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              총 {pagination.total}개 (페이지 {pagination.page}/{pagination.totalPages})
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

