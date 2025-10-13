'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitCommit, GitBranch, Clock, User, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface GitCommit {
  hash: string
  date: string
  message: string
  author: string
  shortHash: string
}

interface GitStatus {
  hasUncommittedChanges: boolean
  currentBranch: string
  lastCommit: {
    hash: string
    date: string | null
    message: string
  }
}

interface GitCommitsResponse {
  commits: GitCommit[]
  gitStatus: GitStatus
}

export function GitCommitList() {
  const [gitData, setGitData] = useState<GitCommitsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Git 커밋 현황 조회
  const fetchGitCommits = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/git-commits')
      
      if (!res.ok) {
        throw new Error('Git 정보 조회 실패')
      }

      const result = await res.json()
      setGitData(result.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Git 커밋 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGitCommits()
    
    // 30초마다 자동 업데이트
    const interval = setInterval(fetchGitCommits, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatCommitDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'MM/dd HH:mm', { locale: ko })
    } catch {
      return '알 수 없음'
    }
  }

  const getCommitType = (message: string) => {
    if (message.startsWith('feat:')) return { type: 'feature', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
    if (message.startsWith('fix:')) return { type: 'bugfix', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    if (message.startsWith('refactor:')) return { type: 'refactor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
    if (message.startsWith('style:')) return { type: 'style', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
    if (message.startsWith('docs:')) return { type: 'docs', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
    if (message.startsWith('chore:')) return { type: 'chore', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' }
    return { type: 'commit', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' }
  }

  if (!gitData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Git 커밋 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Git 정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Git 커밋 현황
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                마지막 업데이트: {format(lastUpdated, 'HH:mm:ss', { locale: ko })}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={fetchGitCommits}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Git 상태 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">브랜치</span>
            <Badge variant="outline">{gitData.gitStatus.currentBranch}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">상태</span>
            <Badge 
              variant={gitData.gitStatus.hasUncommittedChanges ? "destructive" : "secondary"}
            >
              {gitData.gitStatus.hasUncommittedChanges ? '변경사항 있음' : '깨끗함'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">마지막 커밋</span>
            <span className="text-xs text-gray-500">
              {gitData.gitStatus.lastCommit.date ? 
                format(new Date(gitData.gitStatus.lastCommit.date), 'MM/dd HH:mm', { locale: ko }) : 
                '알 수 없음'
              }
            </span>
          </div>
        </div>

        {/* 커밋 목록 */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gitData.commits.map((commit) => {
            const commitType = getCommitType(commit.message)
            return (
              <div
                key={commit.hash}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={commitType.color}>
                        {commitType.type}
                      </Badge>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {commit.shortHash}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {commit.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatCommitDate(commit.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 자동 업데이트 안내 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t">
          💡 30초마다 자동으로 업데이트됩니다
        </div>
      </CardContent>
    </Card>
  )
}
