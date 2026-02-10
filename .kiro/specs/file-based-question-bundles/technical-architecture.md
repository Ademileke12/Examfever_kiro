# File-Based Question Bundle System - Technical Architecture

## System Overview

The File-Based Question Bundle System transforms the existing flat question management into a hierarchical, document-centric organization. This architecture maintains backward compatibility while introducing powerful new capabilities for targeted studying.

## Current System Analysis

### Existing Database Schema (Strengths)
```sql
-- Already supports bundle requirements
questions (
  file_id TEXT NOT NULL,        -- ✅ Bundle identifier
  course_id TEXT,               -- ✅ Course grouping
  subject_tag TEXT,             -- ✅ Subject classification
  document_title TEXT,          -- ✅ Display name
  user_id TEXT NOT NULL,        -- ✅ User isolation
  -- ... other fields
)
```

### Existing API Structure (Strengths)
- ✅ PDF processing with file_id generation
- ✅ Course metadata extraction
- ✅ Question filtering by file_id
- ✅ User-based data isolation

### Current Gaps (To Address)
- ❌ No bundle-centric UI components
- ❌ No bundle selection in exam creation
- ❌ No bundle-aware exam generation
- ❌ No bundle-specific analytics

## Architecture Principles

### 1. Backward Compatibility
- Existing questions without file_id get default bundle assignment
- Current exam creation workflow remains available
- API endpoints maintain existing functionality
- Database schema changes are additive only

### 2. Performance First
- Bundle queries use existing indexes
- Lazy loading for large bundle collections
- Caching for frequently accessed bundle metadata
- Optimized database queries with proper joins

### 3. User Experience Consistency
- Bundle system feels natural and intuitive
- Maintains existing UI patterns and styling
- Progressive disclosure of advanced features
- Mobile-first responsive design

### 4. Data Integrity
- Bundle isolation is strictly enforced
- No cross-bundle question leakage
- Consistent bundle metadata across system
- Atomic operations for bundle modifications

## Technical Architecture

### Database Layer

#### Core Tables (Existing - Enhanced)
```sql
-- Enhanced questions table (no changes needed)
questions (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,           -- Bundle identifier
  course_id TEXT,                  -- Course grouping
  subject_tag TEXT,                -- Subject classification  
  document_title TEXT,             -- Bundle display name
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  -- ... existing fields
)

-- Enhanced exams table (add bundle context)
exams (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_file_ids TEXT[],          -- Selected bundle IDs
  bundle_context JSONB DEFAULT '{}', -- Bundle metadata
  -- ... existing fields
)

-- Enhanced exam_results (add bundle tracking)
exam_results (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  bundle_context JSONB DEFAULT '{}', -- Bundle performance data
  -- ... existing fields
)
```

#### New Tables (Bundle Management)
```sql
-- Bundle metadata cache (optional optimization)
CREATE TABLE question_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  bundle_name TEXT NOT NULL,
  subject_tag TEXT,
  question_count INTEGER DEFAULT 0,
  difficulty_distribution JSONB DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle access tracking (analytics)
CREATE TABLE bundle_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'exam_create', 'exam_take'
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes (Performance Optimization)
```sql
-- Existing indexes (already optimal for bundles)
CREATE INDEX idx_questions_file_id ON questions(file_id);
CREATE INDEX idx_questions_user_file ON questions(user_id, file_id);

-- New indexes for bundle operations
CREATE INDEX idx_bundles_user_id ON question_bundles(user_id);
CREATE INDEX idx_bundles_subject ON question_bundles(subject_tag);
CREATE INDEX idx_bundle_access_user_time ON bundle_access_log(user_id, timestamp);
```

### API Layer

#### Bundle Management Endpoints
```typescript
// Bundle listing and metadata
GET    /api/bundles
Response: {
  bundles: Array<{
    fileId: string
    bundleName: string
    subjectTag: string
    questionCount: number
    difficultyDistribution: Record<string, number>
    lastAccessed: string
    uploadDate: string
  }>
}

// Bundle details with questions
GET    /api/bundles/[fileId]
Response: {
  bundle: BundleMetadata
  questions: Question[]
  statistics: BundleStatistics
}

// Bundle operations
PUT    /api/bundles/[fileId]        // Update bundle metadata
DELETE /api/bundles/[fileId]        // Delete entire bundle
POST   /api/bundles/[fileId]/merge  // Merge with another bundle
```

#### Bundle-Aware Exam Endpoints
```typescript
// Create exam from selected bundles
POST   /api/exams/from-bundles
Request: {
  bundleIds: string[]
  examConfig: ExamConfiguration
  bundleDistribution?: Record<string, number>
}

// Get exam bundle context
GET    /api/exams/[examId]/bundles
Response: {
  selectedBundles: BundleMetadata[]
  questionDistribution: Record<string, number>
}
```

#### Bundle Analytics Endpoints
```typescript
// Bundle performance analytics
GET    /api/analytics/bundles
Response: {
  bundlePerformance: Array<{
    fileId: string
    bundleName: string
    averageScore: number
    totalAttempts: number
    lastAttempted: string
    strengthAreas: string[]
    weaknessAreas: string[]
  }>
}

// Specific bundle analytics
GET    /api/analytics/bundles/[fileId]
Response: {
  bundle: BundleMetadata
  performanceHistory: PerformanceDataPoint[]
  recommendations: StudyRecommendation[]
}
```

### Service Layer

#### Bundle Service
```typescript
class BundleService {
  // Core bundle operations
  async getBundles(userId: string): Promise<Bundle[]>
  async getBundleDetails(fileId: string, userId: string): Promise<BundleDetails>
  async updateBundle(fileId: string, updates: BundleUpdate): Promise<Bundle>
  async deleteBundle(fileId: string, userId: string): Promise<void>
  
  // Bundle statistics
  async calculateBundleStats(fileId: string): Promise<BundleStatistics>
  async refreshBundleCache(fileId: string): Promise<void>
  
  // Bundle operations
  async mergeBundles(sourceIds: string[], targetId: string): Promise<Bundle>
  async splitBundle(fileId: string, criteria: SplitCriteria): Promise<Bundle[]>
}
```

#### Bundle-Aware Exam Service
```typescript
class BundleExamService extends ExamService {
  // Bundle-filtered exam generation
  async createExamFromBundles(
    bundleIds: string[], 
    config: ExamConfig
  ): Promise<Exam>
  
  // Bundle-aware question selection
  async selectQuestionsFromBundles(
    bundleIds: string[],
    criteria: SelectionCriteria
  ): Promise<Question[]>
  
  // Bundle context management
  async saveBundleContext(examId: string, context: BundleContext): Promise<void>
  async getBundleContext(examId: string): Promise<BundleContext>
}
```

#### Bundle Analytics Service
```typescript
class BundleAnalyticsService {
  // Performance tracking
  async trackBundlePerformance(
    userId: string,
    examResult: ExamResult
  ): Promise<void>
  
  // Analytics calculation
  async calculateBundleAnalytics(
    userId: string,
    fileId?: string
  ): Promise<BundleAnalytics>
  
  // Recommendations
  async generateStudyRecommendations(
    userId: string,
    bundleIds: string[]
  ): Promise<StudyRecommendation[]>
}
```

### Frontend Architecture

#### Component Hierarchy
```
src/
├── components/
│   ├── bundles/
│   │   ├── BundleCard.tsx           // Individual bundle display
│   │   ├── BundleGrid.tsx           // Bundle collection layout
│   │   ├── BundlePreview.tsx        // Bundle detail modal
│   │   ├── BundleSelector.tsx       // Multi-select for exams
│   │   ├── BundleProgress.tsx       // Exam progress by bundle
│   │   └── BundleAnalytics.tsx      // Bundle performance charts
│   ├── exam/
│   │   ├── BundleExamCreator.tsx    // Bundle-aware exam creation
│   │   ├── BundleExamInterface.tsx  // Bundle context during exam
│   │   └── BundleResults.tsx        // Bundle-specific results
│   └── questions/
│       └── BundleQuestionBank.tsx   // Bundle-organized question view
├── hooks/
│   ├── useBundles.tsx               // Bundle data management
│   ├── useBundleAnalytics.tsx       // Bundle performance data
│   └── useBundleExams.tsx           // Bundle-aware exam operations
├── lib/
│   ├── bundles/
│   │   ├── types.ts                 // Bundle type definitions
│   │   ├── api.ts                   // Bundle API client
│   │   └── utils.ts                 // Bundle utility functions
│   └── exam/
│       └── bundle-engine.ts         // Bundle-aware exam logic
└── pages/
    ├── bundles/
    │   ├── index.tsx                // Bundle dashboard
    │   └── [fileId].tsx             // Bundle detail page
    └── exam/
        └── bundle-lobby.tsx         // Bundle selection for exams
```

#### State Management
```typescript
// Bundle state management with Zustand/Context
interface BundleStore {
  bundles: Bundle[]
  selectedBundles: string[]
  bundleFilters: BundleFilters
  
  // Actions
  loadBundles: () => Promise<void>
  selectBundle: (fileId: string) => void
  deselectBundle: (fileId: string) => void
  updateBundleFilters: (filters: BundleFilters) => void
  refreshBundle: (fileId: string) => Promise<void>
}

// Bundle-aware exam state
interface BundleExamStore {
  selectedBundles: string[]
  bundleDistribution: Record<string, number>
  examConfig: BundleExamConfig
  
  // Actions
  setBundleSelection: (bundleIds: string[]) => void
  updateBundleDistribution: (distribution: Record<string, number>) => void
  createBundleExam: () => Promise<Exam>
}
```

### Data Flow Architecture

#### Bundle Loading Flow
```
1. User navigates to /questions
2. BundleQuestionBank component mounts
3. useBundles hook triggers API call
4. GET /api/bundles fetches bundle metadata
5. BundleGrid renders bundle cards
6. User clicks bundle → BundlePreview loads questions
7. GET /api/bundles/[fileId] fetches bundle details
```

#### Bundle Exam Creation Flow
```
1. User navigates to /create-exam
2. BundleExamCreator shows bundle selection
3. User selects bundles via BundleSelector
4. System calculates available questions per bundle
5. User configures exam settings
6. POST /api/exams/from-bundles creates exam
7. Exam generation filters questions by file_id
8. Exam session stores bundle context
```

#### Bundle-Aware Exam Taking Flow
```
1. User starts exam with bundle context
2. BundleExamInterface loads with bundle info
3. Questions filtered by selected file_ids
4. BundleProgress shows per-bundle completion
5. Results saved with bundle performance data
6. BundleResults displays per-bundle breakdown
```

## Performance Considerations

### Database Optimization
- **Bundle Queries**: Use existing file_id indexes
- **Aggregation**: Cache bundle statistics in question_bundles table
- **Pagination**: Implement cursor-based pagination for large bundle sets
- **Joins**: Optimize bundle-question joins with proper indexing

### Frontend Optimization
- **Lazy Loading**: Load bundle details on demand
- **Virtual Scrolling**: Handle large bundle collections efficiently
- **Caching**: Cache bundle metadata in browser storage
- **Debouncing**: Debounce search and filter operations

### API Optimization
- **Response Caching**: Cache bundle metadata with appropriate TTL
- **Batch Operations**: Support bulk bundle operations
- **Compression**: Gzip API responses for large bundle data
- **Rate Limiting**: Implement rate limiting for bundle operations

## Security Considerations

### Data Access Control
- **User Isolation**: Strict user_id filtering for all bundle operations
- **Bundle Ownership**: Verify bundle ownership before operations
- **API Authentication**: Require authentication for all bundle endpoints
- **Input Validation**: Validate all bundle-related inputs

### Data Integrity
- **Transaction Safety**: Use database transactions for bundle operations
- **Referential Integrity**: Maintain foreign key constraints
- **Audit Trail**: Log all bundle modifications
- **Backup Strategy**: Include bundle metadata in backup procedures

## Migration Strategy

### Phase 1: Database Preparation
```sql
-- Create bundle metadata table
-- Add bundle context columns to existing tables
-- Create necessary indexes
-- Run data migration for existing questions
```

### Phase 2: API Development
```typescript
// Implement bundle management endpoints
// Add bundle filtering to existing endpoints
// Create bundle analytics endpoints
// Update exam creation for bundle support
```

### Phase 3: Frontend Implementation
```typescript
// Create bundle UI components
// Update question bank to use bundle view
// Implement bundle selection in exam creation
// Add bundle context to exam interface
```

### Phase 4: Analytics and Optimization
```typescript
// Implement bundle analytics
// Add performance monitoring
// Optimize bundle queries
// Add advanced bundle features
```

## Testing Strategy

### Unit Testing
- Bundle service methods
- Bundle utility functions
- Bundle component logic
- Bundle state management

### Integration Testing
- Bundle API endpoints
- Bundle database operations
- Bundle-exam integration
- Bundle analytics pipeline

### End-to-End Testing
- Complete bundle workflow
- Bundle exam creation and taking
- Bundle performance tracking
- Cross-browser bundle functionality

### Performance Testing
- Bundle query performance
- Large bundle collection handling
- Concurrent bundle operations
- Bundle cache effectiveness

## Monitoring and Observability

### Metrics to Track
- Bundle operation response times
- Bundle query performance
- Bundle usage patterns
- Bundle exam success rates

### Logging Strategy
- Bundle operation logs
- Bundle performance metrics
- Bundle error tracking
- Bundle user behavior analytics

### Alerting
- Bundle query performance degradation
- Bundle operation failures
- Bundle data inconsistencies
- Bundle system errors

## Deployment Considerations

### Database Migration
- Gradual rollout of bundle features
- Backward compatibility maintenance
- Data migration validation
- Rollback procedures

### Feature Flags
- Bundle system toggle
- Bundle analytics toggle
- Advanced bundle features toggle
- Bundle performance optimizations toggle

### Rollout Strategy
- Internal testing phase
- Beta user group
- Gradual user rollout
- Full deployment

This technical architecture provides a comprehensive foundation for implementing the file-based question bundle system while maintaining system performance, security, and user experience standards.