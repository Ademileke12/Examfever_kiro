import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
          Reset your password
        </h2>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />

      <div style={{ textAlign: 'center' }}>
        <Link
          href="/login"
          style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none' }}
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
