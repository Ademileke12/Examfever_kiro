-- Fix RLS policies for affiliate_profiles to allow users to create their own profile
-- This is needed for the lazy-creation logic in the API

-- Allow users to insert their own profile
CREATE POLICY "Users can create own affiliate profile" ON affiliate_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile (if needed in future, though mostly handled by system)
-- We might want to restrict what fields they can update, but for now let's keep it simple or rely on RPCs
-- Actually, the API doesn't update profiles directly, RPCs do with SECURITY DEFINER.
-- So we just need INSERT.
