'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Plus,
  Folder
} from 'lucide-react'
import BundleGrid from '@/components/bundles/BundleGrid'
import { Bundle } from '@/app/api/bundles/route'
import { ParticleBackground } from '@/components/ui/ParticleBackground'

export default function QuestionsPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadBundles()
  }, [])

  const loadBundles = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId') || 'demo-user'
      const response = await fetch(`/api/bundles?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setBundles(data.bundles)
      } else {
        console.error('Failed to load bundles:', data.error)
      }
    } catch (error) {
      console.error('Error loading bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBundle = (bundle: Bundle) => {
    setEditingBundle(bundle)
    // TODO: Implement bundle editing modal
    console.log('Edit bundle:', bundle)
  }

  const handleDeleteBundle = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this entire bundle? This will delete all questions in this bundle.')) {
      return
    }

    try {
      const userId = localStorage.getItem('userId') || 'demo-user'
      const response = await fetch(`/api/bundles/${fileId}?userId=${userId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setBundles(prev => prev.filter(b => b.fileId !== fileId))
      } else {
        alert('Failed to delete bundle: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting bundle:', error)
      alert('Failed to delete bundle')
    }
  }

  const handleCreateExam = async (fileId: string) => {
    const bundle = bundles.find(b => b.fileId === fileId)
    if (!bundle) return

    try {
      // Show loading state (optional)
      console.log(`Starting quick exam with all questions from ${bundle.bundleName}...`)
      
      const userId = localStorage.getItem('userId') || 'demo-user'
      
      // Create exam with ALL questions from the bundle
      const response = await fetch('/api/exams/quick-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bundleId: fileId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Redirect directly to exam interface
        window.location.href = `/exam?id=${data.examId}`
      } else {
        alert('Failed to start exam: ' + data.error)
      }
    } catch (error) {
      console.error('Error starting quick exam:', error)
      alert('Failed to start exam. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParticleBackground />
      
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: isMobile ? '0 1rem' : '0 1rem',
        paddingTop: isMobile ? '5rem' : '6rem',
        paddingBottom: isMobile ? '2rem' : '2rem'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '3rem' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '4rem' : '4rem',
            height: isMobile ? '4rem' : '4rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '1rem',
            marginBottom: isMobile ? '1.5rem' : '1.5rem'
          }}>
            <Folder style={{ 
              width: isMobile ? '2rem' : '2rem', 
              height: isMobile ? '2rem' : '2rem', 
              color: 'white' 
            }} />
          </div>
          <h1 style={{
            fontSize: isMobile ? 'clamp(2rem, 6vw, 3rem)' : 'clamp(2.5rem, 5vw, 3rem)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #1e40af 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: isMobile ? '1rem' : '1rem',
            lineHeight: '1.2'
          }}>
            Question Bundles
          </h1>
          <p style={{
            fontSize: isMobile ? '1rem' : '1.25rem',
            color: 'hsl(var(--muted-foreground))',
            maxWidth: '32rem',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Organize your questions by source document for focused studying
          </p>
        </motion.div>

        {/* Bundle Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {bundles.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '3rem 0' : '3rem 0' }}>
              <div style={{
                width: isMobile ? '5rem' : '6rem',
                height: isMobile ? '5rem' : '6rem',
                margin: '0 auto',
                marginBottom: isMobile ? '1.5rem' : '1.5rem',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen style={{ 
                  width: isMobile ? '2.5rem' : '3rem', 
                  height: isMobile ? '2.5rem' : '3rem', 
                  color: 'hsl(var(--muted-foreground))' 
                }} />
              </div>
              <h3 className="text-foreground" style={{
                fontSize: isMobile ? '1.25rem' : '1.25rem',
                fontWeight: '600',
                marginBottom: isMobile ? '0.5rem' : '0.5rem'
              }}>
                No question bundles yet
              </h3>
              <p className="text-muted-foreground" style={{
                marginBottom: isMobile ? '1.5rem' : '1.5rem',
                fontSize: isMobile ? '1rem' : '1rem',
                lineHeight: '1.6'
              }}>
                Upload some PDFs to create your first question bundles.
              </p>
              <motion.a
                href="/upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="magnetic glass glass-hover btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: isMobile ? '0.75rem 1.5rem' : '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  minHeight: isMobile ? '44px' : 'auto'
                }}
              >
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                Upload PDF
              </motion.a>
            </div>
          ) : (
            <BundleGrid
              bundles={bundles}
              loading={loading}
              onRefresh={loadBundles}
              onEditBundle={handleEditBundle}
              onDeleteBundle={handleDeleteBundle}
              onCreateExam={handleCreateExam}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}