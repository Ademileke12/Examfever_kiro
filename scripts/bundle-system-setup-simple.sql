-- Simple Bundle System Setup (Run this in Supabase SQL Editor)

-- Step 1: Create bundle metadata table
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

-- Step 2: Create bundle access tracking table
CREATE TABLE IF NOT EXISTS bundle_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add bundle context columns to existing tables
ALTER TABLE exams ADD COLUMN IF NOT EXISTS source_file_ids TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE exams ADD COLUMN IF NOT EXISTS bundle_context JSONB DEFAULT '{}';
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS bundle_context JSONB DEFAULT '{}';

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundles_user_id ON question_bundles(user_id);
CREATE INDEX IF NOT EXISTS idx_bundles_subject ON question_bundles(subject_tag);
CREATE INDEX IF NOT EXISTS idx_bundles_file_id ON question_bundles(file_id);
CREATE INDEX IF NOT EXISTS idx_bundle_access_user_time ON bundle_access_log(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_bundle_access_file ON bundle_access_log(file_id);

-- Success message
SELECT 'Bundle system tables created successfully!' as message;