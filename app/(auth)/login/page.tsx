import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            create a new account
          </Link>
        </p>
      </div>

      <LoginForm />

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  )
}
