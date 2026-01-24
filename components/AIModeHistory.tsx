'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Share2, X, GripVertical, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface AIInteraction {
  id: string
  prompt: string
  output: string
  created_at: string
}

interface AIModeHistoryFloatingProps {
  interactions: AIInteraction[]
  onShareToChat: (interaction: AIInteraction) => void
  onClose: () => void
  sharingId: string | null
}

/** Returns true if app is dark (so we use light for opposite). */
function useAppIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  )
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

/**
 * Draggable floating AI Mode History. Opposite theme. Collapsed list; each item
 * has a button to show prompt+output as message bubbles. User can drag it anywhere.
 */
export function AIModeHistoryFloating({
  interactions,
  onShareToChat,
  onClose,
  sharingId,
}: AIModeHistoryFloatingProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pos, setPos] = useState({ x: 24, y: 120 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null)
  const isAppDark = useAppIsDark()

  const opposite = {
    bg: isAppDark ? '#ffffff' : '#0a0a0a',
    fg: isAppDark ? '#171717' : '#ededed',
    muted: isAppDark ? '#f4f4f5' : '#18181b',
    mutedFg: isAppDark ? '#71717a' : '#a1a1aa',
    border: isAppDark ? '#e4e4e7' : '#27272a',
    userBubbleBg: isAppDark ? '#3b82f6' : '#2563eb',
    userBubbleFg: '#ffffff',
    aiBubbleBg: isAppDark ? '#e9d5ff' : '#5b21b6',
    aiBubbleFg: isAppDark ? '#581c87' : '#e9d5ff',
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPos: { ...pos } }
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPos({
        x: Math.max(0, dragRef.current.startPos.x + dx),
        y: Math.max(0, dragRef.current.startPos.y + dy),
      })
    }
    const onUp = () => {
      setDragging(false)
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  const hasInteractions = interactions.length > 0

  return (
    <div
      className="fixed z-50 flex w-96 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl shadow-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        backgroundColor: opposite.bg,
        color: opposite.fg,
        border: `1px solid ${opposite.border}`,
      }}
      aria-label="AI Mode history"
    >
      {/* Drag handle + header */}
      <div
        onMouseDown={handleDragStart}
        className="flex cursor-grab items-center justify-between gap-2 px-3 py-2 active:cursor-grabbing"
        style={{ backgroundColor: opposite.muted, borderBottom: `1px solid ${opposite.border}` }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0" style={{ color: opposite.mutedFg }} />
          <Sparkles className="h-4 w-4 shrink-0" style={{ color: opposite.mutedFg }} />
          <span className="truncate text-sm font-medium">AI Mode History</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          className="shrink-0 rounded p-1 transition-opacity hover:opacity-80"
          style={{ color: opposite.mutedFg }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex max-h-80 flex-1 flex-col overflow-y-auto p-2" style={{ backgroundColor: opposite.bg }}>
        {!hasInteractions ? (
          <p className="px-2 py-4 text-sm" style={{ color: opposite.mutedFg }}>
            No AI prompts yet. Use AI Mode below to get started.
          </p>
        ) : (
          <ul className="space-y-1">
            {interactions.map((item) => {
              const isExpanded = expandedId === item.id
              return (
                <li key={item.id} className="rounded-lg" style={{ border: `1px solid ${opposite.border}` }}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:opacity-90"
                    style={{ backgroundColor: opposite.muted, color: opposite.fg }}
                  >
                    <span style={{ color: opposite.mutedFg }}>
                      View · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 transition-transform"
                      style={{
                        color: opposite.mutedFg,
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </button>
                  {isExpanded && (
                    <div className="space-y-3 border-t p-3" style={{ borderColor: opposite.border }}>
                      {/* User prompt bubble */}
                      <div className="flex justify-end">
                        <div
                          className="max-w-[85%] rounded-lg px-4 py-2 text-sm"
                          style={{
                            backgroundColor: opposite.userBubbleBg,
                            color: opposite.userBubbleFg,
                          }}
                        >
                          <p className="mb-1 text-xs font-medium opacity-90">You prompted</p>
                          <p className="whitespace-pre-wrap break-words">{item.prompt}</p>
                        </div>
                      </div>
                      {/* AI output bubble */}
                      <div className="flex justify-start">
                        <div
                          className="max-w-[85%] rounded-lg px-4 py-2 text-sm"
                          style={{
                            backgroundColor: opposite.aiBubbleBg,
                            color: opposite.aiBubbleFg,
                          }}
                        >
                          <p className="mb-1 text-xs font-medium opacity-90">AI Assistant</p>
                          <p className="whitespace-pre-wrap break-words">{item.output}</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShareToChat(item)
                          }}
                          disabled={sharingId === item.id}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                          style={{
                            backgroundColor: opposite.muted,
                            color: opposite.fg,
                            border: `1px solid ${opposite.border}`,
                          }}
                        >
                          {sharingId === item.id ? (
                            'Sharing…'
                          ) : (
                            <>
                              <Share2 className="h-3.5 w-3.5" />
                              Share with Chat
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * Build formatted share block:
 * User (UserName) prompted:
 * (User Prompt Here)
 *
 * AI Assistant Output:
 * (AI Output here)
 */
export function formatShareBlock(displayName: string, prompt: string, output: string): string {
  return `User (${displayName}) prompted:\n${prompt}\n\nAI Assistant Output:\n${output}`
}
