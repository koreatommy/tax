'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search, Users, CreditCard, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Company } from '@/types'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<(Company & { payees?: Array<{ count: number }>, payments?: Array<{ count: number }>, receipts?: Array<{ count: number }> })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies')
      const result = await res.json()
      if (result.data) {
        setCompanies(result.data)
      }
    } catch (error) {
      console.error('Companies fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    company.business_number?.includes(search)
  )

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">회사 관리</h1>
        <p className="mt-1 text-sm text-gray-600">등록된 회사를 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">전체 회사 목록 ({filteredCompanies.length}개)</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="회사명 또는 사업자번호 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 회사가 없습니다
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회사명</TableHead>
                    <TableHead>대표자</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>대상자</TableHead>
                    <TableHead>지급건수</TableHead>
                    <TableHead>영수증</TableHead>
                    <TableHead>등록일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="font-medium">{company.company_name}</div>
                        <div className="text-xs text-gray-500">{company.email || '-'}</div>
                      </TableCell>
                      <TableCell>{company.representative_name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {company.business_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3 text-blue-500" />
                          <span>{company.payees?.[0]?.count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <CreditCard className="h-3 w-3 text-green-500" />
                          <span>{company.payments?.[0]?.count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-3 w-3 text-purple-500" />
                          <span>{company.receipts?.[0]?.count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {company.created_at ? format(new Date(company.created_at), 'yyyy-MM-dd', { locale: ko }) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
