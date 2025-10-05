export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            원천징수 관리 시스템
          </h1>
          <p className="text-gray-600">
            사업소득(3.3%) 원천징수 관리 플랫폼
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
