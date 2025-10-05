-- lipsciencelip@gmail.com 사용자 정보 확인
-- Supabase SQL Editor에서 실행하세요

-- 1. Auth 사용자 정보 확인
SELECT 
  id as user_id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  raw_user_meta_data->>'company_name' as company_name_from_metadata
FROM auth.users 
WHERE email = 'lipsciencelip@gmail.com';

-- 2. Companies 테이블에 회사 정보가 있는지 확인
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  c.id as company_id,
  c.company_name,
  c.business_number,
  c.representative_name,
  c.address,
  c.contact,
  c.email as company_email,
  c.created_at as company_created_at
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
WHERE u.email = 'lipsciencelip@gmail.com';

-- 3. 모든 사용자 목록 확인 (비교용)
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  c.company_name,
  c.business_number,
  c.representative_name,
  c.created_at as company_created_at
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
ORDER BY u.created_at DESC;

-- 4. lipsciencelip@gmail.com 사용자에게 회사 정보 추가하기
-- (위 쿼리로 user_id를 확인한 후, 아래 INSERT 문의 user_id를 교체하세요)
/*
INSERT INTO companies (
  user_id,
  business_number,
  company_name,
  representative_name
)
VALUES (
  '여기에-user-id-입력',  -- 위에서 확인한 user_id
  '회사-사업자번호',      -- 실제 사업자번호 입력
  '회사명',              -- 실제 회사명 입력
  '대표자명'             -- 실제 대표자명 입력
);
*/

