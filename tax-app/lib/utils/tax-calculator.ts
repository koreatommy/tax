/**
 * 사업소득 원천징수세액 계산 (3.3%)
 */

export interface TaxCalculation {
  paymentAmount: number      // 지급액
  incomeTax: number          // 소득세 (3%)
  localIncomeTax: number     // 지방소득세 (0.3%)
  totalTax: number           // 총 세액 (3.3%)
  netAmount: number          // 실지급액
}

/**
 * 지급액에 대한 원천징수세액을 계산합니다.
 * 
 * @param paymentAmount - 지급액
 * @returns 세액 계산 결과
 * 
 * @example
 * ```ts
 * const result = calculateTax(1000000)
 * // {
 * //   paymentAmount: 1000000,
 * //   incomeTax: 30000,
 * //   localIncomeTax: 3000,
 * //   totalTax: 33000,
 * //   netAmount: 967000
 * // }
 * ```
 */
export function calculateTax(paymentAmount: number): TaxCalculation {
  if (paymentAmount < 0) {
    throw new Error('지급액은 0보다 커야 합니다')
  }

  // 소득세 3%
  const incomeTax = Math.round(paymentAmount * 0.03)
  
  // 지방소득세 0.3%
  const localIncomeTax = Math.round(paymentAmount * 0.003)
  
  // 총 원천징수세액 3.3%
  const totalTax = incomeTax + localIncomeTax
  
  // 실지급액 = 지급액 - 총세액
  const netAmount = paymentAmount - totalTax
  
  return {
    paymentAmount,
    incomeTax,
    localIncomeTax,
    totalTax,
    netAmount
  }
}

/**
 * 금액을 한국 통화 형식으로 포맷합니다.
 * 
 * @param amount - 포맷할 금액
 * @returns 포맷된 금액 문자열 (예: "1,000,000원")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

/**
 * 세율을 표시합니다.
 * 
 * @param rate - 세율 (0.03 = 3%)
 * @returns 포맷된 세율 문자열 (예: "3.0%")
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

