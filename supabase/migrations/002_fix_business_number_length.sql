-- 사업자등록번호 필드 길이 확장
-- 작성일: 2025-10-05

-- business_number 필드를 VARCHAR(10)에서 VARCHAR(12)로 확장
-- 포맷팅된 사업자등록번호 (000-00-00000)를 저장하기 위해

ALTER TABLE companies 
ALTER COLUMN business_number TYPE VARCHAR(12);

-- 업데이트된 컬럼 설명
COMMENT ON COLUMN companies.business_number IS '사업자등록번호 (포맷팅: 000-00-00000)';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'business_number 필드 길이 확장 완료';
  RAISE NOTICE 'VARCHAR(10) -> VARCHAR(12)';
  RAISE NOTICE '============================================';
END $$;
