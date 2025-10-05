-- ============================================================================
-- 더미 데이터 생성 (테스트용)
-- 생성일: 2025-10-04
-- ============================================================================

-- 현재 로그인한 사용자의 회사 정보가 있는지 확인하고 없으면 생성
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_payee1_id UUID;
  v_payee2_id UUID;
  v_payee3_id UUID;
  v_payment1_id UUID;
  v_payment2_id UUID;
  v_payment3_id UUID;
BEGIN
  -- 현재 인증된 사용자 ID 가져오기
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '로그인된 사용자가 없습니다. 먼저 로그인하세요.';
  END IF;

  -- 1. 회사 정보 생성 (이미 있으면 기존 것 사용)
  SELECT id INTO v_company_id FROM companies WHERE user_id = v_user_id LIMIT 1;
  
  IF v_company_id IS NULL THEN
    INSERT INTO companies (
      user_id, 
      business_number, 
      company_name, 
      representative_name, 
      address, 
      contact, 
      email
    )
    VALUES (
      v_user_id,
      '1234567890',
      '(주)테스트컴퍼니',
      '홍길동',
      '서울특별시 강남구 테헤란로 123',
      '02-1234-5678',
      'test@company.com'
    )
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE '회사 정보가 생성되었습니다: %', v_company_id;
  ELSE
    RAISE NOTICE '기존 회사 정보를 사용합니다: %', v_company_id;
  END IF;

  -- 2. 지급 대상자 3명 생성
  
  -- 대상자 1: 프리랜서 개발자
  INSERT INTO payees (
    company_id,
    name,
    resident_number_encrypted,
    address,
    contact,
    email,
    bank_name,
    account_number_encrypted,
    business_type,
    is_active
  )
  VALUES (
    v_company_id,
    '김철수',
    'ENC_900101-1234567',  -- 암호화된 주민번호 (더미)
    '서울특별시 서초구 서초대로 456',
    '010-1234-5678',
    'kim.cs@example.com',
    '신한은행',
    'ENC_110-123-456789',  -- 암호화된 계좌번호 (더미)
    '프리랜서',
    true
  )
  RETURNING id INTO v_payee1_id;
  
  -- 대상자 2: 강사
  INSERT INTO payees (
    company_id,
    name,
    resident_number_encrypted,
    address,
    contact,
    email,
    bank_name,
    account_number_encrypted,
    business_type,
    is_active
  )
  VALUES (
    v_company_id,
    '이영희',
    'ENC_850505-2345678',
    '서울특별시 마포구 마포대로 789',
    '010-9876-5432',
    'lee.yh@example.com',
    '국민은행',
    'ENC_123-456-789012',
    '강사',
    true
  )
  RETURNING id INTO v_payee2_id;
  
  -- 대상자 3: 외주 디자이너
  INSERT INTO payees (
    company_id,
    name,
    resident_number_encrypted,
    address,
    contact,
    email,
    bank_name,
    account_number_encrypted,
    business_type,
    is_active
  )
  VALUES (
    v_company_id,
    '박민수',
    'ENC_920815-1567890',
    '서울특별시 송파구 올림픽로 321',
    '010-5555-1234',
    'park.ms@example.com',
    '우리은행',
    'ENC_1002-567-890123',
    '디자이너',
    true
  )
  RETURNING id INTO v_payee3_id;

  RAISE NOTICE '지급 대상자 3명이 생성되었습니다.';

  -- 3. 지급 내역 생성
  
  -- 지급 1: 김철수에게 100만원 (9월)
  INSERT INTO payments (
    company_id,
    payee_id,
    payment_date,
    payment_amount,
    income_tax,
    local_income_tax,
    total_tax,
    net_amount,
    payment_reason,
    receipt_issued
  )
  VALUES (
    v_company_id,
    v_payee1_id,
    '2024-09-30',
    1000000.00,   -- 지급액
    30000.00,     -- 소득세 3%
    3000.00,      -- 지방소득세 0.3%
    33000.00,     -- 총 세액 3.3%
    967000.00,    -- 실지급액
    '2024년 9월 웹사이트 개발',
    false
  )
  RETURNING id INTO v_payment1_id;
  
  -- 지급 2: 이영희에게 200만원 (9월)
  INSERT INTO payments (
    company_id,
    payee_id,
    payment_date,
    payment_amount,
    income_tax,
    local_income_tax,
    total_tax,
    net_amount,
    payment_reason,
    receipt_issued
  )
  VALUES (
    v_company_id,
    v_payee2_id,
    '2024-09-30',
    2000000.00,
    60000.00,
    6000.00,
    66000.00,
    1934000.00,
    '2024년 9월 프로그래밍 강의료',
    false
  )
  RETURNING id INTO v_payment2_id;
  
  -- 지급 3: 박민수에게 150만원 (10월)
  INSERT INTO payments (
    company_id,
    payee_id,
    payment_date,
    payment_amount,
    income_tax,
    local_income_tax,
    total_tax,
    net_amount,
    payment_reason,
    receipt_issued
  )
  VALUES (
    v_company_id,
    v_payee3_id,
    '2024-10-01',
    1500000.00,
    45000.00,
    4500.00,
    49500.00,
    1450500.00,
    '2024년 10월 UI/UX 디자인 작업',
    false
  )
  RETURNING id INTO v_payment3_id;

  RAISE NOTICE '지급 내역 3건이 생성되었습니다.';
  RAISE NOTICE '============================================';
  RAISE NOTICE '더미 데이터 생성 완료!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '회사: (주)테스트컴퍼니';
  RAISE NOTICE '대상자: 김철수, 이영희, 박민수';
  RAISE NOTICE '지급 내역: 3건 (총 450만원)';
  RAISE NOTICE '============================================';
  
END $$;



