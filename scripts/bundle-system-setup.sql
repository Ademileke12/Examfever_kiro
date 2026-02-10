-- File-Based Question Bundle System Database Setup
-- Run this after the main setup-database.sql

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
  action TEXT NOT NULL, -- 'view', 'exam_create', 'exam_take'
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

-- Function to refresh bundle statistics
CREATE OR REPLACE FUNCTION refresh_bundle_stats(bundle_file_id TEXT, bundle_user_id TEXT)
RETURNS void AS $$
DECLARE
  q_count INTEGER;
  diff_dist JSONB;
BEGIN
  -- Count questions
  SELECT COUNT(*) INTO q_count
  FROM questions 
  WHERE file_id = bundle_file_id AND user_id = bundle_user_id;
  
  -- Calculate difficulty distribution
  SELECT jsonb_object_agg(difficulty, count) INTO diff_dist
  FROM (
    SELECT difficulty, COUNT(*) as count
    FROM questions 
    WHERE file_id = bundle_file_id AND user_id = bundle_user_id
    GROUP BY difficulty
  ) AS diff_counts;
  
  -- Update or insert bundle metadata
  INSERT INTO question_bundles (file_id, user_id, bundle_name, question_count, difficulty_distribution, updated_at)
  VALUES (
    bundle_file_id, 
    bundle_user_id, 
    COALESCE((SELECT document_title FROM questions WHERE file_id = bundle_file_id AND user_id = bundle_user_id LIMIT 1), bundle_file_id),
    q_count,
    COALESCE(diff_dist, '{}'::jsonb),
    NOW()
  )
  ON CONFLICT (file_id) DO UPDATE SET
    question_count = EXCLUDED.question_count,
    difficulty_distribution = EXCLUDED.difficulty_distribution,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update bundle stats when questions change
CREATE OR REPLACE FUNCTION update_bundle_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM refresh_bundle_stats(NEW.file_id, NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM refresh_bundle_stats(OLD.file_id, OLD.user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'bundle_stats_trigger') THEN
    CREATE TRIGGER bundle_stats_trigger
      AFTER INSERT OR UPDATE OR DELETE ON questions
      FOR EACH ROW EXECUTE FUNCTION update_bundle_stats_trigger();
  END IF;
END
$$;

-- Populate bundle metadata for existing questions
INSERT INTO question_bundles (file_id, user_id, bundle_name, subject_tag, upload_date)
SELECT DISTINCT 
  file_id,
  user_id,
  COALESCE(MAX(document_title), file_id) as bundle_name,
  MAX(subject_tag) as subject_tag,
  MIN(created_at) as upload_date
FROM questions 
WHERE file_id IS NOT NULL
GROUP BY file_id, user_id
ON CONFLICT (file_id) DO NOTHING;

-- Refresh stats for all existing bundles
DO $$
DECLARE
  bundle_record RECORD;
BEGIN
  FOR bundle_record IN 
    SELECT DISTINCT file_id, user_id FROM questions WHERE file_id IS NOT NULL
  LOOP
    PERFORM refresh_bundle_stats(bundle_record.file_id, bundle_record.user_id);
  END LOOP;
END
$$;

SELECT 'Bundle system database setup completed successfully!' as message;