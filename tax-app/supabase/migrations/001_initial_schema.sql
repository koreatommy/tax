-- 원천징수 관리 시스템 초기 스키마
-- 작성일: 2025-10-03

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. companies 테이블 (회사/원천징수의무자 정보)
-- ============================================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_number VARCHAR(10) NOT NULL UNIQUE,
  company_name VARCHAR(200) NOT NULL,
  representative_name VARCHAR(100) NOT NULL,
  address TEXT,
  contact VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테이블 및 컬럼 설명
COMMENT ON TABLE companies IS '원천징수의무자(회사) 정보';
COMMENT ON COLUMN companies.user_id IS '인증된 사용자 ID (Supabase Auth)';
COMMENT ON COLUMN companies.business_number IS '사업자등록번호 (10자리)';
COMMENT ON COLUMN companies.company_name IS '상호 또는 법인명';
COMMENT ON COLUMN companies.representative_name IS '대표자 성명';

-- ============================================================================
-- 2. payees 테이블 (지급 대상자)
-- ============================================================================
CREATE TABLE payees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  resident_number_encrypted TEXT NOT NULL,
  address TEXT,
  contact VARCHAR(20),
  email VARCHAR(255),
  bank_name VARCHAR(50),
  account_number_encrypted TEXT,
  business_type VARCHAR(50) NOT NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  contract_file_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_payee_per_company UNIQUE(company_id, resident_number_encrypted)
);

-- 테이블 및 컬럼 설명
COMMENT ON TABLE payees IS '사업소득 지급 대상자 (프리랜서, 강사, 외주직원 등)';
COMMENT ON COLUMN payees.resident_number_encrypted IS '암호화된 주민등록번호';
COMMENT ON COLUMN payees.account_number_encrypted IS '암호화된 계좌번호';
COMMENT ON COLUMN payees.business_type IS '사업자 유형 (프리랜서, 강사, 외주직원 등)';
COMMENT ON COLUMN payees.contract_file_url IS 'Supabase Storage에 저장된 계약서 파일 URL';
COMMENT ON COLUMN payees.is_active IS '활성 상태 (퇴사/계약종료 시 false)';

-- ============================================================================
-- 3. payments 테이블 (지급 내역)
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  payee_id UUID REFERENCES payees(id) ON DELETE CASCADE NOT NULL,
  payment_date DATE NOT NULL,
  payment_amount DECIMAL(15, 2) NOT NULL CHECK (payment_amount >= 0),
  income_tax DECIMAL(15, 2) NOT NULL CHECK (income_tax >= 0),
  local_income_tax DECIMAL(15, 2) NOT NULL CHECK (local_income_tax >= 0),
  total_tax DECIMAL(15, 2) NOT NULL CHECK (total_tax >= 0),
  net_amount DECIMAL(15, 2) NOT NULL CHECK (net_amount >= 0),
  payment_reason TEXT,
  receipt_issued BOOLEAN DEFAULT FALSE,
  receipt_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테이블 및 컬럼 설명
COMMENT ON TABLE payments IS '사업소득 지급 내역';
COMMENT ON COLUMN payments.payment_amount IS '지급액 (세금 차감 전)';
COMMENT ON COLUMN payments.income_tax IS '소득세 3%';
COMMENT ON COLUMN payments.local_income_tax IS '지방소득세 0.3%';
COMMENT ON COLUMN payments.total_tax IS '총 원천징수세액 3.3%';
COMMENT ON COLUMN payments.net_amount IS '실지급액 (지급액 - 총세액)';
COMMENT ON COLUMN payments.payment_reason IS '지급 사유 (예: 2024년 9월 강의료)';
COMMENT ON COLUMN payments.receipt_issued IS '영수증 발급 여부';
COMMENT ON COLUMN payments.receipt_issued_at IS '영수증 발급 일시';

-- ============================================================================
-- 4. receipts 테이블 (원천징수영수증 발급 이력)
-- ============================================================================
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  payee_id UUID REFERENCES payees(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  issued_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테이블 및 컬럼 설명
COMMENT ON TABLE receipts IS '원천징수영수증 발급 이력';
COMMENT ON COLUMN receipts.receipt_number IS '영수증 고유 번호 (예: RCP-2024-001)';
COMMENT ON COLUMN receipts.pdf_url IS 'Supabase Storage에 저장된 PDF 파일 URL';
COMMENT ON COLUMN receipts.email_sent IS '이메일 발송 여부';
COMMENT ON COLUMN receipts.email_sent_at IS '이메일 발송 일시';
COMMENT ON COLUMN receipts.issued_by IS '발급한 사용자 ID';

-- ============================================================================
-- 인덱스 생성 (성능 최적화)
-- ============================================================================

-- 외래 키 인덱스
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_payees_company_id ON payees(company_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX idx_receipts_payee_id ON receipts(payee_id);
CREATE INDEX idx_receipts_company_id ON receipts(company_id);

-- 검색 최적화 인덱스
CREATE INDEX idx_payees_name ON payees(name);
CREATE INDEX idx_payees_is_active ON payees(is_active);
CREATE INDEX idx_payments_receipt_issued ON payments(receipt_issued);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);

-- ============================================================================
-- Row Level Security (RLS) 활성화
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS 정책 설정
-- ============================================================================

-- 1. companies: 사용자는 자신의 회사 데이터만 접근 가능
CREATE POLICY "Users can only access their own company"
  ON companies FOR ALL
  USING (auth.uid() = user_id);

-- 2. payees: 사용자는 자신의 회사 소속 대상자만 접근 가능
CREATE POLICY "Users can only access their company's payees"
  ON payees FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

-- 3. payments: 사용자는 자신의 회사 소속 지급 내역만 접근 가능
CREATE POLICY "Users can only access their company's payments"
  ON payments FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

-- 4. receipts: 사용자는 자신의 회사 소속 영수증만 접근 가능
CREATE POLICY "Users can only access their company's receipts"
  ON receipts FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- 트리거 함수 및 트리거 설정 (자동 updated_at 갱신)
-- ============================================================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- companies 테이블 트리거
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- payees 테이블 트리거
CREATE TRIGGER update_payees_updated_at 
  BEFORE UPDATE ON payees
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- payments 테이블 트리거
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 영수증 번호 자동 생성 함수
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  sequence_num INT;
  receipt_num TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  
  -- 해당 연도의 마지막 영수증 번호 조회
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(receipt_number FROM 'RCP-' || year_str || '-(\d+)') 
        AS INT
      )
    ), 0
  ) INTO sequence_num
  FROM receipts
  WHERE receipt_number LIKE 'RCP-' || year_str || '-%';
  
  -- 다음 번호 생성
  sequence_num := sequence_num + 1;
  receipt_num := 'RCP-' || year_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_receipt_number() IS '영수증 번호 자동 생성 (예: RCP-2024-0001)';

-- ============================================================================
-- 완료 메시지
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '원천징수 관리 시스템 데이터베이스 스키마 생성 완료';
  RAISE NOTICE '============================================';
  RAISE NOTICE '생성된 테이블:';
  RAISE NOTICE '  - companies (회사 정보)';
  RAISE NOTICE '  - payees (지급 대상자)';
  RAISE NOTICE '  - payments (지급 내역)';
  RAISE NOTICE '  - receipts (영수증 발급 이력)';
  RAISE NOTICE '';
  RAISE NOTICE '보안 설정:';
  RAISE NOTICE '  - Row Level Security (RLS) 활성화';
  RAISE NOTICE '  - 사용자별 데이터 접근 제어';
  RAISE NOTICE '';
  RAISE NOTICE '인덱스: 13개 생성 완료';
  RAISE NOTICE '트리거: 3개 생성 완료';
  RAISE NOTICE '============================================';
END $$;

