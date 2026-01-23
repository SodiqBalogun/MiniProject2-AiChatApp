'use client'

import { FileText, Loader2 } from 'lucide-react'

interface ChatSummaryButtonProps {
  onClick: () => void
  loading: boolean
}

export function ChatSummaryButton({ onClick, loading }: ChatSummaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50"
      style={{ 
        borderColor: 'var(--border)', 
        backgroundColor: 'var(--background)', 
        color: 'var(--foreground)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--muted)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--background)'
      }}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Generate Chat Summary
        </>
      )}
    </button>
  )
}

interface ChatSummaryDisplayProps {
  summary: string | null
  isOpen: boolean
  onClose: () => void
}

export function ChatSummaryDisplay({ summary, isOpen, onClose }: ChatSummaryDisplayProps) {
  if (!isOpen || !summary) return null

  return (
    <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
          Chat Summary
        </h3>
        <button
          onClick={onClose}
          className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
        >
          ×
        </button>
      </div>
      <p className="text-sm text-purple-800 dark:text-purple-200">{summary}</p>
    </div>
  )
}
