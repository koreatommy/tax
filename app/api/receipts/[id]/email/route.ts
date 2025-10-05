import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt, maskResidentNumber } from '@/lib/utils/encryption'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils/tax-calculator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { email } = await request.json()

    console.log('🔍 Email API 호출:', { id, email })

    if (!email) {
      return NextResponse.json(
        { success: false, error: '이메일 주소가 필요합니다' },
        { status: 400 }
      )
    }

    // 사용자 인증 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 사용자 인증:', { user: user?.id, authError })
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 영수증 데이터 조회
    console.log('📄 영수증 조회 시작:', { receiptId: id, userId: user.id })
    
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select(`
        *,
        payment:payments(*),
        payee:payees(*),
        company:companies!inner(user_id, *)
      `)
      .eq('id', id)
      .single()

    console.log('📄 영수증 조회 결과:', { 
      receipt: receipt ? { id: receipt.id, receipt_number: receipt.receipt_number } : null, 
      error: error?.message 
    })

    if (error || !receipt) {
      console.error('❌ 영수증 조회 실패:', error)
      return NextResponse.json(
        { success: false, error: '영수증을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 권한 확인
    console.log('🔐 권한 확인:', { 
      receiptUserId: receipt.company.user_id, 
      currentUserId: user.id,
      hasAccess: receipt.company.user_id === user.id 
    })
    
    if (receipt.company.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 주민번호 복호화 및 마스킹
    let residentNumber = '데이터 없음'
    if (receipt.payee.resident_number_encrypted) {
      try {
        const decrypted = decrypt(receipt.payee.resident_number_encrypted)
        residentNumber = decrypted ? maskResidentNumber(decrypted) : '데이터 없음'
      } catch (error) {
        console.error('Failed to decrypt resident number:', error)
        residentNumber = '데이터 없음'
      }
    }

    // 이메일 템플릿 HTML 생성
    const emailHtml = generateEmailTemplate({
      receiptNumber: receipt.receipt_number,
      paymentDate: receipt.payment.payment_date,
      payeeName: receipt.payee.name,
      residentNumber: residentNumber,
      address: receipt.payee.address,
      paymentAmount: receipt.payment.payment_amount,
      incomeTax: receipt.payment.income_tax,
      localIncomeTax: receipt.payment.local_income_tax,
      totalTax: receipt.payment.total_tax,
      netAmount: receipt.payment.net_amount,
      paymentReason: receipt.payment.payment_reason,
      companyName: receipt.company.company_name,
      companyRepresentative: receipt.company.representative_name,
      companyBusinessNumber: receipt.company.business_number,
      companyAddress: receipt.company.address,
    })

    console.log('📧 이메일 발송 시작:', { to: email })

    // Resend API를 사용한 이메일 발송
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error: emailError } = await resend.emails.send({
      from: 'Tax Receipt System <onboarding@resend.dev>', // Resend 기본 도메인 사용
      to: [email],
      subject: `[원천징수영수증] ${receipt.receipt_number} - ${receipt.payee.name}`,
      html: emailHtml,
    })

    console.log('📧 이메일 발송 결과:', { data, emailError })

    if (emailError) {
      console.error('❌ 이메일 발송 에러:', emailError)
      return NextResponse.json(
        { success: false, error: '이메일 발송에 실패했습니다' },
        { status: 500 }
      )
    }

    // 이메일 발송 기록 업데이트
    await supabase
      .from('receipts')
      .update({ 
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', id)

    console.log('✅ 이메일 발송 완료:', { messageId: data?.id })

    return NextResponse.json({
      success: true,
      data: { messageId: data?.id },
      message: '이메일이 성공적으로 발송되었습니다'
    })

  } catch (error) {
    console.error('❌ Email API 에러:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

function generateEmailTemplate(data: {
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
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>원천징수영수증</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px 0;
        }
        .info-label {
          font-weight: 500;
          color: #6b7280;
          min-width: 150px;
        }
        .info-value {
          flex: 1;
          text-align: right;
          font-weight: 500;
        }
        .amount-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .amount-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .amount-table td:first-child {
          background-color: #f9fafb;
          font-weight: 500;
        }
        .amount-table td:last-child {
          text-align: right;
          font-weight: 600;
        }
        .tax-amount {
          color: #dc2626;
        }
        .total-row {
          background-color: #dbeafe !important;
          font-size: 16px;
          font-weight: 700;
        }
        .total-row td:last-child {
          color: #2563eb;
          font-size: 18px;
        }
        .footer {
          background-color: #f3f4f6;
          padding: 20px 30px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .highlight {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>사업소득 원천징수영수증</h1>
          <p>영수증 번호: ${data.receiptNumber}</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>${data.payeeName}</strong>님께 발급된 원천징수영수증을 첨부하여 발송드립니다.
          </div>

          <div class="section">
            <div class="section-title">원천징수의무자</div>
            <div class="info-row">
              <span class="info-label">상호(법인명)</span>
              <span class="info-value">${data.companyName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">대표자</span>
              <span class="info-value">${data.companyRepresentative}</span>
            </div>
            <div class="info-row">
              <span class="info-label">사업자등록번호</span>
              <span class="info-value">${data.companyBusinessNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">주소</span>
              <span class="info-value">${data.companyAddress || '-'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">소득자</div>
            <div class="info-row">
              <span class="info-label">성명</span>
              <span class="info-value">${data.payeeName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">주민등록번호</span>
              <span class="info-value">${data.residentNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">주소</span>
              <span class="info-value">${data.address || '-'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">지급 내역</div>
            <div class="info-row">
              <span class="info-label">지급일자</span>
              <span class="info-value">${format(new Date(data.paymentDate), 'yyyy년 MM월 dd일', { locale: ko })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">지급 사유</span>
              <span class="info-value">${data.paymentReason || '-'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">원천징수세액 계산</div>
            <table class="amount-table">
              <tr>
                <td>지급액</td>
                <td>${formatCurrency(data.paymentAmount)}</td>
              </tr>
              <tr>
                <td>소득세 (3%)</td>
                <td class="tax-amount">${formatCurrency(data.incomeTax)}</td>
              </tr>
              <tr>
                <td>지방소득세 (0.3%)</td>
                <td class="tax-amount">${formatCurrency(data.localIncomeTax)}</td>
              </tr>
              <tr>
                <td>총 원천징수세액</td>
                <td class="tax-amount">${formatCurrency(data.totalTax)}</td>
              </tr>
              <tr class="total-row">
                <td>실지급액</td>
                <td>${formatCurrency(data.netAmount)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>본 영수증은 소득세법에 의거하여 발급되었습니다.</p>
          <p>발급일자: ${format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}</p>
        </div>
      </div>
    </body>
    </html>
  `
}