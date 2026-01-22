'use client'

import type { Message } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface MessageItemProps {
  message: Message
  isOwnMessage: boolean
}

export function MessageItem({ message, isOwnMessage }: MessageItemProps) {
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
                : 'text-foreground'
            }`}
          >
            {isAI ? '🤖 AI Assistant' : username}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
        </div>
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
      </div>
    </div>
  )
}
