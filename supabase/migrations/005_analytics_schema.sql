-- Analytics Schema for User Activity Tracking and Performance Analysis

-- User Activities Table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    session_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance History Table
CREATE TABLE IF NOT EXISTS performance_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID,
    date DATE DEFAULT CURRENT_DATE,
    accuracy DECIMAL(5,2),
    average_time INTEGER, -- in seconds
    questions_answered INTEGER,
    questions_correct INTEGER,
    total_time INTEGER, -- in seconds
    topics_covered TEXT[],
    difficulty_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions Table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    activities_count INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    topics_studied TEXT[],
    session_quality DECIMAL(3,2), -- 0-1 quality score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Gaps Table
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    accuracy_rate DECIMAL(5,2),
    question_count INTEGER,
    improvement_needed DECIMAL(3,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic, difficulty_level)
);

-- Study Patterns Table
CREATE TABLE IF NOT EXISTS study_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    hour_of_day INTEGER, -- 0-23
    activity_count INTEGER DEFAULT 0,
    average_performance DECIMAL(5,2),
    consistency_score DECIMAL(3,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, day_of_week, hour_of_day)
);

-- Topic Mastery Table
CREATE TABLE IF NOT EXISTS topic_mastery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    mastery_level DECIMAL(3,2), -- 0-1 mastery score
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    average_time INTEGER, -- in seconds
    last_practiced TIMESTAMP WITH TIME ZONE,
    improvement_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id_timestamp ON user_activities(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_session ON user_activities(session_id);

CREATE INDEX IF NOT EXISTS idx_performance_history_user_date ON performance_history(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_history_topics ON performance_history USING GIN(topics_covered);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_time ON study_sessions(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_user_topic ON knowledge_gaps(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_study_patterns_user_time ON study_patterns(user_id, day_of_week, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_topic ON topic_mastery(user_id, topic);

-- Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_topic_mastery_updated_at 
    BEFORE UPDATE ON topic_mastery 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
