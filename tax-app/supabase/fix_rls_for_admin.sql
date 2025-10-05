-- 관리자가 Service Role Key로 companies 테이블을 수정할 수 있도록 RLS 정책 확인 및 수정

-- 1. 현재 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'companies';

-- 2. 기존 정책 확인
-- companies 테이블의 정책: "Users can only access their own company"
-- 이 정책은 일반 사용자용이며, Service Role Key는 RLS를 우회해야 합니다.

-- 3. Service Role이 RLS를 우회하는지 확인
-- Service Role Key를 사용하면 자동으로 RLS를 우회합니다.
-- 하지만 혹시 모를 문제를 위해 다음을 확인:

-- 현재 role 확인
SELECT current_user, current_role;

-- 4. companies 테이블 RLS 상태 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'companies';

-- 5. 문제가 계속되면 임시로 관리자용 정책 추가 (선택사항)
-- 주의: 이 정책은 Service Role을 명시적으로 허용합니다
-- 일반적으로 Service Role은 자동으로 RLS를 우회하므로 필요없을 수 있습니다

/*
-- 관리자(service_role)가 모든 작업을 할 수 있도록 정책 추가
CREATE POLICY "Service role can manage all companies"
  ON companies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
*/

-- 6. 대신 기존 정책을 확인하고 정상적인지 체크
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Companies 테이블 RLS 정책 확인';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Service Role Key를 사용하면 자동으로 RLS를 우회합니다.';
  RAISE NOTICE '만약 에러가 계속되면:';
  RAISE NOTICE '1. .env.local의 SUPABASE_SERVICE_ROLE_KEY가 올바른지 확인';
  RAISE NOTICE '2. createAdminClient()가 Service Role Key를 사용하는지 확인';
  RAISE NOTICE '3. Supabase 대시보드에서 API 키를 다시 확인';
  RAISE NOTICE '============================================';
END $$;

