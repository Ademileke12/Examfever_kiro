-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but allow for manual creation)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = id);

-- User Preferences Policies
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- User Stats Policies
-- Users can view their own stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own stats
CREATE POLICY "Users can delete own stats" ON user_stats
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON user_stats TO authenticated;

-- Grant permissions to anonymous users (for public access if needed)
GRANT USAGE ON SCHEMA public TO anon;

-- Create a function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current user's profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS SETOF user_profiles AS $$
BEGIN
    IF NOT public.is_authenticated() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT * FROM user_profiles
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
