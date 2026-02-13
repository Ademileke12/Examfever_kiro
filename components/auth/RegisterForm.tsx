'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthContext } from './AuthProvider'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Get referral code from URL, cookie or local storage
    const getReferralCode = () => {
      // 1. Check URL params first (highest priority)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const refFromUrl = urlParams.get('ref')
        if (refFromUrl) {
          // Update storage if found in URL
          document.cookie = `referral_code=${refFromUrl}; path=/; max-age=2592000` // 30 days
          localStorage.setItem('referral_code', refFromUrl)
          return refFromUrl
        }
      }

      // 2. Check cookie
      const match = document.cookie.match(/(?:^|; )referral_code=([^;]*)/)
      if (match) return match[1]

      // 3. Check local storage
      return typeof window !== 'undefined' ? localStorage.getItem('referral_code') : null
    }

    const referralCode = getReferralCode() || undefined
    if (referralCode) {
      console.log('📝 Signing up with referral code:', referralCode)
    }

    // Log device info for fraud detection (fire and forget)
    // We do this via a separate API call or let the backend handle it
    // For now, the backend will capture IP/headers on the auth request

    const { error } = await signUp({ ...data, referralCode })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  // Effect to capture referral code from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const refFromUrl = urlParams.get('ref')
      if (refFromUrl) {
        console.log('🔗 Captured referral code from URL:', refFromUrl)
        document.cookie = `referral_code=${refFromUrl}; path=/; max-age=2592000` // 30 days
        localStorage.setItem('referral_code', refFromUrl)
      }
    }
  }, [])

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-4 md:p-0">
        <div className="p-8 md:p-6 text-center">
          <div className="mb-6 md:mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 md:h-12 md:w-12 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 md:h-6 md:w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl md:text-lg font-semibold text-gray-900 mb-4 md:mb-2">
            Check your email
          </h3>
          <p className="text-base md:text-sm text-gray-500 leading-relaxed">
            We've sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-0">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 md:gap-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg text-base md:text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px] md:min-h-[auto]"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg text-base md:text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px] md:min-h-[auto]"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-3 md:py-3 border border-gray-300 rounded-lg text-base md:text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px] md:min-h-[auto]"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center py-3 md:py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors min-h-[48px] md:min-h-[auto] ${loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
