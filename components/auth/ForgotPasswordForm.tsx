'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthContext } from './AuthProvider'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error } = await resetPassword(data.email)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '3rem',
              width: '3rem',
              borderRadius: '50%',
              backgroundColor: '#dcfce7'
            }}>
              <svg style={{ height: '1.5rem', width: '1.5rem', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
            Check your email
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            We've sent you a password reset link. Please check your email and follow the instructions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label 
            htmlFor="email" 
            style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}
          >
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              color: '#000000',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            placeholder="Enter your email"
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb'
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
              e.target.style.boxShadow = 'none'
            }}
          />
          {errors.email && (
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            fontSize: '0.875rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem'
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
            padding: '0.75rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'white',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            opacity: loading ? 0.5 : 1
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
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
