'use client'

import type { Message } from '@/lib/types'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: 'var(--muted-foreground)' }}>
          No messages yet. Start the conversation!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwnMessage={message.user_id === currentUserId}
        />
      ))}
    </div>
  )
}
