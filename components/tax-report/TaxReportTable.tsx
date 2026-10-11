import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import type { TaxReportRow } from '@/types/tax-report'

interface TaxReportTableProps {
  rows: TaxReportRow[]
}

export function TaxReportTable({ rows }: TaxReportTableProps) {
  const total = rows.reduce((sum, row) => sum + row.net_amount, 0)

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">No</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>주민번호</TableHead>
            <TableHead className="text-right">실지급액</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.payee_id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="font-mono">{row.resident_number || '-'}</TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {formatCurrency(row.net_amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-semibold">
              합계 ({rows.length}명)
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-green-600 dark:text-green-400">
              {formatCurrency(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
