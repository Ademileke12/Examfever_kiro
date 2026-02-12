import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfile } from '@/components/auth/UserProfile'
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard'

function ProfileContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            My Account
          </h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Manage your profile and affiliate earnings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
            <UserProfile />
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
            <AffiliateDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
