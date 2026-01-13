'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthContext } from './AuthProvider'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { signIn } = useAuthContext()
  const router = useRouter()
  
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    const { error } = await signIn(data)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
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
            style={{
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
            }}
            placeholder="Enter your email"
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#2563eb'
              ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#d1d5db'
              ;(e.target as HTMLInputElement).style.boxShadow = 'none'
            }}
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
            style={{
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
            }}
            placeholder="Enter your password"
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#2563eb'
              ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#d1d5db'
              ;(e.target as HTMLInputElement).style.boxShadow = 'none'
            }}
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
