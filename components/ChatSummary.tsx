'use client'

import { FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

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
        color: 'var(--foreground)',
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

interface ChatSummaryToggleButtonProps {
  onClick: () => void
  isExpanded: boolean
}

export function ChatSummaryToggleButton({ onClick, isExpanded }: ChatSummaryToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--muted)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--background)'
      }}
    >
      <FileText className="h-4 w-4" />
      Chat Summary
      {isExpanded ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )
}

interface ChatSummaryPanelProps {
  summary: string | null
  isExpanded: boolean
  onToggle: () => void
  loading: boolean
  error: string | null
}

/**
 * Panel for the AI Chat Summary. Content is shown when expanded (controlled by header toggle button).
 */
export function ChatSummaryPanel({
  summary,
  isExpanded,
  onToggle,
  loading,
  error,
}: ChatSummaryPanelProps) {
  const hasSummary = !!summary?.trim()

  if (!isExpanded) return null

  return (
    <aside
      className="shrink-0 border-b px-4 py-3 transition-colors"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--muted)',
        color: 'var(--foreground)',
      }}
      aria-label="Chat summary"
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating summary…
        </div>
      ) : hasSummary ? (
        <p className="text-sm leading-relaxed">{summary}</p>
      ) : error ? (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {error} Try again using the button above.
        </p>
      ) : (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Generate a summary using the button above to see it here.
        </p>
      )}
    </aside>
  )
}
