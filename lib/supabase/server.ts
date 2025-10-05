import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * 관리자 전용 Supabase 클라이언트 생성 (Service Role Key 사용)
 * 주의: 이 클라이언트는 RLS를 우회하므로 관리자 API에서만 사용해야 합니다.
 * 쿠키를 사용하지 않는 순수 Service Role 클라이언트입니다.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      '⚠️ NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      '⚠️ SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.\n' +
      'Supabase Dashboard → Settings → API → service_role key를 복사하여 .env.local에 추가하세요.'
    )
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

