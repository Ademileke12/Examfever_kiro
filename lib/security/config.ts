// Security configuration and validation utilities

export interface SecurityConfig {
  environment: 'development' | 'production' | 'test'
  requiredEnvVars: string[]
  cspDirectives: Record<string, string[]>
  rateLimits: {
    api: number
    upload: number
    auth: number
  }
}

export const SECURITY_CONFIG: SecurityConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  requiredEnvVars: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'"], // unsafe-eval needed for Next.js
    'style-src': ["'self'", "'unsafe-inline'"], // unsafe-inline needed for CSS-in-JS
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': [
      "'self'", 
      'https://*.supabase.co', 
      'https://api.groq.com', 
      'https://api.xroute.ai'
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  rateLimits: {
    api: 100, // requests per minute
    upload: 10, // uploads per minute
    auth: 5 // auth attempts per minute
  }
}

export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const missing = SECURITY_CONFIG.requiredEnvVars.filter(
    envVar => !process.env[envVar]
  )
  
  return {
    isValid: missing.length === 0,
    missing
  }
}

export function generateCSPHeader(): string {
  return Object.entries(SECURITY_CONFIG.cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

export function isSecureEnvironment(): boolean {
  return SECURITY_CONFIG.environment === 'production'
}

export function validateSecretKey(key: string | undefined): boolean {
  if (!key) return false
  
  // In production, require minimum 32 characters
  if (SECURITY_CONFIG.environment === 'production') {
    return key.length >= 32 && !key.includes('your_') && !key.includes('secret_key_here')
  }
  
  // In development, just check it's not a placeholder
  return !key.includes('your_') && !key.includes('secret_key_here')
}

export class SecurityError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'SecurityError'
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = ['application/pdf']
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 50MB limit' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF files are allowed' }
  }
  
  return { isValid: true }
}