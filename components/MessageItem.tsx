'use client'

import { useState } from 'react'
import type { Message } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Edit2, Trash2, Check, X } from 'lucide-react'

interface MessageItemProps {
  message: Message
  isOwnMessage: boolean
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageItem({ message, isOwnMessage, onEdit, onDelete }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const profile = message.profiles
  const username = profile?.display_name || profile?.username || 'Anonymous'
  const avatarUrl = profile?.avatar_url
  const isAI = message.is_ai_message

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  const handleSave = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete?.(message.id)
    }
  }

  // Don't allow editing/deleting AI messages
  const canEdit = isOwnMessage && !isAI && onEdit
  const canDelete = isOwnMessage && !isAI && onDelete

  return (
    <div
      className={`flex gap-3 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col gap-1 ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              isAI
                ? 'text-purple-600 dark:text-purple-400'
                : ''
            }`}
            style={!isAI ? { color: 'var(--foreground)' } : undefined}
          >
            {isAI ? '🤖 AI Assistant' : username}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {formatTime(message.created_at)}
            {(() => {
              // Only show "(edited)" if updated_at exists AND is significantly different from created_at
              // Always use created_at for the time display, only check updated_at for the edited indicator
              if (!message.updated_at) return null
              const created = new Date(message.created_at).getTime()
              const updated = new Date(message.updated_at).getTime()
              // Show edited only if updated_at is at least 2 seconds after created_at
              // This accounts for any timing differences and ensures only real edits show
              return updated - created > 2000 ? ' (edited)' : null
            })()}
          </span>
        </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 max-w-[70%]">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSave()
                } else if (e.key === 'Escape') {
                  handleCancel()
                }
              }}
              className="rounded-lg border px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                minHeight: '60px',
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors bg-green-500 text-white hover:bg-green-600"
              >
                <Check className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative flex items-start gap-2">
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isOwnMessage
                  ? 'bg-blue-500 text-white'
                  : isAI
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100'
                  : ''
              }`}
              style={!isOwnMessage && !isAI ? { backgroundColor: 'var(--muted)', color: 'var(--foreground)' } : undefined}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {canEdit || canDelete ? (
              <div className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'order-first' : ''}`}>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded p-1.5 shadow-sm border transition-colors"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background)'
                    }}
                    aria-label="Edit message"
                    title="Edit message"
                  >
                    <Edit2 className="h-3.5 w-3.5" style={{ color: 'var(--foreground)' }} />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="rounded p-1.5 shadow-sm border transition-colors"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background)'
                    }}
                    aria-label="Delete message"
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
