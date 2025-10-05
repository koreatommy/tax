import { cookies } from 'next/headers'

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    return adminSession?.value === 'authenticated'
  } catch (error) {
    console.error('Admin auth check error:', error)
    return false
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
  } catch (error) {
    console.error('Admin logout error:', error)
  }
}
