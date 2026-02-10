'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle, XCircle, Folder } from 'lucide-react'

export default function SyncBundlesPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const userId = localStorage.getItem('userId') || 'demo-user'
      const response = await fetch('/api/bundles/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <Folder className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Sync Question Bundles
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Create bundles from existing questions that don't have bundles yet
          </p>

          <motion.button
            onClick={handleSync}
            disabled={syncing}
            whileHover={{ scale: syncing ? 1 : 1.05 }}
            whileTap={{ scale: syncing ? 1 : 0.95 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              background: syncing 
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: syncing ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <RefreshCw 
              style={{ 
                width: '1.25rem', 
                height: '1.25rem',
                animation: syncing ? 'spin 1s linear infinite' : 'none'
              }} 
            />
            {syncing ? 'Syncing Bundles...' : 'Sync Bundles'}
          </motion.button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
                borderRadius: '0.75rem',
                border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {result.success ? (
                  <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
                ) : (
                  <XCircle style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626' }} />
                )}
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600',
                  color: result.success ? '#16a34a' : '#dc2626'
                }}>
                  {result.success ? 'Sync Successful!' : 'Sync Failed'}
                </h3>
              </div>

              <p style={{ 
                color: result.success ? '#15803d' : '#b91c1c',
                marginBottom: '1rem'
              }}>
                {result.message || result.error}
              </p>

              {result.success && result.bundlesCreated > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1fae5'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>
                      {result.bundlesCreated}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Bundles Created
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
                      {result.totalFiles}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Total Files
                    </div>
                  </div>
                </div>
              )}

              {result.success && (
                <motion.a
                  href="/questions"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <Folder style={{ width: '1rem', height: '1rem' }} />
                  View Bundles
                </motion.a>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}