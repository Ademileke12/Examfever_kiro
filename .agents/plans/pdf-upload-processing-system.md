# Feature: PDF Upload and Processing System

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement a comprehensive PDF upload and processing system that allows students to upload their study materials (PDFs) to the Exam Fever Simulator. The system will handle file uploads to Supabase Storage, extract text content from PDFs using AI processing, and prepare the content for question generation by Gemini 1.5 Flash.

## User Story

As a student preparing for exams
I want to upload my PDF study materials (textbooks, notes, handouts)
So that the AI can analyze the content and generate relevant practice questions for my mock exams

## Problem Statement

Students need a way to upload their study materials in PDF format so the system can analyze the content and create personalized practice exams. The current system lacks any file upload capability or PDF processing functionality.

## Solution Statement

Create a secure, efficient PDF upload system with client-side file validation, server-side processing via Next.js API routes, Supabase Storage integration for file management, and PDF text extraction using the pdf-parse library. The system will provide upload progress tracking, file validation, and prepare extracted content for AI analysis.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Frontend upload components, API routes, Supabase Storage, PDF processing pipeline
**Dependencies**: Supabase Storage, pdf-parse library, Next.js API routes, file validation utilities

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

Currently this is a template project with no existing application code. The following files need to be created based on the project structure defined in steering documents:

- `.kiro/steering/structure.md` - Contains the complete Next.js project structure to follow
- `.kiro/steering/tech.md` - Contains technical architecture and patterns
- `.kiro/steering/product.md` - Contains product requirements and user journey

### New Files to Create

**Frontend Components:**
- `components/upload/PDFUploadButton.tsx` - Main upload button component
- `components/upload/PDFUploadProgress.tsx` - Upload progress indicator
- `components/upload/PDFUploadZone.tsx` - Drag and drop upload zone
- `components/ui/Button.tsx` - Base button component
- `components/ui/Progress.tsx` - Progress bar component

**API Routes:**
- `app/api/pdf/upload/route.ts` - Handle PDF file uploads to Supabase Storage
- `app/api/pdf/process/route.ts` - Process uploaded PDFs and extract text
- `app/api/pdf/validate/route.ts` - Validate PDF files before upload

**Utilities:**
- `lib/supabase/client.ts` - Supabase client configuration
- `lib/supabase/storage.ts` - Supabase Storage utilities
- `lib/pdf/processor.ts` - PDF text extraction utilities
- `lib/pdf/validator.ts` - PDF file validation utilities
- `lib/utils.ts` - General utility functions

**Types:**
- `types/pdf.ts` - PDF-related type definitions
- `types/upload.ts` - Upload-related type definitions

**Configuration:**
- `next.config.js` - Next.js configuration for file uploads
- `.env.local` - Environment variables for Supabase

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Supabase Storage with Next.js Guide](https://supalaunch.com/blog/file-upload-nextjs-supabase)
  - Specific section: File upload implementation and progress tracking
  - Why: Shows complete integration pattern for Next.js + Supabase Storage
- [pdf-parse NPM Documentation](https://www.npmjs.com/package/pdf-parse)
  - Specific section: Installation, usage, and text extraction examples
  - Why: Primary library for PDF text extraction in Node.js
- [Next.js File Upload API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
  - Specific section: Handling file uploads in App Router
  - Why: Required for implementing secure file upload endpoints
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
  - Specific section: File upload, RLS policies, and bucket configuration
  - Why: Essential for secure file storage and access control

### Patterns to Follow

**File Naming Conventions:**
- Components: PascalCase (e.g., `PDFUploadButton.tsx`)
- API Routes: kebab-case (e.g., `upload/route.ts`)
- Utilities: camelCase (e.g., `pdfProcessor.ts`)
- Types: PascalCase (e.g., `PDFUploadResult.ts`)

**Error Handling Pattern:**
```typescript
try {
  // Operation
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: error.message };
}
```

**API Response Pattern:**
```typescript
// Success response
return NextResponse.json({ success: true, data: result });

// Error response
return NextResponse.json(
  { success: false, error: 'Error message' },
  { status: 400 }
);
```

**Component Structure Pattern:**
```typescript
interface ComponentProps {
  // Props definition
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX with Tailwind classes
  );
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation Setup

Set up the basic project structure, dependencies, and configuration files needed for PDF upload and processing functionality.

**Tasks:**
- Initialize Next.js project structure following steering document guidelines
- Install and configure required dependencies (pdf-parse, Supabase client)
- Set up environment variables and configuration files
- Create base utility functions and type definitions

### Phase 2: Supabase Storage Integration

Configure Supabase Storage for secure PDF file management with proper access controls and bucket policies.

**Tasks:**
- Set up Supabase Storage bucket for PDF files
- Configure Row Level Security (RLS) policies
- Create Supabase client utilities for storage operations
- Implement file upload and retrieval functions

### Phase 3: PDF Upload Components

Build the frontend components for PDF file upload with drag-and-drop functionality, progress tracking, and validation.

**Tasks:**
- Create base UI components (Button, Progress)
- Implement PDF upload button component
- Build drag-and-drop upload zone
- Add upload progress tracking component
- Implement client-side file validation

### Phase 4: API Routes Implementation

Develop Next.js API routes for handling PDF uploads, validation, and processing with proper error handling and security.

**Tasks:**
- Create PDF upload API route with Supabase Storage integration
- Implement PDF validation API route
- Build PDF processing API route with text extraction
- Add proper error handling and response formatting

### Phase 5: PDF Processing Pipeline

Implement the PDF text extraction and processing pipeline using pdf-parse library for content analysis.

**Tasks:**
- Create PDF text extraction utilities
- Implement content preprocessing for AI analysis
- Add metadata extraction (page count, file info)
- Build processing status tracking

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE package.json

- **IMPLEMENT**: Initialize Next.js project with required dependencies
- **PATTERN**: Standard Next.js 14 with App Router configuration
- **IMPORTS**: @supabase/supabase-js, pdf-parse, @types/node, typescript, tailwindcss
- **GOTCHA**: Ensure Node.js 18+ compatibility for pdf-parse v2
- **VALIDATE**: `npm install && npm run build`

### CREATE next.config.js

- **IMPLEMENT**: Configure Next.js for file uploads and API routes
- **PATTERN**: Standard Next.js configuration with file upload limits
- **IMPORTS**: None required
- **GOTCHA**: Set appropriate file size limits for PDF uploads (50MB max)
- **VALIDATE**: `npm run build`

### CREATE .env.local

- **IMPLEMENT**: Environment variables for Supabase configuration
- **PATTERN**: Standard Supabase environment variable naming
- **IMPORTS**: None required
- **GOTCHA**: Use NEXT_PUBLIC_ prefix for client-side variables only
- **VALIDATE**: Check variables are loaded with `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

### CREATE types/pdf.ts

- **IMPLEMENT**: TypeScript interfaces for PDF-related data structures
- **PATTERN**: Interface-based type definitions with proper exports
- **IMPORTS**: None required
- **GOTCHA**: Include all necessary fields for PDF metadata and processing status
- **VALIDATE**: `npx tsc --noEmit`

### CREATE types/upload.ts

- **IMPLEMENT**: TypeScript interfaces for upload-related data structures
- **PATTERN**: Interface-based type definitions with proper exports
- **IMPORTS**: None required
- **GOTCHA**: Include progress tracking and error state types
- **VALIDATE**: `npx tsc --noEmit`

### CREATE lib/utils.ts

- **IMPLEMENT**: General utility functions including file size formatting and validation
- **PATTERN**: Pure functions with proper TypeScript typing
- **IMPORTS**: clsx, tailwind-merge for className utilities
- **GOTCHA**: Include file size validation and MIME type checking
- **VALIDATE**: `npm run test` (if tests exist) or manual function testing

### CREATE lib/supabase/client.ts

- **IMPLEMENT**: Supabase client configuration for both client and server usage
- **PATTERN**: Separate client and server-side Supabase instances
- **IMPORTS**: @supabase/supabase-js
- **GOTCHA**: Use different configurations for client vs server environments
- **VALIDATE**: Test connection with `supabase.auth.getSession()`

### CREATE lib/supabase/storage.ts

- **IMPLEMENT**: Supabase Storage utilities for file operations
- **PATTERN**: Async functions with proper error handling
- **IMPORTS**: ./client, types/pdf, types/upload
- **GOTCHA**: Implement proper file path generation and access control
- **VALIDATE**: Test upload function with dummy file

### CREATE lib/pdf/validator.ts

- **IMPLEMENT**: PDF file validation utilities (size, type, structure)
- **PATTERN**: Validation functions returning boolean or validation result objects
- **IMPORTS**: types/pdf
- **GOTCHA**: Check both MIME type and file signature for security
- **VALIDATE**: Test with valid and invalid PDF files

### CREATE lib/pdf/processor.ts

- **IMPLEMENT**: PDF text extraction using pdf-parse library
- **PATTERN**: Async processing functions with progress callbacks
- **IMPORTS**: pdf-parse, types/pdf
- **GOTCHA**: Handle password-protected PDFs and large files properly
- **VALIDATE**: Test with sample PDF files of different sizes

### CREATE components/ui/Button.tsx

- **IMPLEMENT**: Base button component with variants and loading states
- **PATTERN**: Forwardref component with variant props using cva
- **IMPORTS**: React, clsx, types for button variants
- **GOTCHA**: Include loading state and disabled state styling
- **VALIDATE**: Render component in Storybook or test page

### CREATE components/ui/Progress.tsx

- **IMPLEMENT**: Progress bar component for upload tracking
- **PATTERN**: Controlled component with percentage prop
- **IMPORTS**: React, clsx for styling
- **GOTCHA**: Smooth animation transitions and accessibility attributes
- **VALIDATE**: Test with different percentage values

### CREATE components/upload/PDFUploadButton.tsx

- **IMPLEMENT**: Main PDF upload button with file selection
- **PATTERN**: Component with file input and upload handling
- **IMPORTS**: React, components/ui/Button, lib/pdf/validator
- **GOTCHA**: Handle multiple file selection and file type filtering
- **VALIDATE**: Test file selection and validation

### CREATE components/upload/PDFUploadProgress.tsx

- **IMPLEMENT**: Upload progress indicator with status messages
- **PATTERN**: Component displaying upload progress and status
- **IMPORTS**: React, components/ui/Progress, types/upload
- **GOTCHA**: Show different states (uploading, processing, complete, error)
- **VALIDATE**: Test with mock upload progress data

### CREATE components/upload/PDFUploadZone.tsx

- **IMPLEMENT**: Drag and drop upload zone component
- **PATTERN**: Component with drag event handlers and visual feedback
- **IMPORTS**: React, useState, useCallback for drag handling
- **GOTCHA**: Prevent default drag behaviors and provide visual feedback
- **VALIDATE**: Test drag and drop functionality with PDF files

### CREATE app/api/pdf/validate/route.ts

- **IMPLEMENT**: API route for PDF file validation
- **PATTERN**: Next.js App Router API route with POST method
- **IMPORTS**: NextRequest, NextResponse, lib/pdf/validator
- **GOTCHA**: Validate file before processing to prevent security issues
- **VALIDATE**: `curl -X POST http://localhost:3000/api/pdf/validate -F "file=@test.pdf"`

### CREATE app/api/pdf/upload/route.ts

- **IMPLEMENT**: API route for PDF file upload to Supabase Storage
- **PATTERN**: Next.js App Router API route with multipart form handling
- **IMPORTS**: NextRequest, NextResponse, lib/supabase/storage
- **GOTCHA**: Handle large file uploads with proper streaming
- **VALIDATE**: `curl -X POST http://localhost:3000/api/pdf/upload -F "file=@test.pdf"`

### CREATE app/api/pdf/process/route.ts

- **IMPLEMENT**: API route for PDF text extraction and processing
- **PATTERN**: Next.js App Router API route with background processing
- **IMPORTS**: NextRequest, NextResponse, lib/pdf/processor
- **GOTCHA**: Handle long-running processing with proper timeout handling
- **VALIDATE**: `curl -X POST http://localhost:3000/api/pdf/process -d '{"fileId":"test-id"}'`

### CREATE app/upload/page.tsx

- **IMPLEMENT**: Upload page combining all upload components
- **PATTERN**: Next.js page component with upload workflow
- **IMPORTS**: React, upload components, hooks for state management
- **GOTCHA**: Manage upload state and provide user feedback throughout process
- **VALIDATE**: Navigate to /upload and test complete upload workflow

### UPDATE app/layout.tsx

- **IMPLEMENT**: Add global styles and providers if needed
- **PATTERN**: Root layout component with global configurations
- **IMPORTS**: globals.css, any global providers
- **GOTCHA**: Ensure Tailwind CSS is properly configured
- **VALIDATE**: Check styles are applied correctly

### CREATE tailwind.config.js

- **IMPLEMENT**: Tailwind CSS configuration with custom theme
- **PATTERN**: Standard Tailwind config with custom colors and components
- **IMPORTS**: None required
- **GOTCHA**: Include custom colors for upload states and progress indicators
- **VALIDATE**: `npx tailwindcss -i ./app/globals.css -o ./dist/output.css`

### CREATE app/globals.css

- **IMPLEMENT**: Global CSS with Tailwind imports and custom styles
- **PATTERN**: Standard Tailwind CSS imports with custom component styles
- **IMPORTS**: Tailwind CSS directives
- **GOTCHA**: Include custom styles for drag and drop states
- **VALIDATE**: Check styles compile without errors

---

## TESTING STRATEGY

### Unit Tests

**Framework**: Jest with React Testing Library for component testing
**Scope**: Individual components, utility functions, and API route handlers
**Coverage**: Minimum 80% coverage for critical business logic

Design unit tests with fixtures and assertions following React Testing Library best practices:
- Test component rendering and user interactions
- Mock external dependencies (Supabase, pdf-parse)
- Test error handling and edge cases
- Validate file upload and processing logic

### Integration Tests

**Framework**: Playwright for end-to-end testing
**Scope**: Complete upload workflow from file selection to processing completion
**Coverage**: Critical user flows including drag-and-drop, progress tracking, and error handling

### Edge Cases

**File Validation Edge Cases:**
- Empty files and corrupted PDFs
- Files exceeding size limits (>50MB)
- Non-PDF files with PDF extensions
- Password-protected PDFs
- PDFs with no extractable text

**Upload Process Edge Cases:**
- Network interruptions during upload
- Supabase Storage quota exceeded
- Concurrent uploads from same user
- Processing timeout for large files

**Security Edge Cases:**
- Malicious file uploads
- Unauthorized access attempts
- File path traversal attacks
- MIME type spoofing

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

# Tailwind CSS compilation
npx tailwindcss -i ./app/globals.css -o ./dist/output.css --check
```

### Level 2: Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test -- --testPathPattern=upload
npm run test -- --testPathPattern=pdf
```

### Level 3: Integration Tests

```bash
# Start development server
npm run dev

# Run Playwright tests
npx playwright test

# Run specific test suites
npx playwright test --grep "PDF upload"
npx playwright test --grep "file validation"
```

### Level 4: Manual Validation

**File Upload Testing:**
```bash
# Test PDF upload API
curl -X POST http://localhost:3000/api/pdf/upload \
  -F "file=@test-document.pdf" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test PDF validation API
curl -X POST http://localhost:3000/api/pdf/validate \
  -F "file=@test-document.pdf"

# Test PDF processing API
curl -X POST http://localhost:3000/api/pdf/process \
  -H "Content-Type: application/json" \
  -d '{"fileId": "test-file-id"}'
```

**Frontend Testing:**
- Navigate to `/upload` page
- Test drag and drop functionality
- Upload various PDF file sizes
- Verify progress tracking works
- Test error handling with invalid files

### Level 5: Additional Validation (Optional)

**Supabase Storage Validation:**
```bash
# Check Supabase connection
npx supabase status

# Verify storage bucket configuration
npx supabase storage ls
```

**Performance Testing:**
- Upload large PDF files (10MB+)
- Test concurrent uploads
- Monitor memory usage during processing
- Verify cleanup of temporary files

---

## ACCEPTANCE CRITERIA

- [ ] Users can upload PDF files via button click or drag-and-drop
- [ ] Upload progress is displayed with percentage and status messages
- [ ] Files are validated for type, size, and structure before upload
- [ ] PDF files are securely stored in Supabase Storage with proper access controls
- [ ] Text content is extracted from PDFs using pdf-parse library
- [ ] Extracted content is prepared for AI analysis and question generation
- [ ] Error handling provides clear feedback for all failure scenarios
- [ ] Upload process works for files up to 50MB in size
- [ ] System handles concurrent uploads from multiple users
- [ ] All API routes return consistent response formats
- [ ] File validation prevents malicious uploads and security vulnerabilities
- [ ] Upload progress tracking works accurately for large files
- [ ] Processed content is stored with proper metadata (file info, page count, etc.)

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms feature works end-to-end
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability
- [ ] Security considerations addressed (file validation, access control)
- [ ] Performance requirements met (upload speed, processing time)
- [ ] Error handling covers all edge cases
- [ ] Documentation updated for API endpoints and components

---

## NOTES

**Security Considerations:**
- All uploaded files are validated for type and structure
- Supabase RLS policies restrict file access to authenticated users
- File processing happens server-side to prevent client-side vulnerabilities
- Temporary files are cleaned up after processing

**Performance Optimizations:**
- Large file uploads use streaming to prevent memory issues
- PDF processing is done asynchronously with progress tracking
- File validation happens before upload to save bandwidth
- Extracted text is cached to avoid reprocessing

**Future Enhancements:**
- Support for batch PDF uploads
- OCR processing for scanned PDFs
- PDF preview functionality
- Advanced content analysis and categorization
- Integration with external PDF processing services

**Dependencies:**
- pdf-parse v2.4.5+ for reliable text extraction
- @supabase/supabase-js for storage and authentication
- Next.js 14+ with App Router for modern API routes
- Tailwind CSS for responsive UI components
