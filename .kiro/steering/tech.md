# Technical Architecture

## Technology Stack
**Frontend**: Next.js 14+ with App Router, React 18, TypeScript
**Styling**: Tailwind CSS for responsive design and component styling
**Backend**: Next.js API routes for serverless backend functionality
**Database**: Supabase PostgreSQL for user data, exam history, and analytics
**Authentication**: Supabase Auth with email/password and social login options
**AI Processing**: Google Gemini 1.5 Flash for PDF analysis and question generation
**File Storage**: Supabase Storage for PDF uploads and management
**Deployment**: Vercel for seamless Next.js deployment and edge functions

## Architecture Overview
**Client-Side Rendering**: Next.js App Router with React Server Components
**API Layer**: Next.js API routes handling PDF processing, AI integration, and database operations
**Database Layer**: Supabase PostgreSQL with real-time subscriptions for live updates
**AI Pipeline**: PDF text extraction → Gemini 1.5 Flash analysis → Question generation → Storage
**Authentication Flow**: Supabase Auth with JWT tokens and session management
**File Processing**: Client upload → Supabase Storage → Server-side PDF parsing → AI analysis

## Development Environment
**Node.js**: Version 18+ for Next.js compatibility
**Package Manager**: npm or yarn for dependency management
**Development Server**: Next.js dev server with hot reload
**Environment Variables**: `.env.local` for API keys and database URLs
**Code Editor**: VS Code with TypeScript, Tailwind CSS, and Prettier extensions

## Code Standards
**TypeScript**: Strict mode enabled for type safety
**ESLint**: Next.js recommended rules with custom configurations
**Prettier**: Consistent code formatting across the project
**File Naming**: kebab-case for components, camelCase for utilities
**Component Structure**: Functional components with TypeScript interfaces
**API Routes**: RESTful conventions with proper HTTP status codes

## Testing Strategy
**Unit Testing**: Jest and React Testing Library for component testing
**Integration Testing**: API route testing with mock Supabase and Gemini calls
**E2E Testing**: Playwright for critical user flows (upload, exam taking, results)
**Type Checking**: TypeScript compiler for compile-time error detection
**Code Coverage**: Minimum 80% coverage for critical business logic

## Deployment Process
**Version Control**: Git with feature branches and pull request workflow
**CI/CD**: GitHub Actions for automated testing and deployment
**Staging Environment**: Vercel preview deployments for testing
**Production Deployment**: Automatic deployment to Vercel on main branch merge
**Environment Management**: Separate Supabase projects for development and production

## Performance Requirements
**Page Load**: < 2 seconds for initial page load
**PDF Processing**: < 30 seconds for typical study material PDFs
**Question Generation**: < 60 seconds for generating 20-50 questions
**Database Queries**: < 500ms for user data and exam history retrieval
**Concurrent Users**: Support 100+ simultaneous exam sessions

## Security Considerations
**Authentication**: Supabase Auth with secure JWT token management
**Data Protection**: Row Level Security (RLS) in Supabase for user data isolation
**API Security**: Rate limiting and input validation on all API endpoints
**File Upload**: PDF validation, size limits, and malware scanning
**Environment Variables**: Secure storage of API keys and database credentials
**HTTPS**: SSL/TLS encryption for all client-server communication
