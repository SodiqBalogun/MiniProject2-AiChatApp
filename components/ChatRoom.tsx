'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientSupabase } from '@/lib/supabase/client'
import { authClient } from '@/lib/supabase/client-auth'
import type { Message, TypingIndicator } from '@/lib/types'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { TypingIndicator as TypingIndicatorComponent } from './TypingIndicator'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { ChatSummary } from './ChatSummary'

export function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialize = async () => {
      await loadUser()
      await loadMessages()
      subscribeToMessages()
      subscribeToTyping()
      cleanupTyping()
    }
    initialize()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadUser = async () => {
    const { user } = await authClient.getUser()
    setUser(user)
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          display_name
        )
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
    } else {
      // Filter out private AI messages that aren't for this user
      // Note: user might not be loaded yet, so we'll filter in the subscription handler
      setMessages(data || [])
    }
    setLoading(false)
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new message with profile data
            supabase
              .from('messages')
              .select(`
                *,
                profiles:user_id (
                  username,
                  avatar_url,
                  display_name
                )
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  // Filter private AI messages
                  if (data.is_ai_message && data.ai_output_mode === 'private') {
                    if (data.user_id === user?.id) {
                      setMessages((prev) => [...prev, data])
                    }
                  } else {
                    setMessages((prev) => [...prev, data])
                  }
                }
              })
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const subscribeToTyping = () => {
    const channel = supabase
      .channel('typing')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
        },
        () => {
          loadTypingIndicators()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const loadTypingIndicators = async () => {
    const { data } = await supabase
      .from('typing_indicators')
      .select('username')
      .gt('updated_at', new Date(Date.now() - 3000).toISOString()) // Last 3 seconds

    if (data) {
      setTypingUsers(data.map((t) => t.username))
    }
  }

  const cleanupTyping = () => {
    // Clean up old typing indicators every 5 seconds
    const interval = setInterval(async () => {
      await supabase
        .from('typing_indicators')
        .delete()
        .lt('updated_at', new Date(Date.now() - 3000).toISOString())
    }, 5000)

    return () => clearInterval(interval)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string, isAI: boolean = false, outputMode: 'public' | 'private' = 'public') => {
    if (!user) return

    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      content,
      is_ai_message: isAI,
      ai_output_mode: outputMode,
    })

    if (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading chat...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Please log in to access the chat</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          AI Chat Room
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ChatSummary messages={messages} />
        <MessageList messages={messages} currentUserId={user.id} />
        <TypingIndicatorComponent usernames={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        userId={user.id}
        username={user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
      />
    </div>
  )
}
