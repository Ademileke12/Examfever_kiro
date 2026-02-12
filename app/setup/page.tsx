'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import { pageVariants } from '@/lib/animations/variants'

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [autoSetupLoading, setAutoSetupLoading] = useState(false)
  const [autoSetupResult, setAutoSetupResult] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/database/status')
      const data = await response.json()
      setDbStatus(data.data)
    } catch (error) {
      console.error('Failed to check database status:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAutoSetup = async () => {
    setAutoSetupLoading(true)
    setAutoSetupResult(null)
    
    try {
      const response = await fetch('/api/database/setup', {
        method: 'POST'
      })
      const data = await response.json()
      setAutoSetupResult(data)
      
      // Refresh database status after setup attempt
      if (data.success) {
        setTimeout(() => {
          checkDatabaseStatus()
        }, 1000)
      }
    } catch (error) {
      setAutoSetupResult({
        success: false,
        error: 'Failed to run auto setup',
        message: 'Please use manual setup instead.'
      })
    } finally {
      setAutoSetupLoading(false)
    }
  }

  const testDatabase = async () => {
    setTestLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/database/test')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to test database',
        message: 'Could not connect to test endpoint'
      })
    } finally {
      setTestLoading(false)
    }
  }
  const copySetupScript = async () => {
    try {
      await navigator.clipboard.writeText(setupScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy script:', error)
    }
  }

  const setupScript = `-- ExamFever Database Setup Script
-- Run this in your Supabase SQL Editor or via CLI

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table to store AI-generated questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL, -- Using TEXT for demo, change to UUID for production
  file_id TEXT NOT NULL, -- Reference to uploaded PDF - now required
  course_id TEXT, -- Course/subject identifier derived from PDF
  subject_tag TEXT, -- Subject classification (e.g., 'mathematics', 'chemistry')
  document_title TEXT, -- Original PDF filename/title
  type TEXT NOT NULL CHECK (type IN ('multiple-choice')), -- Only support multiple-choice questions
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
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table to store exam configurations
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL, -- Using TEXT for demo
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT
);

-- Performance history table for analytics
CREATE TABLE IF NOT EXISTS performance_history (
  id UUID PRIMARY KEY,
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
$$ language 'plpgsql';

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

SELECT 'Database setup completed successfully!' as message;`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1rem 2rem' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Database Setup
          </h1>
          <p style={{ color: '#6b7280' }}>
            Set up the required database tables for ExamFever to work properly
          </p>
        </div>

        {/* Database Status */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Database style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              Database Status
            </h2>
            <button
              onClick={checkDatabaseStatus}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              Refresh
            </button>
            <button
              onClick={testDatabase}
              disabled={testLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: testLoading ? '#9ca3af' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: testLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {testLoading ? 'Testing...' : 'Test DB'}
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#6b7280' }}>Checking database status...</p>
          ) : dbStatus ? (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: dbStatus.allTablesExist ? '#f0fdf4' : '#fef2f2',
                borderRadius: '0.375rem',
                border: `1px solid ${dbStatus.allTablesExist ? '#bbf7d0' : '#fecaca'}`
              }}>
                {dbStatus.allTablesExist ? (
                  <CheckCircle style={{ width: '1rem', height: '1rem', color: '#16a34a' }} />
                ) : (
                  <XCircle style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                )}
                <span style={{ 
                  fontWeight: '500', 
                  color: dbStatus.allTablesExist ? '#166534' : '#dc2626' 
                }}>
                  {dbStatus.message}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {Object.entries(dbStatus.tables).map(([table, exists]) => (
                  <div
                    key={table}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: exists ? '#f0fdf4' : '#fef2f2',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {exists ? (
                      <CheckCircle style={{ width: '0.875rem', height: '0.875rem', color: '#16a34a' }} />
                    ) : (
                      <XCircle style={{ width: '0.875rem', height: '0.875rem', color: '#dc2626' }} />
                    )}
                    <span style={{ color: exists ? '#166534' : '#dc2626' }}>{table}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#dc2626' }}>Failed to check database status</p>
          )}

          {/* Test Result */}
          {testResult && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '0.375rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {testResult.success ? (
                  <CheckCircle style={{ width: '1rem', height: '1rem', color: '#16a34a' }} />
                ) : (
                  <XCircle style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                )}
                <span style={{ 
                  fontWeight: '500', 
                  color: testResult.success ? '#166534' : '#dc2626',
                  fontSize: '0.875rem'
                }}>
                  Database Test: {testResult.success ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <p style={{ 
                color: testResult.success ? '#166534' : '#dc2626',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {testResult.message}
              </p>
              {testResult.error && (
                <p style={{ 
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                  fontFamily: 'monospace'
                }}>
                  Error: {testResult.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Auto Setup Section */}
        {dbStatus && !dbStatus.allTablesExist && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              🚀 Quick Setup (Try This First!)
            </h2>
            
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Click the button below to automatically set up the database tables. If this doesn't work, 
              use the manual setup instructions below.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <button
                onClick={runAutoSetup}
                disabled={autoSetupLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: autoSetupLoading ? '#9ca3af' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: autoSetupLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <Database style={{ width: '1rem', height: '1rem' }} />
                {autoSetupLoading ? 'Setting up...' : 'Auto Setup Database'}
              </button>
              
              {autoSetupResult && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: autoSetupResult.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${autoSetupResult.success ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}>
                  {autoSetupResult.success ? (
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: '#16a34a' }} />
                  ) : (
                    <XCircle style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                  )}
                  <span style={{ color: autoSetupResult.success ? '#166534' : '#dc2626' }}>
                    {autoSetupResult.message}
                  </span>
                </div>
              )}
            </div>
            
            {autoSetupResult && !autoSetupResult.success && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#92400e'
              }}>
                <strong>Auto setup not available.</strong> Please use the manual setup instructions below.
                If you encounter SQL syntax errors, try the simplified setup script in <code>scripts/setup-database-simple.sql</code>.
              </div>
            )}
          </div>
        )}

        {/* Manual Setup Instructions */}
        {dbStatus && !dbStatus.allTablesExist && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              📋 Manual Setup Instructions
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold' 
                }}>
                  1
                </span>
                <div>
                  <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                    Go to your Supabase project dashboard
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    Open Supabase Dashboard
                    <ExternalLink style={{ width: '0.875rem', height: '0.875rem' }} />
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold' 
                }}>
                  2
                </span>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                  Open the SQL Editor in your project
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  marginTop: '0.125rem'
                }}>
                  3
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 0.5rem 0' }}>
                    Choose the appropriate setup script:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem', border: '1px solid #bfdbfe' }}>
                      <strong style={{ color: '#1e40af' }}>New Database:</strong> Use the main setup script below
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem', border: '1px solid #fbbf24' }}>
                      <strong style={{ color: '#92400e' }}>Existing Database:</strong> Use <code>scripts/add-course-fields-migration.sql</code> to add missing fields
                    </div>
                  </div>
                  <button
                    onClick={copySetupScript}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: copied ? '#16a34a' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Copy style={{ width: '1rem', height: '1rem' }} />
                    {copied ? 'Copied!' : 'Copy Setup Script'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold' 
                }}>
                  4
                </span>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                  Run the script in the SQL Editor
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold' 
                }}>
                  5
                </span>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                  Refresh this page to verify the setup
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Setup Script */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              Database Setup Script
            </h2>
            <button
              onClick={copySetupScript}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: copied ? '#16a34a' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Copy style={{ width: '1rem', height: '1rem' }} />
              {copied ? 'Copied!' : 'Copy Script'}
            </button>
          </div>
          
          <pre style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            padding: '1rem',
            fontSize: '0.75rem',
            overflow: 'auto',
            maxHeight: '400px',
            margin: 0
          }}>
            <code>{setupScript}</code>
          </pre>
        </div>
      </motion.div>
    </div>
  )
}