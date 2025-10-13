'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GitCommit, User, Clock, Hash, FileText, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface GitCommitDetail {
  hash: string
  shortHash: string
  author: string
  date: string
  fullMessage: string
  filesChanged: number
  insertions: number
  deletions: number
  fileChanges: Array<{
    status: string
    path: string
    insertions?: number
    deletions?: number
  }>
}

interface GitCommitDetailModalProps {
  isOpen: boolean
  onClose: () => void
  commitHash: string
}

export function GitCommitDetailModal({ isOpen, onClose, commitHash }: GitCommitDetailModalProps) {
  const [commitDetail, setCommitDetail] = useState<GitCommitDetail | null>(null)
  const [loading, setLoading] = useState(false)

  // 커밋 상세 정보 조회
  const fetchCommitDetail = async () => {
    if (!commitHash) return

    try {
      setLoading(true)
      const res = await fetch(`/api/admin/git-commits/${commitHash}`)
      
      if (!res.ok) {
        throw new Error('커밋 상세 정보 조회 실패')
      }

      const result = await res.json()
      setCommitDetail(result.data)
    } catch (error) {
      console.error('커밋 상세 정보 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 모달이 열릴 때 커밋 상세 정보 조회
  React.useEffect(() => {
    if (isOpen && commitHash) {
      fetchCommitDetail()
    }
  }, [isOpen, commitHash]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatCommitDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })
    } catch {
      return '알 수 없음'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'D': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'M': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'R': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'A': return '추가'
      case 'D': return '삭제'
      case 'M': return '수정'
      case 'R': return '이름변경'
      case 'C': return '복사'
      default: return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            커밋 상세 정보
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">커밋 상세 정보를 불러오는 중...</p>
            </div>
          ) : commitDetail ? (
            <div className="space-y-6">
              {/* 커밋 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">커밋 해시</span>
                  <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {commitDetail.hash}
                  </code>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">작성자</span>
                  <span className="text-sm">{commitDetail.author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">날짜</span>
                  <span className="text-sm">{formatCommitDate(commitDetail.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">짧은 해시</span>
                  <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {commitDetail.shortHash}
                  </code>
                </div>
              </div>

              {/* 커밋 메시지 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  커밋 메시지
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                    {commitDetail.fullMessage}
                  </pre>
                </div>
              </div>

              {/* 변경 통계 */}
              <div>
                <h3 className="text-lg font-semibold mb-2">변경 통계</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {commitDetail.filesChanged}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">파일 변경</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                      <Plus className="h-4 w-4" />
                      {commitDetail.insertions}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">추가</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                      <Minus className="h-4 w-4" />
                      {commitDetail.deletions}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">삭제</div>
                  </div>
                </div>
              </div>

              {/* 파일 변경 목록 */}
              <div>
                <h3 className="text-lg font-semibold mb-2">변경된 파일</h3>
                <div className="space-y-2">
                  {commitDetail.fileChanges.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge className={getStatusColor(file.status)}>
                          {getStatusText(file.status)}
                        </Badge>
                        <code className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {file.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {file.insertions !== undefined && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Plus className="h-3 w-3" />
                            {file.insertions}
                          </span>
                        )}
                        {file.deletions !== undefined && (
                          <span className="flex items-center gap-1 text-red-600">
                            <Minus className="h-3 w-3" />
                            {file.deletions}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">커밋 상세 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
