import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Starting simple bundle system setup...')
    
    // First, check if question_bundles table exists by trying to query it
    const { data: existingBundles, error: checkError } = await supabase
      .from('question_bundles')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Bundle tables already exist',
        tablesExist: true
      })
    }
    
    console.log('Bundle tables do not exist, need manual setup')
    
    // Since we can't create tables with anon key, provide manual setup instructions
    const manualSetupSQL = `
-- Run this SQL in your Supabase SQL Editor:

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
`
    
    return NextResponse.json({
      success: false,
      message: 'Bundle tables need to be created manually',
      requiresManualSetup: true,
      instructions: 'Please run the provided SQL in your Supabase SQL Editor',
      sql: manualSetupSQL,
      steps: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the provided SQL',
        '4. Click "Run" to execute',
        '5. Refresh this page to test the setup'
      ]
    })
    
  } catch (error) {
    console.error('Bundle setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test if bundle tables exist and are working
    const { data: bundles, error: bundleError } = await supabase
      .from('question_bundles')
      .select('id, file_id, bundle_name')
      .limit(5)
    
    if (bundleError) {
      return NextResponse.json({
        success: false,
        tablesExist: false,
        error: bundleError.message,
        message: 'Bundle tables do not exist or are not accessible'
      })
    }
    
    const { data: accessLog, error: logError } = await supabase
      .from('bundle_access_log')
      .select('id')
      .limit(1)
    
    if (logError) {
      return NextResponse.json({
        success: false,
        tablesExist: false,
        error: logError.message,
        message: 'Bundle access log table does not exist'
      })
    }
    
    return NextResponse.json({
      success: true,
      tablesExist: true,
      message: 'Bundle system is properly set up',
      bundleCount: bundles?.length || 0,
      sampleBundles: bundles?.slice(0, 3) || []
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}