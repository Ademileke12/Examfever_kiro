# Feature: User Authentication with Supabase

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement a comprehensive user authentication system using Supabase Auth that provides secure login, registration, password recovery, and session management. The system will support email/password authentication with optional social login providers, protected routes, and seamless integration with the exam system for user-specific data and progress tracking.

## User Story

As a student using the Exam Fever Simulator
I want to create an account and securely log in
So that I can save my exam progress, track my performance over time, and access my uploaded PDFs and generated exams from any device

## Problem Statement

The application needs a secure, scalable authentication system that allows users to create accounts, log in securely, recover passwords, and maintain sessions across devices. The system must integrate seamlessly with the exam interface and PDF upload functionality while providing a smooth user experience.

## Solution Statement

Build a robust authentication system using Supabase Auth with Next.js 14 App Router, implementing secure session management with HTTP-only cookies, protected routes with middleware, and a complete authentication flow including registration, login, password recovery, and profile management. The system will use Row Level Security (RLS) for data protection and provide seamless integration with exam and PDF features.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium-High
**Primary Systems Affected**: Authentication system, protected routes, user data management, session handling
**Dependencies**: Supabase Auth, Next.js middleware, cookie management, form validation

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

Currently this is a template project with no existing application code. The following files need to be created based on the project structure defined in steering documents:

- `.kiro/steering/structure.md` - Contains the complete Next.js project structure to follow
- `.kiro/steering/tech.md` - Contains technical architecture and patterns
- `.kiro/steering/product.md` - Contains product requirements and user journey

### New Files to Create

**Authentication Components:**
- `components/auth/LoginForm.tsx` - Login form with validation and error handling
- `components/auth/RegisterForm.tsx` - Registration form with email verification
- `components/auth/ForgotPasswordForm.tsx` - Password recovery form
- `components/auth/ResetPasswordForm.tsx` - Password reset form
- `components/auth/AuthProvider.tsx` - Authentication context provider
- `components/auth/ProtectedRoute.tsx` - Route protection wrapper
- `components/auth/UserProfile.tsx` - User profile management component

**Authentication Pages:**
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/register/page.tsx` - Registration page
- `app/(auth)/forgot-password/page.tsx` - Password recovery page
- `app/(auth)/reset-password/page.tsx` - Password reset page
- `app/(auth)/layout.tsx` - Authentication layout

**API Routes:**
- `app/api/auth/callback/route.ts` - OAuth callback handler
- `app/api/auth/signout/route.ts` - Sign out handler
- `app/api/auth/verify/route.ts` - Email verification handler

**Utilities and Hooks:**
- `lib/supabase/auth.ts` - Authentication utilities and helpers
- `lib/supabase/middleware.ts` - Middleware utilities for session management
- `hooks/useAuth.ts` - Authentication state management hook
- `hooks/useUser.ts` - User data management hook
- `middleware.ts` - Next.js middleware for route protection

**Types:**
- `types/auth.ts` - Authentication-related type definitions
- `types/user.ts` - User profile type definitions

**Database:**
- `supabase/migrations/001_auth_setup.sql` - Database schema for user profiles
- `supabase/migrations/002_rls_policies.sql` - Row Level Security policies

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
  - Specific section: Cookie-based session management and middleware setup
  - Why: Official guide for Next.js 14 App Router integration with Supabase Auth
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
  - Specific section: Route protection and session validation
  - Why: Essential for implementing protected routes and session management
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
  - Specific section: User-based data access policies
  - Why: Critical for securing user data and exam results
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
  - Specific section: Server-side authentication and session handling
  - Why: Best practices for secure authentication in Next.js applications

### Patterns to Follow

**Authentication Flow Pattern:**
```typescript
// Login flow
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    setError(error.message);
    return;
  }
  
  router.push('/dashboard');
};
```

**Protected Route Pattern:**
```typescript
// Middleware protection
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({ request });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

**Auth Context Pattern:**
```typescript
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({});
```

**Form Validation Pattern:**
```typescript
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

---

## IMPLEMENTATION PLAN

### Phase 1: Supabase Setup & Configuration

Set up Supabase project, configure authentication providers, and establish database schema with Row Level Security.

**Tasks:**
- Configure Supabase project and authentication settings
- Set up database schema for user profiles and exam data
- Implement Row Level Security policies
- Configure environment variables and client setup

### Phase 2: Core Authentication System

Build the fundamental authentication components and utilities for login, registration, and session management.

**Tasks:**
- Create Supabase client configurations for server and client
- Implement authentication utilities and helpers
- Build authentication context and state management
- Create middleware for route protection

### Phase 3: Authentication UI Components

Develop the user interface components for authentication flows with proper validation and error handling.

**Tasks:**
- Build login and registration forms with validation
- Create password recovery and reset components
- Implement user profile management interface
- Add loading states and error handling

### Phase 4: Protected Routes & Integration

Implement route protection, authentication pages, and integrate with existing exam and PDF features.

**Tasks:**
- Create authentication pages and layouts
- Implement middleware for route protection
- Add authentication checks to exam and upload features
- Build user dashboard and profile management

### Phase 5: Testing & Security Hardening

Comprehensive testing, security validation, and performance optimization of the authentication system.

**Tasks:**
- Implement comprehensive test coverage
- Security audit and vulnerability testing
- Performance optimization and caching
- Documentation and deployment preparation

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE .env.local (auth variables)

- **IMPLEMENT**: Add Supabase authentication environment variables
- **PATTERN**: Standard Supabase environment variable configuration
- **IMPORTS**: None required
- **GOTCHA**: Use NEXT_PUBLIC_ prefix only for client-side variables
- **VALIDATE**: `echo $NEXT_PUBLIC_SUPABASE_URL && echo $SUPABASE_SERVICE_ROLE_KEY`

### CREATE types/auth.ts

- **IMPLEMENT**: TypeScript interfaces for authentication data structures
- **PATTERN**: Interface-based type definitions with Supabase Auth types
- **IMPORTS**: @supabase/supabase-js types
- **GOTCHA**: Include all necessary fields for auth state and user data
- **VALIDATE**: `npx tsc --noEmit`

### CREATE types/user.ts

- **IMPLEMENT**: User profile and data type definitions
- **PATTERN**: Interface-based type definitions with database schema alignment
- **IMPORTS**: Supabase database types
- **GOTCHA**: Align with database schema and include all profile fields
- **VALIDATE**: `npx tsc --noEmit`

### CREATE lib/supabase/auth.ts

- **IMPLEMENT**: Authentication utilities and helper functions
- **PATTERN**: Utility functions with proper error handling and typing
- **IMPORTS**: @supabase/supabase-js, auth types
- **GOTCHA**: Handle both server and client-side authentication scenarios
- **VALIDATE**: Test authentication utilities with mock data

### CREATE lib/supabase/middleware.ts

- **IMPLEMENT**: Middleware utilities for session management and route protection
- **PATTERN**: Middleware helper functions with session validation
- **IMPORTS**: @supabase/auth-helpers-nextjs, Next.js types
- **GOTCHA**: Handle session refresh and cookie management properly
- **VALIDATE**: Test middleware utilities with mock requests

### CREATE hooks/useAuth.ts

- **IMPLEMENT**: Authentication state management hook
- **PATTERN**: Custom hook with auth state and methods
- **IMPORTS**: React hooks, Supabase client, auth types
- **GOTCHA**: Handle loading states and session persistence
- **VALIDATE**: Test hook with React Testing Library

### CREATE hooks/useUser.ts

- **IMPLEMENT**: User data management hook with profile operations
- **PATTERN**: Custom hook with user data fetching and updates
- **IMPORTS**: React hooks, Supabase client, user types
- **GOTCHA**: Handle user profile updates and data synchronization
- **VALIDATE**: Test user data operations and state management

### CREATE components/auth/AuthProvider.tsx

- **IMPLEMENT**: Authentication context provider with session management
- **PATTERN**: React context provider with auth state and methods
- **IMPORTS**: React context, auth hook, Supabase client
- **GOTCHA**: Handle initial session loading and state hydration
- **VALIDATE**: Test provider wrapping and context access

### CREATE components/auth/LoginForm.tsx

- **IMPLEMENT**: Login form with validation and error handling
- **PATTERN**: Form component with validation using react-hook-form and zod
- **IMPORTS**: react-hook-form, zod, auth utilities, UI components
- **GOTCHA**: Handle form validation, loading states, and error display
- **VALIDATE**: Test form submission and validation scenarios

### CREATE components/auth/RegisterForm.tsx

- **IMPLEMENT**: Registration form with email verification
- **PATTERN**: Form component with validation and email confirmation
- **IMPORTS**: react-hook-form, zod, auth utilities, UI components
- **GOTCHA**: Handle email verification flow and confirmation states
- **VALIDATE**: Test registration flow and email verification

### CREATE components/auth/ForgotPasswordForm.tsx

- **IMPLEMENT**: Password recovery form with email sending
- **PATTERN**: Form component with email validation and success feedback
- **IMPORTS**: react-hook-form, zod, auth utilities, UI components
- **GOTCHA**: Handle password reset email sending and user feedback
- **VALIDATE**: Test password recovery flow and email sending

### CREATE components/auth/ResetPasswordForm.tsx

- **IMPLEMENT**: Password reset form with token validation
- **PATTERN**: Form component with password validation and token handling
- **IMPORTS**: react-hook-form, zod, auth utilities, UI components
- **GOTCHA**: Handle token validation and password strength requirements
- **VALIDATE**: Test password reset with valid and invalid tokens

### CREATE components/auth/ProtectedRoute.tsx

- **IMPLEMENT**: Route protection wrapper component
- **PATTERN**: HOC component with authentication checks and redirects
- **IMPORTS**: auth hook, Next.js router, loading components
- **GOTCHA**: Handle loading states and redirect logic properly
- **VALIDATE**: Test route protection with authenticated and unauthenticated users

### CREATE components/auth/UserProfile.tsx

- **IMPLEMENT**: User profile management component
- **PATTERN**: Profile component with form validation and update functionality
- **IMPORTS**: react-hook-form, user hook, UI components
- **GOTCHA**: Handle profile updates and avatar upload functionality
- **VALIDATE**: Test profile updates and data persistence

### CREATE middleware.ts

- **IMPLEMENT**: Next.js middleware for route protection and session management
- **PATTERN**: Middleware function with session validation and redirects
- **IMPORTS**: Next.js middleware types, Supabase middleware utilities
- **GOTCHA**: Handle session refresh and proper redirect logic
- **VALIDATE**: Test middleware with protected and public routes

### CREATE app/(auth)/layout.tsx

- **IMPLEMENT**: Authentication layout with centered design
- **PATTERN**: Layout component with authentication-specific styling
- **IMPORTS**: UI components, theme provider
- **GOTCHA**: Include proper responsive design and theme support
- **VALIDATE**: Test layout rendering and responsive behavior

### CREATE app/(auth)/login/page.tsx

- **IMPLEMENT**: Login page with form and social login options
- **PATTERN**: Page component with login form and OAuth providers
- **IMPORTS**: login form component, auth utilities
- **GOTCHA**: Handle OAuth redirects and error states
- **VALIDATE**: Navigate to /login and test authentication flow

### CREATE app/(auth)/register/page.tsx

- **IMPLEMENT**: Registration page with form and email verification
- **PATTERN**: Page component with registration form and verification flow
- **IMPORTS**: register form component, auth utilities
- **GOTCHA**: Handle email verification and confirmation states
- **VALIDATE**: Navigate to /register and test registration flow

### CREATE app/(auth)/forgot-password/page.tsx

- **IMPLEMENT**: Password recovery page with email form
- **PATTERN**: Page component with password recovery form
- **IMPORTS**: forgot password form component
- **GOTCHA**: Handle success states and user feedback
- **VALIDATE**: Navigate to /forgot-password and test recovery flow

### CREATE app/(auth)/reset-password/page.tsx

- **IMPLEMENT**: Password reset page with token validation
- **PATTERN**: Page component with password reset form and token handling
- **IMPORTS**: reset password form component, auth utilities
- **GOTCHA**: Handle token validation and expiration
- **VALIDATE**: Test password reset with valid reset tokens

### CREATE app/api/auth/callback/route.ts

- **IMPLEMENT**: OAuth callback handler for social login providers
- **PATTERN**: API route with OAuth callback processing
- **IMPORTS**: Supabase auth helpers, Next.js response utilities
- **GOTCHA**: Handle OAuth state validation and error cases
- **VALIDATE**: Test OAuth callback with different providers

### CREATE app/api/auth/signout/route.ts

- **IMPLEMENT**: Sign out API route with session cleanup
- **PATTERN**: API route with session termination and cookie cleanup
- **IMPORTS**: Supabase auth helpers, Next.js response utilities
- **GOTCHA**: Ensure complete session cleanup and redirect handling
- **VALIDATE**: Test sign out functionality and session cleanup

### CREATE app/api/auth/verify/route.ts

- **IMPLEMENT**: Email verification handler
- **PATTERN**: API route with email verification token processing
- **IMPORTS**: Supabase auth helpers, verification utilities
- **GOTCHA**: Handle verification token validation and user feedback
- **VALIDATE**: Test email verification with valid and invalid tokens

### CREATE supabase/migrations/001_auth_setup.sql

- **IMPLEMENT**: Database schema for user profiles and authentication
- **PATTERN**: SQL migration with user profile tables and constraints
- **IMPORTS**: None required
- **GOTCHA**: Include proper foreign key relationships and indexes
- **VALIDATE**: `supabase db push` and verify schema creation

### CREATE supabase/migrations/002_rls_policies.sql

- **IMPLEMENT**: Row Level Security policies for user data protection
- **PATTERN**: RLS policies with user-based access control
- **IMPORTS**: None required
- **GOTCHA**: Ensure policies cover all CRUD operations and edge cases
- **VALIDATE**: Test RLS policies with different user scenarios

### UPDATE app/layout.tsx

- **IMPLEMENT**: Add authentication provider to root layout
- **PATTERN**: Root layout with authentication context wrapping
- **IMPORTS**: auth provider, theme provider
- **GOTCHA**: Ensure proper provider ordering and hydration
- **VALIDATE**: Test authentication state across page navigation

### CREATE app/dashboard/page.tsx

- **IMPLEMENT**: User dashboard with authentication protection
- **PATTERN**: Protected page with user data and navigation
- **IMPORTS**: protected route wrapper, user components
- **GOTCHA**: Handle loading states and user data fetching
- **VALIDATE**: Navigate to /dashboard and test authentication protection

### UPDATE components/exam/ExamInterface.tsx (if exists)

- **IMPLEMENT**: Add user authentication checks to exam interface
- **PATTERN**: Component with authentication state integration
- **IMPORTS**: auth hook, user data
- **GOTCHA**: Handle unauthenticated users and data persistence
- **VALIDATE**: Test exam interface with authenticated and unauthenticated users

---

## TESTING STRATEGY

### Unit Tests

**Framework**: Jest with React Testing Library for component testing
**Scope**: Authentication components, hooks, and utility functions
**Coverage**: Minimum 90% coverage for critical authentication logic

Design unit tests with comprehensive scenarios:
- Test authentication forms with valid and invalid inputs
- Verify authentication state management and transitions
- Test protected route behavior with different auth states
- Validate error handling and loading states
- Test middleware functionality with mock requests

### Integration Tests

**Framework**: Playwright for end-to-end authentication flows
**Scope**: Complete authentication workflows across pages
**Coverage**: Registration, login, password recovery, profile management

### Security Tests

**Framework**: Custom security testing with penetration testing tools
**Scope**: Authentication vulnerabilities and session security
**Coverage**: SQL injection, XSS, CSRF, session hijacking, brute force attacks

### Edge Cases

**Authentication Edge Cases:**
- Expired sessions and token refresh
- Concurrent login attempts
- Email verification edge cases
- Password reset token expiration
- OAuth provider failures

**Session Management Edge Cases:**
- Browser refresh during authentication
- Multiple tab authentication
- Network interruptions during auth
- Session persistence across devices

**Security Edge Cases:**
- Malicious token manipulation
- Session fixation attacks
- Brute force login attempts
- Email enumeration attacks

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript compilation
npx tsc --noEmit

# ESLint checking
npx eslint . --ext .ts,.tsx

# Prettier formatting
npx prettier --check .

# Supabase type generation
npx supabase gen types typescript --local > types/supabase.ts
```

### Level 2: Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test -- --testPathPattern=auth
npm run test -- --testPathPattern=middleware
npm run test -- --testPathPattern=hooks
```

### Level 3: Integration Tests

```bash
# Start development server
npm run dev

# Start Supabase local development
npx supabase start

# Run Playwright tests
npx playwright test

# Run specific authentication test suites
npx playwright test --grep "authentication flow"
npx playwright test --grep "protected routes"
npx playwright test --grep "password recovery"
```

### Level 4: Security Testing

```bash
# Run security audit
npm audit

# Test authentication endpoints
curl -X POST http://localhost:3000/api/auth/signout

# Validate session management
curl -H "Cookie: sb-access-token=invalid" http://localhost:3000/dashboard

# Test rate limiting (if implemented)
for i in {1..10}; do curl -X POST http://localhost:3000/api/auth/login; done
```

### Level 5: Database Testing

```bash
# Test database migrations
npx supabase db reset

# Validate RLS policies
npx supabase test db

# Check database schema
npx supabase db diff

# Test user data isolation
npx supabase sql --file test-rls-policies.sql
```

### Level 6: Manual Validation

**Authentication Flow Testing:**
- Navigate to `/register` and create new account
- Verify email confirmation process
- Test login with valid and invalid credentials
- Test password recovery flow
- Verify protected route access
- Test logout functionality

**Session Management Testing:**
- Test session persistence across browser refresh
- Verify session expiration handling
- Test concurrent sessions in multiple tabs
- Validate session cleanup on logout

**Security Testing:**
- Test with disabled JavaScript
- Verify CSRF protection
- Test with malformed authentication tokens
- Validate rate limiting on authentication endpoints

---

## ACCEPTANCE CRITERIA

- [ ] Users can register with email and password
- [ ] Email verification is required for account activation
- [ ] Users can log in with valid credentials
- [ ] Password recovery works via email reset links
- [ ] Sessions persist across browser refreshes
- [ ] Protected routes redirect unauthenticated users to login
- [ ] User profiles can be viewed and updated
- [ ] Logout functionality clears sessions completely
- [ ] Authentication state is consistent across components
- [ ] Form validation provides clear error messages
- [ ] Loading states are displayed during authentication operations
- [ ] Social login providers work correctly (if implemented)
- [ ] Row Level Security protects user data
- [ ] Authentication works on both desktop and mobile
- [ ] Session management handles edge cases gracefully
- [ ] Security best practices are implemented throughout

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration + security)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms all authentication flows work
- [ ] Acceptance criteria all met
- [ ] Code reviewed for security vulnerabilities
- [ ] Database migrations and RLS policies tested
- [ ] Performance optimized for authentication operations
- [ ] Documentation updated for authentication system
- [ ] Error handling covers all edge cases

---

## NOTES

**Security Considerations:**
- All authentication uses HTTPS in production
- Passwords are hashed using Supabase's secure methods
- Sessions use HTTP-only cookies for security
- Row Level Security protects all user data
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks

**Performance Optimizations:**
- Authentication state is cached appropriately
- Database queries are optimized with proper indexes
- Session validation is efficient with minimal overhead
- Client-side routing avoids unnecessary redirects
- Loading states provide immediate user feedback

**User Experience:**
- Clear error messages for all authentication failures
- Smooth transitions between authentication states
- Responsive design works on all devices
- Accessibility features for screen readers
- Progressive enhancement for JavaScript-disabled browsers

**Integration Points:**
- Authentication integrates with exam system for user progress
- PDF uploads are associated with authenticated users
- User profiles store exam history and preferences
- Dashboard provides overview of user activity

**Future Enhancements:**
- Two-factor authentication (2FA) support
- Social login providers (Google, GitHub, etc.)
- Advanced user roles and permissions
- Single Sign-On (SSO) integration
- Advanced session management features
- User activity logging and analytics
