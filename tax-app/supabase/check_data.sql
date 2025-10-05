-- 사용자 및 회사 정보 확인 쿼리
-- Supabase SQL Editor에서 실행하세요

-- 1. Auth 사용자 목록
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'company_name' as company_name_from_metadata
FROM auth.users
ORDER BY created_at DESC;

-- 2. Companies 테이블 데이터
SELECT * FROM companies ORDER BY created_at DESC;

-- 3. 사용자와 회사 정보 조인
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  c.id as company_id,
  c.company_name,
  c.business_number,
  c.representative_name,
  c.created_at as company_created_at
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
ORDER BY u.created_at DESC;

-- 4. 특정 이메일로 검색
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data,
  c.*
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
WHERE u.email IN ('lipsciencelife@gmail.com', 'bleugenellee@gmail.com');

