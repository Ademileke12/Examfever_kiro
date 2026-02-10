# Bundle System Setup Instructions

## Issue
The bundle system is missing the required database tables. The error "Could not find the table 'public.question_bundles'" occurs because the bundle tables haven't been created yet.

## Solution
You need to manually create the bundle tables in your Supabase database.

## Steps

### 1. Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### 2. Run the Bundle Setup SQL
Copy and paste the following SQL into the SQL Editor and click **Run**:

```sql
-- Bundle metadata table for optimization and caching
CREATE TABLE IF NOT EXISTS question_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  bundle_name TEXT NOT NULL,
  subject_tag TEXT,
  question_count INTEGER DEFAULT 0,
  difficulty_distribution JSONB DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle access tracking for analytics
CREATE TABLE IF NOT EXISTS bundle_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add bundle context to existing tables
ALTER TABLE exams ADD COLUMN IF NOT EXISTS source_file_ids TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE exams ADD COLUMN IF NOT EXISTS bundle_context JSONB DEFAULT '{}';
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS bundle_context JSONB DEFAULT '{}';

-- Create indexes for bundle operations
CREATE INDEX IF NOT EXISTS idx_bundles_user_id ON question_bundles(user_id);
CREATE INDEX IF NOT EXISTS idx_bundles_subject ON question_bundles(subject_tag);
CREATE INDEX IF NOT EXISTS idx_bundles_file_id ON question_bundles(file_id);
CREATE INDEX IF NOT EXISTS idx_bundle_access_user_time ON bundle_access_log(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_bundle_access_file ON bundle_access_log(file_id);

-- Populate bundle metadata for existing questions
INSERT INTO question_bundles (file_id, user_id, bundle_name, subject_tag, upload_date)
SELECT DISTINCT 
  file_id,
  user_id,
  COALESCE(document_title, file_id) as bundle_name,
  subject_tag,
  MIN(created_at) as upload_date
FROM questions 
WHERE file_id IS NOT NULL
ON CONFLICT (file_id) DO NOTHING;
```

### 3. Verify Setup
After running the SQL, you can verify the setup by:

1. **Using the Setup Page**: Visit `http://localhost:3000/bundle-setup` and click "Check Setup Status"
2. **API Test**: `curl -X GET http://localhost:3000/api/database/setup-bundles-simple`
3. **Browse Page**: The browse page should now work without bundle errors

### 4. Populate Bundles (Optional)
If you have existing questions, you can populate bundles automatically:

1. Visit `http://localhost:3000/bundle-setup`
2. Click "Populate Bundles" after the setup is confirmed
3. Or use API: `curl -X POST http://localhost:3000/api/bundles/populate`

## What This Creates

### Tables Created:
- **question_bundles**: Organizes questions by PDF file with metadata
- **bundle_access_log**: Tracks user interactions with bundles

### Features Enabled:
- ✅ Browse page bundle listing
- ✅ PDF-based question organization
- ✅ Bundle analytics and tracking
- ✅ Exam creation from specific bundles
- ✅ Bundle-based performance analytics

## Current System Status

### ✅ Working Features:
- PDF upload and processing
- AI question generation with Xroute API (`doubao-1-5-pro-32k-250115`)
- Question storage and retrieval
- Exam creation and taking
- User authentication
- Analytics dashboard

### 🔧 Needs Bundle Setup:
- Browse page bundle listing
- Bundle-based exam creation
- Bundle analytics

## Alternative: Service Key Setup
If you prefer automatic setup, you can configure the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file with your actual service role key from Supabase dashboard.

## Next Steps
1. Run the SQL above in Supabase
2. Test the bundle system at `/bundle-setup`
3. Upload a PDF to test the complete workflow: PDF → Questions → Bundle → Exam