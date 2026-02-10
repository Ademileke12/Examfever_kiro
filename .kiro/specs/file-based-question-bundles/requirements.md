# File-Based Question Bundle System - Requirements Specification

## Overview
Transform the current flat question management system into a comprehensive file-based question bundling system that organizes questions by their source PDF files, enabling users to study specific subjects/documents in isolation.

## Current State Analysis
- ✅ Database schema supports `file_id`, `course_id`, `subject_tag`, `document_title` fields
- ✅ PDF processing extracts course metadata and assigns unique file IDs
- ✅ Questions are saved with file associations
- ❌ UI still shows flat question list without file grouping
- ❌ No bundle selection interface for exams
- ❌ Exam engine doesn't filter by file/bundle selection

## System Architecture

### Task 1: File Processing & Dynamic Storage
**Status**: ✅ COMPLETED (Enhanced)
**Current Implementation**: PDF processing already extracts filename, creates unique file_id, and saves questions with course metadata.

**Enhancement Needed**: 
- Improve filename sanitization for better bundle names
- Add bundle preview generation during PDF processing

### Task 2: Question Bank Management (Bundle View)
**Status**: ❌ TO IMPLEMENT
**Current**: Flat list in `/questions` page
**Target**: Grouped bundle cards with file-based organization

### Task 3: Exam Selection Interface (Bundle Lobby)
**Status**: ❌ TO IMPLEMENT  
**Current**: Generic exam creation without file selection
**Target**: Bundle selection dashboard for targeted studying

### Task 4: Examination Engine (Dynamic Loading)
**Status**: ❌ TO IMPLEMENT
**Current**: Random question selection across all files
**Target**: File-specific question loading and session management

## Detailed Requirements

## Task 2: Question Bank Management

### User Stories
- **As a student**, I want to see my questions organized by source document so I can review material from specific PDFs
- **As a student**, I want to preview questions in each bundle before creating an exam
- **As a student**, I want to edit or delete questions within specific bundles
- **As a student**, I want to see bundle statistics (question count, difficulty distribution, last updated)

### Acceptance Criteria
1. **Bundle Card Display**
   - Questions grouped by `file_id` with `document_title` as display name
   - Each bundle shows: title, question count, subject tag, upload date
   - Visual indicators for bundle status (new, reviewed, exam-ready)

2. **Bundle Preview Mode**
   - Click bundle to view all questions from that file
   - Filter questions within bundle by type/difficulty
   - Edit/delete individual questions
   - Bulk operations (delete all, export)

3. **Bundle Statistics**
   - Question count by type (MC, SA, etc.)
   - Difficulty distribution chart
   - Subject classification
   - Last modified timestamp

### Technical Implementation
- Update `/questions` page to group by `file_id`
- Create `BundleCard` component
- Create `BundlePreview` component with question management
- Add bundle-level statistics API endpoint

## Task 3: Exam Selection Interface

### User Stories
- **As a student**, I want to select specific document bundles for my exam
- **As a student**, I want to combine multiple bundles into one exam session
- **As a student**, I want to see bundle information before starting an exam
- **As a student**, I want to configure exam settings per bundle selection

### Acceptance Criteria
1. **Bundle Selection Dashboard**
   - Grid/list view of available bundles
   - Multi-select capability for combined exams
   - Bundle information cards with metadata
   - "Take Test" action for each bundle

2. **Exam Configuration**
   - Select question types from chosen bundles
   - Set difficulty distribution
   - Configure time limits per bundle
   - Preview total question count

3. **Session Persistence**
   - Save bundle selection in exam configuration
   - Track which bundles are being tested
   - Resume capability for bundle-specific sessions

### Technical Implementation
- Create new `/exam-lobby` or update `/create-exam` page
- Add bundle selection UI components
- Update exam creation API to handle bundle filtering
- Modify exam configuration to store selected file IDs

## Task 4: Examination Engine

### User Stories
- **As a student**, I want my exam to only include questions from my selected bundles
- **As a student**, I want to see which document each question comes from during the exam
- **As a student**, I want my results to show performance per bundle/document
- **As a student**, I want to retake exams for specific bundles to improve

### Acceptance Criteria
1. **Dynamic Question Loading**
   - Filter questions by selected `file_id`s during exam generation
   - Maintain question randomization within bundle constraints
   - Ensure no cross-bundle question leakage

2. **Bundle Context Display**
   - Show source document name during exam
   - Optional: Display question's original context/page
   - Bundle-specific progress indicators

3. **Bundle-Specific Results**
   - Results breakdown by source document
   - Performance analytics per bundle
   - Recommendations for bundle-specific study areas

### Technical Implementation
- Update exam generation logic to filter by `file_id`
- Modify exam UI to show source context
- Enhance results tracking with bundle metadata
- Update analytics to support bundle-level insights

## Database Schema Updates

### New Tables Needed
```sql
-- Bundle metadata table (optional - can derive from questions table)
CREATE TABLE IF NOT EXISTS question_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  bundle_name TEXT NOT NULL, -- Derived from document_title
  subject_tag TEXT,
  question_count INTEGER DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Bundle-specific exam sessions
CREATE TABLE IF NOT EXISTS bundle_exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  file_ids TEXT[] NOT NULL, -- Array of selected bundle file IDs
  bundle_names TEXT[] NOT NULL, -- Corresponding bundle names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Existing Table Updates
```sql
-- Add bundle context to exam_results
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS bundle_context JSONB DEFAULT '{}';
-- Structure: {"file_ids": ["file1", "file2"], "bundle_names": ["Math101", "Physics202"]}

-- Add bundle filtering to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS bundle_filter JSONB DEFAULT '{}';
-- Structure: {"file_ids": ["file1"], "include_all": false}
```

## API Endpoints Required

### Bundle Management
- `GET /api/bundles` - List all bundles for user
- `GET /api/bundles/[fileId]` - Get bundle details and questions
- `PUT /api/bundles/[fileId]` - Update bundle metadata
- `DELETE /api/bundles/[fileId]` - Delete entire bundle

### Bundle-Aware Exam System
- `POST /api/exams/create-from-bundles` - Create exam from selected bundles
- `GET /api/exams/[id]/bundle-context` - Get bundle information for exam
- `POST /api/exam-results/bundle-analytics` - Save bundle-specific results

### Bundle Analytics
- `GET /api/analytics/bundles` - Bundle-level performance analytics
- `GET /api/analytics/bundles/[fileId]` - Specific bundle performance

## UI Components Required

### New Components
1. **BundleCard** - Display bundle information and actions
2. **BundleGrid** - Grid layout for bundle cards
3. **BundlePreview** - Detailed view of bundle questions
4. **BundleSelector** - Multi-select interface for exam creation
5. **BundleProgress** - Progress indicator during exams
6. **BundleAnalytics** - Performance charts per bundle

### Updated Components
1. **QuestionBank** - Transform to bundle-based view
2. **ExamCreator** - Add bundle selection step
3. **ExamInterface** - Show bundle context
4. **ResultsDisplay** - Bundle-specific breakdowns

## User Workflow

### Current Workflow
1. Upload PDF → Questions generated → Flat question list → Generic exam → Results

### New Bundle Workflow
1. **Upload PDF** → Questions generated with bundle metadata
2. **Question Bank** → View bundles → Select bundle → Preview/edit questions
3. **Create Exam** → Select bundles → Configure settings → Generate bundle-filtered exam
4. **Take Exam** → Questions from selected bundles only → Bundle context shown
5. **View Results** → Bundle-specific performance → Targeted recommendations

## Success Metrics
- Users can identify and select specific document bundles
- Exam questions are properly filtered by bundle selection
- Results show clear bundle-level performance breakdown
- No cross-bundle question contamination in exams
- Bundle management reduces study preparation time

## Implementation Priority
1. **Phase 1**: Task 2 - Bundle view in question bank (High Priority)
2. **Phase 2**: Task 3 - Bundle selection in exam creation (High Priority)  
3. **Phase 3**: Task 4 - Bundle-filtered exam engine (Critical)
4. **Phase 4**: Enhanced analytics and bundle management (Medium Priority)

## Risk Mitigation
- **Data Migration**: Existing questions without `file_id` need default bundle assignment
- **Performance**: Bundle queries must be optimized with proper indexing
- **User Experience**: Bundle selection should not complicate simple exam creation
- **Backward Compatibility**: Support users with mixed bundle/non-bundle questions

## Testing Strategy
- Unit tests for bundle filtering logic
- Integration tests for bundle-aware exam generation
- E2E tests for complete bundle workflow
- Performance tests for large bundle datasets
- User acceptance testing for bundle selection UX