-- 기존 사용자에게 회사 정보 추가하기
-- Supabase SQL Editor에서 실행하세요

-- 1. bleugenellee@gmail.com 사용자의 회사 정보 추가
-- 먼저 user_id 확인
SELECT id, email FROM auth.users WHERE email = 'bleugenellee@gmail.com';

-- 위에서 확인한 user_id를 사용하여 회사 정보 삽입
-- user_id를 실제 값으로 교체하세요
INSERT INTO companies (
  user_id,
  business_number,
  company_name,
  representative_name
)
VALUES (
  '여기에-user-id-입력',  -- auth.users에서 확인한 id
  '1234567890',
  '(주)테스트컴퍼니',
  '홍길동'
)
ON CONFLICT (business_number) DO NOTHING;

-- 2. lipsciencelife@gmail.com 사용자는 이미 회사 정보가 없으므로 건너뜁니다

-- 3. 모든 사용자와 회사 정보 확인
SELECT 
  u.id as user_id,
  u.email,
  c.company_name,
  c.business_number,
  c.representative_name,
  c.created_at as company_created_at
FROM auth.users u
LEFT JOIN companies c ON c.user_id = u.id
ORDER BY u.created_at DESC;

