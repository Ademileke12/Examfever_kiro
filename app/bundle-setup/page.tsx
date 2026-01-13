'use client'

import { useState } from 'react'

export default function BundleSetupPage() {
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [populateStatus, setPopulateStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database/setup-bundles-simple')
      const data = await response.json()
      setSetupStatus(data)
    } catch (error) {
      setSetupStatus({ success: false, error: 'Failed to check setup' })
    }
    setLoading(false)
  }

  const populateBundles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bundles/populate', { method: 'POST' })
      const data = await response.json()
      setPopulateStatus(data)
    } catch (error) {
      setPopulateStatus({ success: false, error: 'Failed to populate bundles' })
    }
    setLoading(false)
  }

  const manualSQL = `-- Run this SQL in your Supabase SQL Editor:

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
  action TEXT NOT NULL,
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

-- Populate bundle metadata for existing questions
INSERT INTO question_bundles (file_id, user_id, bundle_name, subject_tag, upload_date)
SELECT DISTINCT 
  file_id,
  user_id,
  COALESCE(document_title, file_id) as bundle_name,
  subject_tag,
  MIN(created_at) as upload_date
FROM questions 
WHERE file_id IS NOT NULL
ON CONFLICT (file_id) DO NOTHING;`

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Bundle System Setup
        </h1>

        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Set up the bundle system to organize your questions by PDF files
        </p>

        {/* Setup Status */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            Step 1: Check Bundle Tables
          </h2>
          
          <button
            onClick={checkSetup}
            disabled={loading}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Checking...' : 'Check Setup Status'}
          </button>

          {setupStatus && (
            <div style={{
              background: setupStatus.success ? '#dcfce7' : '#fef2f2',
              border: `1px solid ${setupStatus.success ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '6px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <p style={{
                color: setupStatus.success ? '#166534' : '#dc2626',
                fontWeight: '500'
              }}>
                {setupStatus.message || (setupStatus.success ? 'Bundle tables exist!' : 'Bundle tables missing')}
              </p>
              {setupStatus.error && (
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Error: {setupStatus.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Manual Setup Instructions */}
        {setupStatus && !setupStatus.success && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '1rem'
            }}>
              Step 2: Create Bundle Tables Manually
            </h2>
            
            <p style={{
              color: '#92400e',
              marginBottom: '1rem'
            }}>
              Please run the following SQL in your Supabase SQL Editor:
            </p>

            <ol style={{
              color: '#92400e',
              marginBottom: '1rem',
              paddingLeft: '1.5rem'
            }}>
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy and paste the SQL below</li>
              <li>Click "Run" to execute</li>
              <li>Come back and check setup status again</li>
            </ol>

            <div style={{
              background: '#1f2937',
              color: '#f9fafb',
              padding: '1rem',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              <pre>{manualSQL}</pre>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(manualSQL)}
              style={{
                background: '#92400e',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}
            >
              Copy SQL to Clipboard
            </button>
          </div>
        )}

        {/* Populate Bundles */}
        {setupStatus && setupStatus.success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#166534',
              marginBottom: '1rem'
            }}>
              Step 3: Populate Bundles from Existing Questions
            </h2>
            
            <p style={{
              color: '#166534',
              marginBottom: '1rem'
            }}>
              Create bundles from your existing questions organized by PDF files.
            </p>

            <button
              onClick={populateBundles}
              disabled={loading}
              style={{
                background: '#16a34a',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Populating...' : 'Populate Bundles'}
            </button>

            {populateStatus && (
              <div style={{
                background: populateStatus.success ? '#dcfce7' : '#fef2f2',
                border: `1px solid ${populateStatus.success ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '6px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <p style={{
                  color: populateStatus.success ? '#166534' : '#dc2626',
                  fontWeight: '500'
                }}>
                  {populateStatus.message}
                </p>
                
                {populateStatus.success && populateStatus.stats && (
                  <div style={{
                    marginTop: '1rem',
                    color: '#166534',
                    fontSize: '0.875rem'
                  }}>
                    <p>📊 Total Questions: {populateStatus.stats.totalQuestions}</p>
                    <p>📁 Bundles Created: {populateStatus.bundlesCreated}</p>
                    <p>📈 Avg Questions/Bundle: {populateStatus.stats.averageQuestionsPerBundle}</p>
                  </div>
                )}

                {populateStatus.error && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Error: {populateStatus.error}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <a
            href="/browse"
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              marginRight: '1rem'
            }}
          >
            Go to Browse Page
          </a>
          
          <a
            href="/dashboard"
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}