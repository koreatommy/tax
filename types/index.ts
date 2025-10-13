/**
 * 원천징수 관리 시스템 공통 타입 정의
 */

import type {
  Company,
  Payee,
  Payment,
  Receipt
} from './database'

export type {
  Company,
  Payee,
  Payment,
  Receipt
}

// ============================
// 사업자 유형
// ============================

export const BUSINESS_TYPES = {
  FREELANCER: '프리랜서',
  INSTRUCTOR: '강사',
  CONTRACTOR: '외주직원',
  OTHER: '기타'
} as const

export type BusinessType = keyof typeof BUSINESS_TYPES

// ============================
// 은행 목록
// ============================

export const BANKS = [
  'KB국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  'IBK기업은행',
  'NH농협은행',
  'SC제일은행',
  '씨티은행',
  'KDB산업은행',
  '수협은행',
  '대구은행',
  '부산은행',
  '경남은행',
  '광주은행',
  '전북은행',
  '제주은행',
  '우체국',
  '새마을금고',
  '신협',
  '저축은행',
  '산림조합',
  '토스뱅크',
  '카카오뱅크',
  'K뱅크',
  '기타(직접입력)',
] as const

export type Bank = (typeof BANKS)[number]

// ============================
// 확장된 엔티티 타입
// ============================

/**
 * 복호화된 대상자 정보 (UI에서 사용)
 */
export interface PayeeWithDecrypted extends Payee {
  resident_number?: string  // 복호화된 주민번호
  account_number?: string   // 복호화된 계좌번호
}

/**
 * 대상자 + 회사 정보
 */
export interface PayeeWithCompany extends Payee {
  company?: Company
}

/**
 * 지급 + 대상자 + 회사 정보
 */
export interface PaymentWithDetails extends Payment {
  payee?: Payee
  company?: Company
}

/**
 * 영수증 + 지급 + 대상자 + 회사 정보
 */
export interface ReceiptWithDetails extends Receipt {
  payment?: Payment
  payee?: Payee
  company?: Company
}

// ============================
// 폼 타입
// ============================

/**
 * 대상자 등록/수정 폼
 */
export interface PayeeFormData {
  name: string
  residentNumber: string  // 암호화 전 주민번호
  address?: string
  contact?: string
  email?: string
  bankName?: Bank
  accountNumber?: string  // 암호화 전 계좌번호
  businessType: BusinessType
  contractStartDate?: string
  contractEndDate?: string
  isActive: boolean
}

/**
 * 지급 등록/수정 폼
 */
export interface PaymentFormData {
  payeeId: string
  paymentDate: string
  paymentAmount: number
  paymentReason?: string
}

/**
 * 회사 등록/수정 폼
 */
export interface CompanyFormData {
  businessNumber: string
  companyName: string
  representativeName: string
  address?: string
  contact?: string
  email?: string
}

// ============================
// 필터 & 검색
// ============================

/**
 * 대상자 필터
 */
export interface PayeeFilter {
  businessType?: BusinessType
  isActive?: boolean
  search?: string  // 이름, 연락처 검색
}

/**
 * 지급 필터
 */
export interface PaymentFilter {
  startDate?: string
  endDate?: string
  payeeId?: string
  receiptIssued?: boolean
  minAmount?: number
  maxAmount?: number
}

/**
 * 영수증 필터
 */
export interface ReceiptFilter {
  startDate?: string
  endDate?: string
  payeeId?: string
  emailSent?: boolean
}

// ============================
// API 응답 타입
// ============================

/**
 * 성공 응답
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * 에러 응답
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================
// 페이지네이션
// ============================

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================
// 통계
// ============================

/**
 * 대시보드 통계
 */
export interface DashboardStats {
  totalPayees: number
  activePayees: number
  totalPayments: number
  totalAmount: number
  totalTax: number
  monthlyPayments: number
  monthlyAmount: number
  receiptsIssued: number
}

/**
 * 월별 통계
 */
export interface MonthlyStats {
  month: string  // YYYY-MM
  paymentCount: number
  totalAmount: number
  totalTax: number
}

