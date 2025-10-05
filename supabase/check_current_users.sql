-- 현재 등록된 모든 사용자 확인
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 모든 등록된 사용자 이메일 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'company_name' as company_name,
  confirmation_sent_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. 사용자 수 확인
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. 이메일 확인 상태별 사용자 수
SELECT 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '이메일 확인됨'
    ELSE '이메일 미확인'
  END as email_status,
  COUNT(*) as count
FROM auth.users
GROUP BY email_status;

-- ⚠️ 참고: 패스워드는 보안상 암호화되어 저장되며 조회할 수 없습니다.
-- 테스트용으로 사용한 패스워드를 기억하거나, 패스워드 재설정 기능을 사용하세요.

