import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 회사 정보 조회
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: '회사 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 영수증 데이터 조회
    const { data: receipts, error: receiptsError } = await supabase
      .from('receipts')
      .select(`
        *,
        payment:payments(
          payment_date,
          payment_reason,
          payment_amount,
          net_amount
        ),
        payee:payees(
          name,
          business_type
        )
      `)
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (receiptsError) {
      console.error('영수증 조회 오류:', receiptsError)
      return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 })
    }

    if (!receipts || receipts.length === 0) {
      return NextResponse.json({ error: '다운로드할 데이터가 없습니다' }, { status: 404 })
    }

    // 엑셀 데이터 변환
    const excelData = receipts.map((receipt, index) => ({
      '순번': index + 1,
      '영수증번호': receipt.receipt_number,
      '지급대상자': receipt.payee?.name || '',
      '사업자구분': receipt.payee?.business_type || '',
      '지급일자': receipt.payment?.payment_date || '',
      '지급사유': receipt.payment?.payment_reason || '',
      '지급액': receipt.payment?.payment_amount || 0,
      '실지급액': receipt.payment?.net_amount || 0,
      '원천징수액': (receipt.payment?.payment_amount || 0) - (receipt.payment?.net_amount || 0),
      '이메일발송상태': receipt.email_sent ? '발송완료' : '미발송',
      '발급일시': receipt.created_at ? new Date(receipt.created_at).toLocaleString('ko-KR') : ''
    }))

    // 워크북 생성
    const workbook = XLSX.utils.book_new()
    
    // 데이터를 배열 형태로 변환 (헤더 + 데이터)
    const headers = [
      '순번', '영수증번호', '지급대상자', '사업자구분', '지급일자', 
      '지급사유', '지급액', '실지급액', '원천징수액', '이메일발송상태', '발급일시'
    ]
    
    const dataArray = [headers, ...excelData.map(row => Object.values(row))]
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray)

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 8 },   // 순번
      { wch: 20 },  // 영수증번호
      { wch: 15 },  // 지급대상자
      { wch: 12 },  // 사업자구분
      { wch: 12 },  // 지급일자
      { wch: 30 },  // 지급사유
      { wch: 15 },  // 지급액
      { wch: 15 },  // 실지급액
      { wch: 15 },  // 원천징수액
      { wch: 15 },  // 이메일발송상태
      { wch: 20 }   // 발급일시
    ]

    // 범위 계산
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

    // 헤더 스타일 적용 (구글 시트 호환)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: 0 }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      if (!worksheet[cell_ref]) continue
      
      worksheet[cell_ref].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }

    // 데이터 행 스타일 적용 (구글 시트 호환)
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R }
        const cell_ref = XLSX.utils.encode_cell(cell_address)
        if (!worksheet[cell_ref]) continue

        // 기본 스타일
        const baseStyle: Record<string, unknown> = {}

        // 컬럼별 정렬 설정
        switch (C) {
          case 0: // 순번
            baseStyle.alignment = { horizontal: 'center', vertical: 'center' }
            break
          case 1: // 영수증번호
            baseStyle.alignment = { horizontal: 'center', vertical: 'center' }
            break
          case 2: // 지급대상자
            baseStyle.alignment = { horizontal: 'left', vertical: 'center' }
            break
          case 3: // 사업자구분
            baseStyle.alignment = { horizontal: 'center', vertical: 'center' }
            break
          case 4: // 지급일자
            baseStyle.alignment = { horizontal: 'center', vertical: 'center' }
            break
          case 5: // 지급사유
            baseStyle.alignment = { horizontal: 'left', vertical: 'center' }
            break
          case 6: // 지급액
          case 7: // 실지급액
          case 8: // 원천징수액
            baseStyle.alignment = { horizontal: 'right', vertical: 'center' }
            // 숫자 포맷 적용
            if (worksheet[cell_ref].v && typeof worksheet[cell_ref].v === 'number') {
              worksheet[cell_ref].z = '#,##0'
            }
            break
          case 9: // 이메일발송상태
            baseStyle.alignment = { horizontal: 'center', vertical: 'center' }
            break
          case 10: // 발급일시
            baseStyle.alignment = { horizontal: 'center', vertical: 'center' }
            break
        }

        // 짝수 행 배경색
        if (R % 2 === 1) {
          baseStyle.fill = { fgColor: { rgb: 'F8F9FA' } }
        }

        // 스타일 적용
        if (Object.keys(baseStyle).length > 0) {
          worksheet[cell_ref].s = baseStyle
        }
      }
    }

    // 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '원천징수영수증')

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // 파일명 생성 (현재 날짜 포함)
    const currentDate = new Date().toISOString().split('T')[0]
    const fileName = `원천징수영수증_${currentDate}.xlsx`

    // 응답 생성
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('엑셀 다운로드 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
