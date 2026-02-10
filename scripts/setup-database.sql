-- ExamFever Database Setup Script
-- Run this in your Supabase SQL Editor or via CLI

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table to store AI-generated questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Using TEXT for demo, change to UUID for production
  file_id TEXT NOT NULL, -- Reference to uploaded PDF - now required
  course_id TEXT, -- Course/subject identifier derived from PDF
  subject_tag TEXT, -- Subject classification (e.g., 'mathematics', 'chemistry')
  document_title TEXT, -- Original PDF filename/title
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'short-answer', 'essay', 'true-false')),
  text TEXT NOT NULL,
  options JSONB, -- For multiple choice options
  correct_answer TEXT,
  explanation TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT,
  keywords TEXT[],
  source_content TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question options table for multiple choice questions
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table to store exam configurations
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Using TEXT for demo
  title TEXT NOT NULL,
  description TEXT,
  course_id TEXT, -- Filter exams by course/document
  subject_tag TEXT, -- Subject classification
  source_file_ids TEXT[], -- Array of file IDs this exam draws from
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  total_questions INTEGER NOT NULL,
  difficulty_distribution JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}',
  question_types TEXT[] DEFAULT ARRAY['multiple-choice'],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam questions junction table
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, question_id),
  UNIQUE(exam_id, order_index)
);

-- User activities table for analytics
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Using TEXT for demo
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT
);

-- Performance history table for analytics
CREATE TABLE IF NOT EXISTS performance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Using TEXT for demo
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  accuracy DECIMAL(5,2) NOT NULL, -- Percentage score
  average_time INTEGER NOT NULL, -- Average time per question in seconds
  questions_answered INTEGER NOT NULL,
  questions_correct INTEGER NOT NULL,
  total_time INTEGER NOT NULL, -- Total time in seconds
  topics_covered TEXT[],
  difficulty_level TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam results table for detailed exam tracking
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Using TEXT for demo
  exam_id TEXT NOT NULL, -- Can be UUID or string ID
  exam_title TEXT NOT NULL,
  score INTEGER NOT NULL, -- Percentage score (0-100)
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL, -- Total time spent in seconds
  time_limit_minutes INTEGER NOT NULL, -- Original time limit
  study_time_minutes INTEGER NOT NULL DEFAULT 0, -- Calculated study time
  user_answers JSONB DEFAULT '{}', -- User's answers for review
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_file_id ON questions(file_id);
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_tag ON questions(subject_tag);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activities_session ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_history_user_id ON performance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_history_date ON performance_history(date);
CREATE INDEX IF NOT EXISTS idx_exam_questions_order ON exam_questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON exam_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_exam_results_score ON exam_results(score);

-- Add updated_at trigger for questions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_questions_updated_at') THEN
        CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_exams_updated_at') THEN
        CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

SELECT 'Database setup completed successfully!' as message;