'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Calendar, Building2, Eye, Trash2, Edit, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  company: {
    id: string
    company_name: string
    business_number: string
    representative_name: string
    address: string | null
    contact: string | null
    email: string | null
  } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editForm, setEditForm] = useState({
    company_name: '',
    business_number: '',
    representative_name: '',
    address: '',
    contact: '',
    email: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const result = await res.json()
      if (result.data) {
        setUsers(result.data)
      }
    } catch {
      toast.error('사용자 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      company_name: user.company?.company_name || '',
      business_number: user.company?.business_number || '',
      representative_name: user.company?.representative_name || '',
      address: user.company?.address || '',
      contact: user.company?.contact || '',
      email: user.company?.email || '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          ...editForm,
        }),
      })

      if (res.ok) {
        toast.success('사용자 정보가 수정되었습니다')
        setShowEditModal(false)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || '수정에 실패했습니다')
      }
    } catch {
      toast.error('수정 중 오류가 발생했습니다')
    }
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/admin/users?user_id=${selectedUser.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('사용자가 삭제되었습니다')
        setShowDeleteModal(false)
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || '삭제에 실패했습니다')
      }
    } catch {
      toast.error('삭제 중 오류가 발생했습니다')
    }
  }

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
        <p className="mt-1 text-sm text-gray-600">전체 사용자를 관리합니다</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">전체 사용자 목록 ({users.length}명)</CardTitle>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 사용자가 없습니다
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>회사명</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>마지막 로그인</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {user.company?.company_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.company?.business_number || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(user.created_at), 'yyyy-MM-dd', { locale: ko })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.last_sign_in_at 
                          ? format(new Date(user.last_sign_in_at), 'yyyy-MM-dd HH:mm', { locale: ko })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          활성
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleViewDetails(user)}
                            variant="ghost"
                            size="sm"
                            title="상세보기"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditUser(user)}
                            variant="ghost"
                            size="sm"
                            title="수정"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세보기 모달 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">사용자 상세 정보</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">사용자 및 회사 정보를 확인합니다</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-4">계정 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">이메일</Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">사용자 ID</Label>
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1">{selectedUser.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">가입일</Label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{format(new Date(selectedUser.created_at), 'yyyy-MM-dd HH:mm', { locale: ko })}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">마지막 로그인</Label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedUser.last_sign_in_at 
                        ? format(new Date(selectedUser.last_sign_in_at), 'yyyy-MM-dd HH:mm', { locale: ko })
                        : '기록 없음'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.company ? (
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-4">회사 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">회사명</Label>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedUser.company.company_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">사업자등록번호</Label>
                      <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">{selectedUser.company.business_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">대표자명</Label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedUser.company.representative_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">연락처</Label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedUser.company.contact || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">주소</Label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedUser.company.address || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">이메일</Label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedUser.company.email || '-'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    회사 정보가 등록되지 않았습니다
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)} variant="outline">
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">사용자 정보 수정</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              {selectedUser?.email}의 회사 정보를 수정합니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name" className="text-sm font-semibold text-gray-900 dark:text-gray-100">회사명 *</Label>
                <Input
                  id="company_name"
                  value={editForm.company_name}
                  onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                  required
                  className="mt-1 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="business_number" className="text-sm font-semibold text-gray-900 dark:text-gray-100">사업자등록번호 *</Label>
                <Input
                  id="business_number"
                  value={editForm.business_number}
                  onChange={(e) => setEditForm({ ...editForm, business_number: e.target.value })}
                  maxLength={10}
                  required
                  className="mt-1 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="representative_name" className="text-sm font-semibold text-gray-900 dark:text-gray-100">대표자명 *</Label>
                <Input
                  id="representative_name"
                  value={editForm.representative_name}
                  onChange={(e) => setEditForm({ ...editForm, representative_name: e.target.value })}
                  required
                  className="mt-1 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-sm font-semibold text-gray-900 dark:text-gray-100">연락처</Label>
                <Input
                  id="contact"
                  value={editForm.contact}
                  onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                  className="mt-1 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-900 dark:text-gray-100">주소</Label>
                <Input
                  id="address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="mt-1 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-900 dark:text-gray-100">회사 이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEditModal(false)} variant="outline">
              취소
            </Button>
            <Button onClick={handleSaveEdit}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">사용자 삭제</DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              정말로 이 사용자를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-lg space-y-3">
                <p className="text-base font-bold text-red-900 dark:text-red-100">
                  <Mail className="h-5 w-5 inline mr-2" />
                  {selectedUser.email}
                </p>
                {selectedUser.company && (
                  <p className="text-base font-semibold text-red-800 dark:text-red-200">
                    <Building2 className="h-5 w-5 inline mr-2" />
                    {selectedUser.company.company_name}
                  </p>
                )}
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                  ⚠️ 이 작업은 되돌릴 수 없습니다. 사용자 계정과 모든 관련 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDeleteModal(false)} variant="outline">
              취소
            </Button>
            <Button onClick={confirmDeleteUser} variant="destructive">
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
