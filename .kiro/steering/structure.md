# Project Structure

## Directory Layout
```
exam-fever-simulator/
├── app/                          # Next.js App Router pages and layouts
│   ├── (auth)/                   # Authentication routes
│   ├── dashboard/                # User dashboard and exam management
│   ├── exam/                     # Exam taking interface
│   ├── results/                  # Exam results and analytics
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── pdf/                  # PDF processing endpoints
│   │   ├── exams/                # Exam management endpoints
│   │   └── gemini/               # AI processing endpoints
│   ├── globals.css               # Global styles and Tailwind imports
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components (buttons, inputs, etc.)
│   ├── exam/                     # Exam-specific components
│   ├── upload/                   # PDF upload components
│   └── dashboard/                # Dashboard components
├── lib/                          # Utility functions and configurations
│   ├── supabase/                 # Supabase client and utilities
│   ├── gemini/                   # Gemini AI integration
│   ├── pdf/                      # PDF processing utilities
│   └── utils.ts                  # General utility functions
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
├── tests/                        # Test files
│   ├── __mocks__/                # Mock files for testing
│   ├── components/               # Component tests
│   └── api/                      # API route tests
├── .kiro/                        # Kiro CLI configuration
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## File Naming Conventions
**Components**: PascalCase (e.g., `ExamTimer.tsx`, `UploadButton.tsx`)
**Pages**: kebab-case (e.g., `exam-results.tsx`, `user-dashboard.tsx`)
**Utilities**: camelCase (e.g., `pdfProcessor.ts`, `examGenerator.ts`)
**API Routes**: kebab-case (e.g., `process-pdf.ts`, `generate-questions.ts`)
**Types**: PascalCase with descriptive names (e.g., `ExamQuestion.ts`, `UserProfile.ts`)

## Module Organization
**Feature-Based Structure**: Group related components, hooks, and utilities by feature
**Shared Components**: Reusable UI components in `/components/ui/`
**Business Logic**: Core logic in `/lib/` with clear separation of concerns
**Type Safety**: Centralized type definitions in `/types/` directory
**API Organization**: RESTful API routes grouped by resource type

## Configuration Files
**Environment**: `.env.local` for local development, `.env.example` for template
**Next.js**: `next.config.js` for framework configuration and optimizations
**TypeScript**: `tsconfig.json` with strict mode and path mapping
**Tailwind**: `tailwind.config.js` with custom theme and component classes
**ESLint**: `.eslintrc.json` with Next.js and TypeScript rules
**Prettier**: `.prettierrc` for consistent code formatting

## Documentation Structure
**README.md**: Project overview, setup instructions, and usage guide
**DEVLOG.md**: Development timeline, decisions, and progress tracking
**API Documentation**: Inline JSDoc comments and separate API reference
**Component Documentation**: Storybook or similar for component library
**Deployment Guide**: Step-by-step deployment and environment setup

## Asset Organization
**Images**: `/public/images/` with descriptive names and optimized formats
**Icons**: `/public/icons/` or integrated icon library (Lucide React)
**Fonts**: `/public/fonts/` or Google Fonts integration
**Static Files**: `/public/` for robots.txt, favicon, and other static assets

## Build Artifacts
**Next.js Build**: `.next/` directory (gitignored)
**TypeScript**: Generated JavaScript files (handled by Next.js)
**Tailwind**: Compiled CSS (integrated into Next.js build)
**Vercel**: Build outputs optimized for serverless deployment

## Environment-Specific Files
**Development**: `.env.local` with local Supabase and Gemini API keys
**Staging**: Vercel environment variables for preview deployments
**Production**: Secure environment variables in Vercel dashboard
**Testing**: `.env.test` for test database and mock API configurations
