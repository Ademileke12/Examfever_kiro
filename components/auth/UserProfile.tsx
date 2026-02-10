'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthContext } from './AuthProvider'
import { useUser } from '@/hooks/useUser'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function UserProfile() {
  const { user, signOut } = useAuthContext()
  const { profile, updateProfile, loading: userLoading } = useUser(user)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: user?.email || '',
    },
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        email: user?.email || '',
      })
    }
  }, [profile, user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await updateProfile({
      full_name: data.full_name,
    })

    if (error) {
      setError(error)
    } else {
      setMessage('Profile updated successfully!')
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (userLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              {...register('full_name')}
              type="text"
              id="full_name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email cannot be changed
            </p>
          </div>

          {message && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
