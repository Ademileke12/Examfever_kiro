-- Performance Tracking and Aggregation Schema

-- Performance Aggregates Table (for faster queries)
CREATE TABLE IF NOT EXISTS performance_aggregates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_exams INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- in seconds
    average_accuracy DECIMAL(5,2),
    average_speed DECIMAL(8,2), -- questions per minute
    topics_studied TEXT[],
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_start)
);

-- Learning Streaks Table
CREATE TABLE IF NOT EXISTS learning_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL, -- 'daily', 'weekly'
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Performance Goals Table
CREATE TABLE IF NOT EXISTS performance_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'accuracy', 'speed', 'consistency', 'streak'
    target_value DECIMAL(8,2) NOT NULL,
    current_value DECIMAL(8,2) DEFAULT 0,
    deadline DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Recommendations Table
CREATE TABLE IF NOT EXISTS study_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL, -- 'low', 'medium', 'high'
    estimated_impact DECIMAL(3,2),
    action_items TEXT[],
    related_topics TEXT[],
    is_dismissed BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Insights Cache Table
CREATE TABLE IF NOT EXISTS performance_insights_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insights_data JSONB NOT NULL,
    cache_key TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cache_key)
);

-- Indexes for Performance Tracking
CREATE INDEX IF NOT EXISTS idx_performance_aggregates_user_period ON performance_aggregates(user_id, period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_type ON learning_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_performance_goals_user_type ON performance_goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_study_recommendations_user_priority ON study_recommendations(user_id, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_insights_cache_user_key ON performance_insights_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_performance_insights_cache_expires ON performance_insights_cache(expires_at);

-- Functions for Performance Calculations

-- Function to calculate user performance metrics
CREATE OR REPLACE FUNCTION calculate_user_performance_metrics(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_questions INTEGER;
    correct_questions INTEGER;
    total_time INTEGER;
    exam_count INTEGER;
BEGIN
    -- Get basic metrics
    SELECT 
        COALESCE(SUM(questions_answered), 0),
        COALESCE(SUM(questions_correct), 0),
        COALESCE(SUM(total_time), 0),
        COUNT(*)
    INTO total_questions, correct_questions, total_time, exam_count
    FROM performance_history 
    WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '%s days' % p_days;
    
    -- Calculate metrics
    result := jsonb_build_object(
        'accuracy', CASE WHEN total_questions > 0 THEN ROUND((correct_questions::DECIMAL / total_questions) * 100, 2) ELSE 0 END,
        'average_time', CASE WHEN total_questions > 0 THEN ROUND(total_time::DECIMAL / total_questions, 2) ELSE 0 END,
        'total_questions', total_questions,
        'total_correct', correct_questions,
        'total_exams', exam_count,
        'questions_per_minute', CASE WHEN total_time > 0 THEN ROUND((total_questions::DECIMAL / (total_time::DECIMAL / 60)), 2) ELSE 0 END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update performance aggregates
CREATE OR REPLACE FUNCTION update_performance_aggregates(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    -- Update daily aggregate
    INSERT INTO performance_aggregates (user_id, period_type, period_start, period_end, total_exams, total_questions, total_correct, total_time, average_accuracy, average_speed)
    SELECT 
        p_user_id,
        'daily',
        p_date,
        p_date,
        COUNT(*),
        COALESCE(SUM(questions_answered), 0),
        COALESCE(SUM(questions_correct), 0),
        COALESCE(SUM(total_time), 0),
        CASE WHEN SUM(questions_answered) > 0 THEN ROUND((SUM(questions_correct)::DECIMAL / SUM(questions_answered)) * 100, 2) ELSE 0 END,
        CASE WHEN SUM(total_time) > 0 THEN ROUND((SUM(questions_answered)::DECIMAL / (SUM(total_time)::DECIMAL / 60)), 2) ELSE 0 END
    FROM performance_history 
    WHERE user_id = p_user_id AND date = p_date
    ON CONFLICT (user_id, period_type, period_start) 
    DO UPDATE SET
        total_exams = EXCLUDED.total_exams,
        total_questions = EXCLUDED.total_questions,
        total_correct = EXCLUDED.total_correct,
        total_time = EXCLUDED.total_time,
        average_accuracy = EXCLUDED.average_accuracy,
        average_speed = EXCLUDED.average_speed,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates
CREATE TRIGGER update_performance_aggregates_updated_at 
    BEFORE UPDATE ON performance_aggregates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_streaks_updated_at 
    BEFORE UPDATE ON learning_streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_goals_updated_at 
    BEFORE UPDATE ON performance_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_recommendations_updated_at 
    BEFORE UPDATE ON study_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
