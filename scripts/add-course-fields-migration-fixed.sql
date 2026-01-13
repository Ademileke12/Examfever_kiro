-- Migration Script: Add Course-Specific Fields to Existing Database
-- Run this if you already have a database set up but are missing the new course fields

-- Add course-specific fields to questions table if they don't exist
DO $$
BEGIN
    -- Add file_id column (make it nullable first, then update, then make required)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'file_id') THEN
        ALTER TABLE questions ADD COLUMN file_id TEXT;
        -- Update existing records with a default file_id
        UPDATE questions SET file_id = 'legacy-' || id::text WHERE file_id IS NULL;
        -- Now make it NOT NULL
        ALTER TABLE questions ALTER COLUMN file_id SET NOT NULL;
    END IF;

    -- Add course_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'course_id') THEN
        ALTER TABLE questions ADD COLUMN course_id TEXT;
    END IF;

    -- Add subject_tag column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'subject_tag') THEN
        ALTER TABLE questions ADD COLUMN subject_tag TEXT;
    END IF;

    -- Add document_title column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'document_title') THEN
        ALTER TABLE questions ADD COLUMN document_title TEXT;
    END IF;
END $$;

-- Add course-specific fields to exams table if they don't exist
DO $$
BEGIN
    -- Add course_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'course_id') THEN
        ALTER TABLE exams ADD COLUMN course_id TEXT;
    END IF;

    -- Add subject_tag column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'subject_tag') THEN
        ALTER TABLE exams ADD COLUMN subject_tag TEXT;
    END IF;

    -- Add source_file_ids column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'source_file_ids') THEN
        ALTER TABLE exams ADD COLUMN source_file_ids TEXT[];
    END IF;
END $$;

-- Create exam_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  study_time_minutes INTEGER NOT NULL DEFAULT 0,
  user_answers JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for new fields if they don't exist
DO $$
BEGIN
    -- Questions table indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_file_id') THEN
        CREATE INDEX idx_questions_file_id ON questions(file_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_course_id') THEN
        CREATE INDEX idx_questions_course_id ON questions(course_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_subject_tag') THEN
        CREATE INDEX idx_questions_subject_tag ON questions(subject_tag);
    END IF;

    -- Exam results table indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_results_user_id') THEN
        CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_results_completed_at') THEN
        CREATE INDEX idx_exam_results_completed_at ON exam_results(completed_at);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_results_score') THEN
        CREATE INDEX idx_exam_results_score ON exam_results(score);
    END IF;
END $$;

SELECT 'Course-specific fields migration completed successfully!' as message;