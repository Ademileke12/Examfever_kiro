'use client'

import { useState } from 'react'
import { Settings, Trash2, Database, Shield } from 'lucide-react'

interface UploadSettingsProps {
  onSettingsChange?: (settings: UploadSettings) => void
}

export interface UploadSettings {
  deleteAfterProcessing: boolean
  retentionDays: number
  keepOnError: boolean
}

export default function UploadSettings({ onSettingsChange }: UploadSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<UploadSettings>({
    deleteAfterProcessing: true,
    retentionDays: 0,
    keepOnError: true
  })

  const handleSettingChange = (key: keyof UploadSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'
          ;(e.target as HTMLButtonElement).style.borderColor = '#d1d5db'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
          ;(e.target as HTMLButtonElement).style.borderColor = '#e5e7eb'
        }}
      >
        <Settings style={{ width: '1rem', height: '1rem' }} />
        Processing Info
      </button>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
          Processing Info
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            padding: '0.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.25rem',
            color: '#6b7280',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Processing info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              Direct Processing
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Files are processed in memory - no storage required
            </div>
          </div>
        </div>

        {/* Question generation info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              Automatic AI Generation
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Questions generated and saved automatically
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f0fdf4',
        borderRadius: '0.375rem',
        border: '1px solid #bbf7d0'
      }}>
        <p style={{ fontSize: '0.75rem', color: '#166534', margin: 0 }}>
          ✅ <strong>Optimized Workflow:</strong> Files are processed directly without storage. 
          Questions are permanently saved to your question bank for creating exams.
        </p>
      </div>
    </div>
  )
}