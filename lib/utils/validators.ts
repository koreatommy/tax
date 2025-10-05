/**
 * 사업자등록번호 유효성 검증
 */
export function validateBusinessNumber(businessNumber: string): boolean {
  // 형식 검증: 000-00-00000 또는 0000000000
  const cleaned = businessNumber.replace(/-/g, '')
  
  if (!/^\d{10}$/.test(cleaned)) {
    return false
  }

  // 체크섬 검증
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i]
  }

  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10)
  const checkDigit = (10 - (sum % 10)) % 10

  return checkDigit === parseInt(cleaned[9])
}

/**
 * 이메일 유효성 검증
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 전화번호 유효성 검증
 */
export function validatePhone(phone: string): boolean {
  // 형식: 010-0000-0000, 02-000-0000, 031-000-0000 등
  const regex = /^\d{2,3}-\d{3,4}-\d{4}$/
  return regex.test(phone)
}

/**
 * 사업자등록번호 포맷팅 (000-00-00000)
 */
export function formatBusinessNumber(businessNumber: string): string {
  const cleaned = businessNumber.replace(/-/g, '')
  if (cleaned.length !== 10) return businessNumber
  
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
}

/**
 * 전화번호 포맷팅
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/-/g, '')
  
  if (cleaned.length === 10) {
    // 02-000-0000 또는 031-000-0000
    if (cleaned.startsWith('02')) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
  } else if (cleaned.length === 11) {
    // 010-0000-0000
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

