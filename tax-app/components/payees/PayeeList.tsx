'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function PayeeList() {
  const [payees, setPayees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPayees()
  }, [])

  const fetchPayees = async () => {
    try {
      const res = await fetch('/api/payees')
      const result = await res.json()
      
      if (result.data) {
        setPayees(result.data)
      }
    } catch (error) {
      toast.error('데이터 조회 실패')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/payees/${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        toast.error('삭제 실패')
        return
      }

      toast.success('삭제되었습니다')
      fetchPayees()
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다')
      console.error(error)
    }
  }

  const filteredPayees = payees.filter((payee) =>
    payee.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 등록 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/dashboard/payees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            신규 등록
          </Button>
        </Link>
      </div>

      {/* 테이블 */}
      {filteredPayees.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          등록된 지급 대상자가 없습니다
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>성명</TableHead>
                <TableHead>주민번호</TableHead>
                <TableHead>사업자 유형</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayees.map((payee) => (
                <TableRow key={payee.id}>
                  <TableCell className="font-medium">{payee.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {payee.resident_number}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payee.business_type}</Badge>
                  </TableCell>
                  <TableCell>{payee.contact || '-'}</TableCell>
                  <TableCell>
                    {payee.is_active ? (
                      <Badge variant="default">활성</Badge>
                    ) : (
                      <Badge variant="outline">비활성</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(payee.created_at), 'yyyy-MM-dd', { locale: ko })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/payees/${payee.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/payees/${payee.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payee.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
