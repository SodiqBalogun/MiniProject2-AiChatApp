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

interface ChatSummaryPanelProps {
  summary: string | null
  isExpanded: boolean
  onToggle: () => void
  loading: boolean
  error: string | null
}

/**
 * Always-visible panel for the AI Chat Summary. User clicks to expand/collapse and view the generated summary.
 */
export function ChatSummaryPanel({
  summary,
  isExpanded,
  onToggle,
  loading,
  error,
}: ChatSummaryPanelProps) {
  const hasSummary = !!summary?.trim()
  const showChevron = hasSummary || isExpanded

  return (
    <aside
      className="shrink-0 border-b transition-colors"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background)',
      }}
      aria-label="Chat summary"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:opacity-90"
        style={{ color: 'var(--foreground)' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <span className="truncate text-sm font-medium">Chat Summary</span>
          {loading && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating…
            </span>
          )}
          {!loading && !hasSummary && !error && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Click &quot;Generate Chat Summary&quot; above, then click here to view
            </span>
          )}
          {!loading && hasSummary && !isExpanded && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Click to view
            </span>
          )}
          {error && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {error}
            </span>
          )}
        </div>
        {showChevron && (
          <span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        )}
      </button>

      {isExpanded && (
        <div
          className="border-t px-4 py-3"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
          }}
        >
          {hasSummary ? (
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
        </div>
      )}
    </aside>
  )
}
