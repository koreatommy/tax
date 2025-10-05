import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인된 사용자는 대시보드로
  if (user) {
    redirect('/dashboard')
  }

  // 미로그인 사용자는 로그인 페이지로
  redirect('/login')
}
