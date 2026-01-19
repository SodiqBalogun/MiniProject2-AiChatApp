'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

interface ChatSummaryProps {
  messages: Array<{ content: string; created_at: string; is_ai_message: boolean }>
}

export function ChatSummary({ messages }: ChatSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const generateSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-50), // Last 50 messages
        }),
      })

      const data = await response.json()
      if (data.summary) {
        setSummary(data.summary)
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (messages.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={generateSummary}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
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

      {isOpen && summary && (
        <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Chat Summary
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">{summary}</p>
        </div>
      )}
    </div>
  )
}
