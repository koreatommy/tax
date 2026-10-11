import type { TaxReportRow } from '@/types/tax-report'

interface PaymentForReport {
  payee_id: string
  net_amount: number | null
  payee: { name: string; resident_number: string | null } | null
}

const koreanCollator = new Intl.Collator('ko-KR')

export function aggregateByPayee(payments: PaymentForReport[]): TaxReportRow[] {
  const rows = new Map<string, TaxReportRow>()

  for (const payment of payments) {
    const existing = rows.get(payment.payee_id)
    if (existing) {
      existing.net_amount += payment.net_amount ?? 0
      continue
    }
    rows.set(payment.payee_id, {
      payee_id: payment.payee_id,
      name: payment.payee?.name ?? '',
      resident_number: payment.payee?.resident_number ?? null,
      net_amount: payment.net_amount ?? 0,
    })
  }

  return sortByKoreanName([...rows.values()])
}

export function sortByKoreanName(rows: TaxReportRow[]): TaxReportRow[] {
  return [...rows].sort((a, b) => koreanCollator.compare(a.name, b.name))
}

export function getPeriodRange(year: number, month: number | null): { start: string; end: string } {
  if (month === null) {
    return { start: `${year}-01-01`, end: `${year + 1}-01-01` }
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  return { start: `${year}-${pad(month)}-01`, end: `${nextYear}-${pad(nextMonth)}-01` }
}
