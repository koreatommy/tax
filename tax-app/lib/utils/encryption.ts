import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY || ''

// 암호화 키를 32바이트로 변환
function getKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_SECRET_KEY is not set')
  }
  // Base64로 인코딩된 키를 Buffer로 변환
  const key = Buffer.from(ENCRYPTION_KEY, 'base64')
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_SECRET_KEY must be 32 bytes')
  }
  return key
}

/**
 * 문자열을 암호화합니다 (주민번호, 계좌번호 등)
 */
export function encrypt(text: string): string {
  if (!text) return ''

  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // IV와 암호문을 함께 저장 (콜론으로 구분)
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * 암호화된 문자열을 복호화합니다
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || encryptedText === '') return ''

  try {
    const key = getKey()
    const parts = encryptedText.split(':')

    // 암호화 형식이 아니면 원본 그대로 반환
    if (parts.length !== 2) {
      console.warn('Invalid encrypted text format, returning original:', encryptedText)
      return encryptedText
    }

    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // 복호화 실패 시 원본 반환
    return encryptedText
  }
}

/**
 * 주민번호 유효성 검증
 */
export function validateResidentNumber(residentNumber: string): boolean {
  // 형식 검증: 000000-0000000
  const regex = /^\d{6}-\d{7}$/
  if (!regex.test(residentNumber)) return false

  // 체크섬 검증
  const numbers = residentNumber.replace('-', '').split('').map(Number)
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += numbers[i] * weights[i]
  }

  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === numbers[12]
}

/**
 * 주민번호 마스킹 (뒷자리 *******)
 */
export function maskResidentNumber(residentNumber: string): string {
  if (!residentNumber) return ''
  const parts = residentNumber.split('-')
  if (parts.length !== 2) return residentNumber
  return `${parts[0]}-*******`
}

/**
 * 계좌번호 마스킹 (중간 부분 ****)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return ''
  if (accountNumber.length < 8) return accountNumber

  const start = accountNumber.slice(0, 3)
  const end = accountNumber.slice(-3)
  const middle = '*'.repeat(accountNumber.length - 6)

  return `${start}${middle}${end}`
}

