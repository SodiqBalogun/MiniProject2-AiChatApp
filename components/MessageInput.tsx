'use client'

import { useState, useRef, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase/client'
import { Send, Sparkles } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, isAI: boolean, outputMode: 'public' | 'private') => void
  userId: string
  username: string
}

export function MessageInput({ onSendMessage, userId, username }: MessageInputProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [aiOutputMode, setAiOutputMode] = useState<'public' | 'private'>('public')
  const supabase = createClientSupabase()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const lastTypingUpdateRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const updateTypingIndicator = async () => {
    const now = Date.now()
    // Throttle typing indicator updates (max once per second)
    if (now - lastTypingUpdateRef.current < 1000) return
    lastTypingUpdateRef.current = now

    await supabase.from('typing_indicators').upsert({
      user_id: userId,
      username,
      updated_at: new Date().toISOString(),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    setIsTyping(true)

    // Update typing indicator
    updateTypingIndicator()

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false)
      await supabase.from('typing_indicators').delete().eq('user_id', userId)
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const messageContent = input.trim()
    setInput('')
    setIsTyping(false)

    // Remove typing indicator
    await supabase.from('typing_indicators').delete().eq('user_id', userId)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send message
    if (aiMode) {
      // For AI messages, we'll handle this in the API route
      await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          outputMode: aiOutputMode,
        }),
      })
    } else {
      onSendMessage(messageContent, false, 'public')
    }
  }

  return (
    <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* AI Mode Toggle */}
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setAiMode(!aiMode)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            aiMode
              ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Mode
        </button>
        {aiMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setAiOutputMode('public')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                aiOutputMode === 'public'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setAiOutputMode('private')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                aiOutputMode === 'private'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
              }`}
            >
              Private
            </button>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder={aiMode ? 'Ask the AI assistant...' : 'Type a message...'}
          className="flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
          rows={1}
          style={{
            minHeight: '44px',
            maxHeight: '120px',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
