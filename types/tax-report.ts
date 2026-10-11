export interface TaxReportRow {
  payee_id: string
  name: string
  resident_number: string | null
  net_amount: number
}

export interface TaxReportResponse {
  rows: TaxReportRow[]
  years: number[]
}
