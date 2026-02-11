-- =====================================================
-- EXAMFEVER COMPLETE DATABASE MIGRATION (UPDATED)
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. USER PROFILES & AUTHENTICATION
-- =====================================================

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    study_reminders BOOLEAN DEFAULT FALSE,
    preferred_difficulty TEXT DEFAULT 'medium' CHECK (preferred_difficulty IN ('easy', 'medium', 'hard')),
    default_exam_duration INTEGER DEFAULT 60,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_exams_taken INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SUBSCRIPTION SYSTEM
-- =====================================================

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'standard', 'premium')),
    uploads_allowed INTEGER DEFAULT 2,
    exams_allowed INTEGER DEFAULT 2,
    uploads_used INTEGER DEFAULT 0,
    exams_used INTEGER DEFAULT 0,
    sub_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sub_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status TEXT NOT NULL,
    plan_tier TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. QUESTION BUNDLES (CRITICAL - MUST EXIST BEFORE QUESTIONS)
-- =====================================================

CREATE TABLE IF NOT EXISTS question_bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    total_questions INTEGER DEFAULT 0,
    difficulty_distribution JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, file_id)
);

-- =====================================================
-- 4. QUESTIONS & EXAMS
-- =====================================================

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'short-answer', 'essay', 'true-false')),
    text TEXT NOT NULL,
    options JSONB,
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

-- Question options table
CREATE TABLE IF NOT EXISTS question_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
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
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, question_id),
    UNIQUE(exam_id, order_index)
);

-- Exam sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_remaining_seconds INTEGER,
    current_question_index INTEGER DEFAULT 0,
    session_data JSONB DEFAULT '{}',
    score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- Exam results table
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
    total_questions INTEGER NOT NULL,
    questions_answered INTEGER NOT NULL,
    questions_correct INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    points_earned INTEGER NOT NULL,
    percentage_score DECIMAL(5,2) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    study_time_minutes INTEGER DEFAULT 0,
    difficulty_breakdown JSONB DEFAULT '{}',
    topic_breakdown JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id)
);

-- =====================================================
-- 5. ANALYTICS & PERFORMANCE TRACKING
-- =====================================================

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('exam', 'practice', 'review')),
    duration_minutes INTEGER NOT NULL,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    topics_covered TEXT[],
    performance_score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    context JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge gaps table
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    incorrect_count INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    last_attempt_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'improving', 'mastered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);

-- Question bundles indexes
CREATE INDEX IF NOT EXISTS idx_question_bundles_user_id ON question_bundles(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bundles_file_id ON question_bundles(file_id);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_file_id ON questions(file_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

-- Exams indexes
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_order ON exam_questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_created_at ON exam_results(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_user_id ON knowledge_gaps(user_id);

-- =====================================================
-- 7. TRIGGERS & FUNCTIONS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- Create default preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    -- Create default stats
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    -- Initialize subscription to FREE tier
    INSERT INTO public.user_subscriptions (user_id, plan_tier, uploads_allowed, exams_allowed)
    VALUES (NEW.id, 'free', 2, 2);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_question_bundles_updated_at ON question_bundles;
CREATE TRIGGER update_question_bundles_updated_at
    BEFORE UPDATE ON question_bundles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_sessions_updated_at ON exam_sessions;
CREATE TRIGGER update_exam_sessions_updated_at
    BEFORE UPDATE ON exam_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_gaps_updated_at ON knowledge_gaps;
CREATE TRIGGER update_knowledge_gaps_updated_at
    BEFORE UPDATE ON knowledge_gaps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
    DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
    DROP POLICY IF EXISTS "Users can view own bundles" ON question_bundles;
    DROP POLICY IF EXISTS "Users can create own bundles" ON question_bundles;
    DROP POLICY IF EXISTS "Users can update own bundles" ON question_bundles;
    DROP POLICY IF EXISTS "Users can delete own bundles" ON question_bundles;
    DROP POLICY IF EXISTS "Users can view own questions" ON questions;
    DROP POLICY IF EXISTS "Users can create own questions" ON questions;
    DROP POLICY IF EXISTS "Users can update own questions" ON questions;
    DROP POLICY IF EXISTS "Users can delete own questions" ON questions;
    DROP POLICY IF EXISTS "Users can view question options" ON question_options;
    DROP POLICY IF EXISTS "Users can create question options" ON question_options;
    DROP POLICY IF EXISTS "Users can view own exams" ON exams;
    DROP POLICY IF EXISTS "Users can create own exams" ON exams;
    DROP POLICY IF EXISTS "Users can update own exams" ON exams;
    DROP POLICY IF EXISTS "Users can delete own exams" ON exams;
    DROP POLICY IF EXISTS "Users can view exam questions" ON exam_questions;
    DROP POLICY IF EXISTS "Users can create exam questions" ON exam_questions;
    DROP POLICY IF EXISTS "Users can view own sessions" ON exam_sessions;
    DROP POLICY IF EXISTS "Users can create own sessions" ON exam_sessions;
    DROP POLICY IF EXISTS "Users can update own sessions" ON exam_sessions;
    DROP POLICY IF EXISTS "Users can view own answers" ON user_answers;
    DROP POLICY IF EXISTS "Users can create own answers" ON user_answers;
    DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
    DROP POLICY IF EXISTS "Users can create own results" ON exam_results;
    DROP POLICY IF EXISTS "Users can view own study sessions" ON study_sessions;
    DROP POLICY IF EXISTS "Users can create own study sessions" ON study_sessions;
    DROP POLICY IF EXISTS "Users can view own metrics" ON performance_metrics;
    DROP POLICY IF EXISTS "Users can create own metrics" ON performance_metrics;
    DROP POLICY IF EXISTS "Users can view own knowledge gaps" ON knowledge_gaps;
    DROP POLICY IF EXISTS "Users can manage own knowledge gaps" ON knowledge_gaps;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Subscription policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);

-- Question bundles policies
CREATE POLICY "Users can view own bundles" ON question_bundles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bundles" ON question_bundles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bundles" ON question_bundles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bundles" ON question_bundles FOR DELETE USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Users can view own questions" ON questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own questions" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own questions" ON questions FOR DELETE USING (auth.uid() = user_id);

-- Question options policies
CREATE POLICY "Users can view question options" ON question_options FOR SELECT USING (
    EXISTS (SELECT 1 FROM questions WHERE questions.id = question_options.question_id AND questions.user_id = auth.uid())
);
CREATE POLICY "Users can create question options" ON question_options FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM questions WHERE questions.id = question_options.question_id AND questions.user_id = auth.uid())
);

-- Exams policies
CREATE POLICY "Users can view own exams" ON exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own exams" ON exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exams" ON exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exams" ON exams FOR DELETE USING (auth.uid() = user_id);

-- Exam questions policies
CREATE POLICY "Users can view exam questions" ON exam_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_questions.exam_id AND exams.user_id = auth.uid())
);
CREATE POLICY "Users can create exam questions" ON exam_questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_questions.exam_id AND exams.user_id = auth.uid())
);

-- Exam sessions policies
CREATE POLICY "Users can view own sessions" ON exam_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON exam_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON exam_sessions FOR UPDATE USING (auth.uid() = user_id);

-- User answers policies
CREATE POLICY "Users can view own answers" ON user_answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM exam_sessions WHERE exam_sessions.id = user_answers.session_id AND exam_sessions.user_id = auth.uid())
);
CREATE POLICY "Users can create own answers" ON user_answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM exam_sessions WHERE exam_sessions.id = user_answers.session_id AND exam_sessions.user_id = auth.uid())
);

-- Exam results policies
CREATE POLICY "Users can view own results" ON exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own metrics" ON performance_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own metrics" ON performance_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own knowledge gaps" ON knowledge_gaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own knowledge gaps" ON knowledge_gaps FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
