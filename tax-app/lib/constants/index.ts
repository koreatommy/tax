/**
 * 원천징수 관리 시스템 상수
 */

// ============================
// 세율
// ============================

/**
 * 소득세율 (3%)
 */
export const INCOME_TAX_RATE = 0.03

/**
 * 지방소득세율 (0.3%)
 */
export const LOCAL_INCOME_TAX_RATE = 0.003

/**
 * 총 원천징수세율 (3.3%)
 */
export const TOTAL_TAX_RATE = INCOME_TAX_RATE + LOCAL_INCOME_TAX_RATE

// ============================
// 라우트
// ============================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PAYEES: {
    LIST: '/dashboard/payees',
    NEW: '/dashboard/payees/new',
    DETAIL: (id: string) => `/dashboard/payees/${id}`,
    EDIT: (id: string) => `/dashboard/payees/${id}/edit`,
  },
  PAYMENTS: {
    LIST: '/dashboard/payments',
    NEW: '/dashboard/payments/new',
    BULK: '/dashboard/payments/bulk',
    DETAIL: (id: string) => `/dashboard/payments/${id}`,
  },
  RECEIPTS: {
    LIST: '/dashboard/receipts',
    GENERATE: '/dashboard/receipts/generate',
    DETAIL: (id: string) => `/dashboard/receipts/${id}`,
  },
  SETTINGS: '/dashboard/settings',
} as const

// ============================
// API 엔드포인트
// ============================

export const API_ENDPOINTS = {
  PAYEES: '/api/payees',
  PAYMENTS: '/api/payments',
  RECEIPTS: '/api/receipts',
  UPLOAD: {
    EXCEL: '/api/upload/excel',
    CONTRACT: '/api/upload/contract',
  },
} as const

// ============================
// 기타 상수
// ============================

/**
 * 페이지당 기본 항목 수
 */
export const DEFAULT_PAGE_SIZE = 20

/**
 * 주민번호 정규식
 */
export const RESIDENT_NUMBER_REGEX = /^\d{6}-\d{7}$/

/**
 * 사업자등록번호 정규식
 */
export const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/

/**
 * 이메일 정규식
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 전화번호 정규식
 */
export const PHONE_REGEX = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/

