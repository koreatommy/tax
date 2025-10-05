import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency } from '@/lib/utils/tax-calculator'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export interface ReceiptData {
  receiptNumber: string
  paymentDate: string
  payeeName: string
  residentNumber: string
  address?: string
  paymentAmount: number
  incomeTax: number
  localIncomeTax: number
  totalTax: number
  netAmount: number
  paymentReason?: string
  companyName: string
  companyRepresentative: string
  companyBusinessNumber: string
  companyAddress?: string
}

/**
 * 독립적인 iframe에서 영수증 HTML을 렌더링하여 PDF 생성
 * CSS lab() 함수 문제를 완전히 우회
 */
export async function downloadReceiptPDF(data: ReceiptData): Promise<void> {
  let iframe: HTMLIFrameElement | null = null
  
  try {
    // 숨겨진 iframe 생성
    iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.left = '-9999px'
    iframe.style.top = '0'
    iframe.style.width = '794px' // A4 width
    iframe.style.height = '1200px' // A4 height 증가
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) throw new Error('iframe 문서를 생성할 수 없습니다')

    // iframe에 완전히 독립적인 HTML 작성 (인라인 스타일만 사용)
    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans KR', sans-serif;
            background: #ffffff;
            color: #000000;
            padding: 50px 60px 80px 60px;
            width: 794px;
          }
          .title {
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #000000;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #666666;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            border-bottom: 2px solid #333333;
            padding-bottom: 8px;
            margin-bottom: 12px;
            color: #000000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .info-table td {
            padding: 6px 0;
            color: #000000;
            line-height: 1.6;
          }
          .info-table td:first-child {
            width: 150px;
            color: #666666;
          }
          .calc-table {
            border: 1px solid #dddddd;
            table-layout: fixed;
          }
          .calc-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #dddddd;
            line-height: 1.8;
            font-size: 12px;
          }
          .calc-table td:first-child {
            background-color: #f9fafb;
            font-weight: 500;
            width: 200px;
          }
          .calc-table td:last-child {
            text-align: right;
            font-weight: 600;
            font-family: 'Noto Sans KR', monospace;
            letter-spacing: 0.5px;
          }
          .tax-red {
            color: #dc2626;
          }
          .total-row td {
            background-color: #dbeafe !important;
            font-size: 15px;
            font-weight: 700;
            padding: 20px 20px;
            line-height: 1.8;
          }
          .total-row td:last-child {
            color: #2563eb;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #666666;
            padding-top: 30px;
            padding-bottom: 20px;
            border-top: 1px solid #dddddd;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="title">사업소득 원천징수영수증</div>
        
        <div class="info-row">
          <span>영수증 번호: ${data.receiptNumber}</span>
          <span>발급일자: ${format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}</span>
        </div>

        <div class="section">
          <div class="section-title">원천징수의무자</div>
          <table class="info-table">
            <tr>
              <td>상호(법인명)</td>
              <td>${data.companyName}</td>
            </tr>
            <tr>
              <td>대표자</td>
              <td>${data.companyRepresentative}</td>
            </tr>
            <tr>
              <td>사업자등록번호</td>
              <td>${data.companyBusinessNumber}</td>
            </tr>
            <tr>
              <td>주소</td>
              <td>${data.companyAddress || '-'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">소득자</div>
          <table class="info-table">
            <tr>
              <td>성명</td>
              <td>${data.payeeName}</td>
            </tr>
            <tr>
              <td>주민등록번호</td>
              <td>${data.residentNumber}</td>
            </tr>
            <tr>
              <td>주소</td>
              <td>${data.address || '-'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">지급 내역</div>
          <table class="info-table">
            <tr>
              <td>지급일자</td>
              <td>${format(new Date(data.paymentDate), 'yyyy년 MM월 dd일', { locale: ko })}</td>
            </tr>
            <tr>
              <td>지급 사유</td>
              <td>${data.paymentReason || '-'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">원천징수세액 계산</div>
          <table class="calc-table">
            <tr>
              <td>지급액</td>
              <td>${formatCurrency(data.paymentAmount)}</td>
            </tr>
            <tr>
              <td>소득세 (3%)</td>
              <td class="tax-red">${formatCurrency(data.incomeTax)}</td>
            </tr>
            <tr>
              <td>지방소득세 (0.3%)</td>
              <td class="tax-red">${formatCurrency(data.localIncomeTax)}</td>
            </tr>
            <tr>
              <td>총 원천징수세액</td>
              <td class="tax-red">${formatCurrency(data.totalTax)}</td>
            </tr>
            <tr class="total-row">
              <td>실지급액</td>
              <td>${formatCurrency(data.netAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          본 영수증은 소득세법에 의거하여 발급되었습니다.
        </div>
      </body>
      </html>
    `)
    iframeDoc.close()

    // 폰트 로드 대기
    await iframe.contentWindow?.document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 500)) // 추가 안전 대기

    // html2canvas로 캡처
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1200,
    })

    // PDF 생성 (JPEG로 압축하여 용량 최적화)
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [794, 1200],
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1200)

    // PDF 다운로드
    const fileName = `영수증_${data.receiptNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('PDF 생성 중 오류:', error)
    throw error
  } finally {
    // iframe 정리
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
  }
}
