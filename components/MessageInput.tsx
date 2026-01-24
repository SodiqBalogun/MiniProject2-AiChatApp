'use client'

import { useState, useRef, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase/client'
import { Send, Sparkles, ChevronUp, ChevronDown, History } from 'lucide-react'
import { getTheme } from '@/lib/theme'

interface MessageInputProps {
  onSendMessage: (content: string, isAI: boolean, outputMode: 'public' | 'private') => void
  userId: string
  username: string
  onScrollToTop?: () => void
  onScrollToBottom?: () => void
  onAIComplete?: () => void
  onToggleAIHistory?: () => void
  aiHistoryOpen?: boolean
}

export function MessageInput({ onSendMessage, userId, username, onScrollToTop, onScrollToBottom, onAIComplete, onToggleAIHistory, aiHistoryOpen }: MessageInputProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [counterpartColors, setCounterpartColors] = useState({ bg: '#f4f4f5', fg: '#18181b' }) // Default light counterpart
  const supabase = createClientSupabase()
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingUpdateRef = useRef<number>(0)

  // Get counterpart theme colors
  useEffect(() => {
    const updateCounterpartColors = () => {
      const theme = getTheme()
      
      // Determine if we're actually in dark mode
      let isDark = false
      if (theme.mode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        isDark = theme.mode === 'dark'
      }
      
      // Also check the actual DOM class as a fallback (this is the source of truth after theme is applied)
      if (document.documentElement.classList.contains('dark')) {
        isDark = true
      } else if (document.documentElement.classList.contains('light')) {
        isDark = false
      }
      
      // Detect color theme from DOM classes (more reliable than theme.color)
      let colorTheme = theme.color
      const root = document.documentElement
      if (root.classList.contains('theme-pink')) colorTheme = 'pink'
      else if (root.classList.contains('theme-blue')) colorTheme = 'blue'
      else if (root.classList.contains('theme-green')) colorTheme = 'green'
      else if (root.classList.contains('theme-purple')) colorTheme = 'purple'
      else if (root.classList.contains('theme-orange')) colorTheme = 'orange'
      else if (root.classList.contains('theme-teal')) colorTheme = 'teal'
      else colorTheme = 'default'

      // Color mappings for counterpart themes (using accent colors)
      // Format: { light: { bg: accent, fg: accent-foreground }, dark: { bg: accent, fg: accent-foreground } }
      // If current mode is dark, use light counterpart. If current mode is light, use dark counterpart.
      const counterpartMap: Record<string, { light: { bg: string; fg: string }; dark: { bg: string; fg: string } }> = {
        default: { light: { bg: '#27272a', fg: '#fafafa' }, dark: { bg: '#f4f4f5', fg: '#18181b' } },
        pink: { light: { bg: '#9f1239', fg: '#fce7f3' }, dark: { bg: '#f9a8d4', fg: '#831843' } },
        blue: { light: { bg: '#3b82f6', fg: '#dbeafe' }, dark: { bg: '#93c5fd', fg: '#1e3a8a' } },
        green: { light: { bg: '#22c55e', fg: '#dcfce7' }, dark: { bg: '#86efac', fg: '#14532d' } },
        purple: { light: { bg: '#a855f7', fg: '#f3e8ff' }, dark: { bg: '#c084fc', fg: '#581c87' } },
        orange: { light: { bg: '#fb923c', fg: '#ffedd5' }, dark: { bg: '#fdba74', fg: '#9a3412' } },
        teal: { light: { bg: '#14b8a6', fg: '#ccfbf1' }, dark: { bg: '#5eead4', fg: '#134e4a' } },
      }

      const colors = counterpartMap[colorTheme] || counterpartMap.default
      // If we're in dark mode, use light counterpart. If we're in light mode, use dark counterpart.
      setCounterpartColors(isDark ? colors.light : colors.dark)
    }

    // Initial update with a small delay to ensure DOM is ready
    setTimeout(updateCounterpartColors, 50)
    // Also run immediately in case DOM is already ready
    updateCounterpartColors()

    // Listen for theme changes
    const handleThemeChange = () => {
      // Small delay to ensure DOM classes are updated
      setTimeout(updateCounterpartColors, 50)
    }
    window.addEventListener('theme-change', handleThemeChange)
    window.addEventListener('storage', handleThemeChange)

    // Watch for dark mode class changes
    const observer = new MutationObserver(() => {
      setTimeout(updateCounterpartColors, 50)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      const theme = getTheme()
      if (theme.mode === 'system') {
        setTimeout(updateCounterpartColors, 50)
      }
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
      window.removeEventListener('storage', handleThemeChange)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      observer.disconnect()
    }
  }, [])

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
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          outputMode: 'private',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.success && onAIComplete) onAIComplete()
    } else {
      onSendMessage(messageContent, false, 'public')
    }
  }

  return (
    <div className="border-t p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
      {/* AI Mode Toggle and Scroll Buttons */}
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
        {onToggleAIHistory && (
          <button
            onClick={onToggleAIHistory}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
              aiHistoryOpen
                ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            <History className="h-4 w-4" />
            AI Mode History
          </button>
        )}
        {aiMode && (
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Output is private. Use &quot;Share with Chat&quot; in AI Mode History to post.
          </span>
        )}
        {onScrollToTop && onScrollToBottom && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onScrollToTop}
              className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:opacity-80"
              style={{
                backgroundColor: counterpartColors.bg,
                color: counterpartColors.fg,
              }}
              aria-label="Scroll to top"
              title="Scroll to top"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={onScrollToBottom}
              className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:opacity-80"
              style={{
                backgroundColor: counterpartColors.bg,
                color: counterpartColors.fg,
              }}
              aria-label="Scroll to bottom"
              title="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4" />
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
          className="flex-1 resize-none rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          style={{ 
            borderColor: 'var(--border)', 
            backgroundColor: 'var(--background)', 
            color: 'var(--foreground)',
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
