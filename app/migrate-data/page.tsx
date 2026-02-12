'use client'

import { useState, useEffect } from 'react'
import { getUserId } from '@/lib/auth/user'

export default function MigrateDataPage() {
  const [migrating, setMigrating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isDark, setIsDark] = useState(false)

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  const handleMigration = async () => {
    setMigrating(true)
    setResult(null)

    try {
      const currentUserId = getUserId()
      
      const response = await fetch('/api/migrate-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromUserId: 'demo-user',
          toUserId: currentUserId
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed'
      })
    } finally {
      setMigrating(false)
    }
  }

  const currentUserId = getUserId()

  // Theme-aware styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
      padding: '0'
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    },
    card: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      boxShadow: isDark 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '2rem',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#0f172a',
      marginBottom: '1.5rem',
      textAlign: 'center' as const
    },
    infoBox: {
      background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
      border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #93c5fd',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    },
    infoTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: isDark ? '#dbeafe' : '#1e40af',
      marginBottom: '1rem'
    },
    infoText: {
      color: isDark ? '#bfdbfe' : '#1e40af',
      lineHeight: '1.6',
      marginBottom: '0.5rem'
    },
    code: {
      background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#bfdbfe',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontFamily: 'monospace'
    },
    button: {
      width: '100%',
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#ffffff',
      background: migrating 
        ? (isDark ? '#64748b' : '#94a3b8')
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      border: 'none',
      borderRadius: '12px',
      cursor: migrating ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: migrating 
        ? 'none' 
        : '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60px'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: '2px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '0.5rem'
    },
    resultBox: {
      padding: '1.5rem',
      borderRadius: '12px',
      marginTop: '1.5rem',
      border: '1px solid',
      ...(result?.success ? {
        background: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7',
        borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#86efac',
        color: isDark ? '#bbf7d0' : '#166534'
      } : {
        background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5',
        color: isDark ? '#fecaca' : '#991b1b'
      })
    },
    resultTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    afterBox: {
      background: isDark ? '#334155' : '#f1f5f9',
      borderRadius: '12px',
      padding: '1.5rem',
      marginTop: '2rem'
    },
    afterTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#0f172a',
      marginBottom: '1rem'
    },
    afterList: {
      color: isDark ? '#cbd5e1' : '#475569',
      lineHeight: '1.6'
    }
  }

  return (
    <div style={styles.container}>
      
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            🔄 Data Migration Tool
          </h1>
          
          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>
              Current Situation:
            </h3>
            <div style={styles.infoText}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your Browser User ID:</strong>{' '}
                <code style={styles.code}>{currentUserId}</code>
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Previous Upload User ID:</strong>{' '}
                <code style={styles.code}>demo-user</code>
              </p>
              <p style={{ marginTop: '1rem' }}>
                Your uploaded PDFs and questions are saved under 'demo-user' but your browser is using '{currentUserId}'. 
                This migration will move all your data to the correct user ID.
              </p>
            </div>
          </div>

          <button 
            onClick={handleMigration}
            disabled={migrating}
            style={styles.button}
            onMouseOver={(e) => {
              if (!migrating) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(59, 130, 246, 0.5)'
              }
            }}
            onMouseOut={(e) => {
              if (!migrating) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
              }
            }}
          >
            {migrating ? (
              <>
                <div style={styles.spinner}></div>
                Migrating Your Data...
              </>
            ) : (
              '🚀 Migrate My Data'
            )}
          </button>

          {result && (
            <div style={styles.resultBox}>
              <h3 style={styles.resultTitle}>
                {result.success ? '✅ Migration Successful!' : '❌ Migration Failed'}
              </h3>
              
              {result.success ? (
                <div>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Questions Migrated:</strong> {result.data?.questionsMigrated || 0}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Bundles Migrated:</strong> {result.data?.bundlesMigrated || 0}
                  </p>
                  <p style={{ marginTop: '1rem', fontWeight: '600' }}>
                    🎉 You can now go to the Questions page and see all your bundles!
                  </p>
                </div>
              ) : (
                <p>
                  <strong>Error:</strong> {result.error}
                </p>
              )}
            </div>
          )}

          <div style={styles.afterBox}>
            <h3 style={styles.afterTitle}>
              After Migration:
            </h3>
            <ol style={styles.afterList}>
              <li style={{ marginBottom: '0.5rem' }}>All your existing bundles will appear in the Questions page</li>
              <li style={{ marginBottom: '0.5rem' }}>Future PDF uploads will use the correct user ID automatically</li>
              <li>You can delete this page after migration is complete</li>
            </ol>
          </div>
        </div>
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