'use client'

import { useState, useEffect } from 'react'

export default function BundleSetupPage() {
  const [setupStatus, setSetupStatus] = useState<'checking' | 'needs-setup' | 'ready' | 'error'>('checking')
  const [setupData, setSetupData] = useState<any>(null)
  const [isPopulating, setIsPopulating] = useState(false)
  const [populateResult, setPopulateResult] = useState<any>(null)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/database/setup-bundles-simple')
      const data = await response.json()
      
      if (data.tablesExist) {
        setSetupStatus('ready')
        // Check if we need to populate data
        const populateResponse = await fetch('/api/bundles/populate')
        const populateData = await populateResponse.json()
        setSetupData(populateData)
      } else {
        setSetupStatus('needs-setup')
        setSetupData(data)
      }
    } catch (error) {
      setSetupStatus('error')
      setSetupData({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const populateBundles = async () => {
    setIsPopulating(true)
    try {
      const response = await fetch('/api/bundles/populate', { method: 'POST' })
      const data = await response.json()
      setPopulateResult(data)
      
      if (data.success) {
        // Refresh status
        await checkSetupStatus()
      }
    } catch (error) {
      setPopulateResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setIsPopulating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('SQL copied to clipboard!')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
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

        {setupStatus === 'checking' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Checking bundle system status...</p>
          </div>
        )}

        {setupStatus === 'needs-setup' && (
          <div>
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Manual Setup Required</h3>
              <p style={{ color: '#92400e' }}>
                The bundle system tables need to be created in your Supabase database.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Setup Instructions:</h3>
              <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Supabase Dashboard</a></li>
                <li>Navigate to <strong>SQL Editor</strong></li>
                <li>Copy the SQL below and paste it into the editor</li>
                <li>Click <strong>"Run"</strong> to execute the SQL</li>
                <li>Return to this page and click <strong>"Check Status"</strong></li>
              </ol>
            </div>

            {setupData?.sql && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h4>SQL to Execute:</h4>
                  <button
                    onClick={() => copyToClipboard(setupData.sql)}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Copy SQL
                  </button>
                </div>
                <pre style={{
                  background: '#f3f4f6',
                  padding: '1rem',
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  maxHeight: '300px'
                }}>
                  {setupData.sql}
                </pre>
              </div>
            )}

            <button
              onClick={checkSetupStatus}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Check Status Again
            </button>
          </div>
        )}

        {setupStatus === 'ready' && (
          <div>
            <div style={{
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>✅ Bundle System Ready</h3>
              <p style={{ color: '#065f46' }}>
                Bundle tables are properly set up and accessible.
              </p>
            </div>

            {setupData && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Current Status:</h3>
                <div style={{
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p><strong>Total Bundles:</strong> {setupData.totalBundles}</p>
                  <p><strong>Question Files:</strong> {setupData.totalQuestionFiles}</p>
                  {setupData.needsPopulation && (
                    <p style={{ color: '#f59e0b' }}>
                      <strong>Missing Bundles:</strong> {setupData.missingBundles} files need bundle creation
                    </p>
                  )}
                </div>
              </div>
            )}

            {setupData?.needsPopulation && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Populate Bundle Data</h4>
                <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                  Create bundle entries for existing questions that don't have bundles yet.
                </p>
                <button
                  onClick={populateBundles}
                  disabled={isPopulating}
                  style={{
                    background: isPopulating ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: isPopulating ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {isPopulating ? 'Populating...' : 'Populate Bundles'}
                </button>
              </div>
            )}

            {populateResult && (
              <div style={{
                background: populateResult.success ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${populateResult.success ? '#10b981' : '#ef4444'}`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ 
                  color: populateResult.success ? '#065f46' : '#991b1b',
                  marginBottom: '0.5rem' 
                }}>
                  {populateResult.success ? '✅ Population Complete' : '❌ Population Failed'}
                </h4>
                <p style={{ 
                  color: populateResult.success ? '#065f46' : '#991b1b' 
                }}>
                  {populateResult.message}
                </p>
                {populateResult.bundlesCreated && (
                  <p style={{ 
                    color: populateResult.success ? '#065f46' : '#991b1b',
                    marginTop: '0.5rem'
                  }}>
                    Created {populateResult.bundlesCreated} bundles
                  </p>
                )}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <a
                href="/browse"
                style={{
                  display: 'inline-block',
                  background: '#2563eb',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Go to Browse Page
              </a>
            </div>
          </div>
        )}

        {setupStatus === 'error' && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>❌ Setup Error</h3>
            <p style={{ color: '#991b1b' }}>
              {setupData?.error || 'An unknown error occurred during setup check.'}
            </p>
            <button
              onClick={checkSetupStatus}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                marginTop: '1rem'
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}