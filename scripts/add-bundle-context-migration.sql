-- Migration to add bundle_context field to exams table
-- Run this if you already have an existing database

-- Add bundle_context column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' AND column_name = 'bundle_context'
    ) THEN
        ALTER TABLE exams ADD COLUMN bundle_context JSONB DEFAULT '{}';
        RAISE NOTICE 'Added bundle_context column to exams table';
    ELSE
        RAISE NOTICE 'bundle_context column already exists in exams table';
    END IF;
END $$;

SELECT 'Bundle context migration completed!' as message;