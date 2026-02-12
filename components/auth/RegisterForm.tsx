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
  const [isMobile, setIsMobile] = useState(false)
  const { signUp } = useAuthContext()

  // Check for mobile on client side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

    // Get referral code from cookie or local storage
    const getReferralCode = () => {
      const match = document.cookie.match(/(?:^|; )referral_code=([^;]*)/)
      return match ? match[1] : localStorage.getItem('referral_code')
    }

    const referralCode = getReferralCode() || undefined
    if (referralCode) {
      console.log('📝 Signing up with referral code:', referralCode)
    }

    const { error } = await signUp({ ...data, referralCode })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '0'
      }}>
        <div style={{ padding: isMobile ? '2rem 1.5rem' : '1.5rem', textAlign: 'center' }}>
          <div style={{ marginBottom: isMobile ? '1.5rem' : '1rem' }}>
            <div style={{
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: isMobile ? '4rem' : '3rem',
              width: isMobile ? '4rem' : '3rem',
              borderRadius: '50%',
              backgroundColor: '#dcfce7'
            }}>
              <svg style={{
                height: isMobile ? '2rem' : '1.5rem',
                width: isMobile ? '2rem' : '1.5rem',
                color: '#16a34a'
              }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 style={{
            fontSize: isMobile ? '1.25rem' : '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: isMobile ? '1rem' : '0.5rem'
          }}>
            Check your email
          </h3>
          <p style={{
            fontSize: isMobile ? '1rem' : '0.875rem',
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            We've sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
        </div>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '1rem 1rem' : '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: isMobile ? '1rem' : '0.875rem',
    backgroundColor: 'white',
    color: '#000000',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    minHeight: isMobile ? '44px' : 'auto'
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#2563eb'
    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#d1d5db'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '28rem',
      margin: '0 auto',
      padding: isMobile ? '1rem' : '0'
    }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1.25rem' : '1.5rem'
      }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            style={inputStyle}
            placeholder="Enter your email"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {errors.email && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
              color: '#dc2626'
            }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            style={inputStyle}
            placeholder="Enter your password"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {errors.password && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
              color: '#dc2626'
            }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}
          >
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            style={inputStyle}
            placeholder="Confirm your password"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {errors.confirmPassword && (
            <p style={{
              marginTop: '0.5rem',
              fontSize: isMobile ? '0.875rem' : '0.875rem',
              color: '#dc2626'
            }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            padding: isMobile ? '1rem' : '0.75rem',
            fontSize: isMobile ? '0.875rem' : '0.875rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '1rem 1rem' : '0.75rem 1rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: isMobile ? '1rem' : '0.875rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            opacity: loading ? 0.5 : 1,
            minHeight: isMobile ? '44px' : 'auto'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
            }
          }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
