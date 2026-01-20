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
  const userRef = useRef<any>(null)
  const messagesChannelRef = useRef<any>(null)
  const typingChannelRef = useRef<any>(null)
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep userRef in sync with user state
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      await loadUser()
      if (!mounted) return
      
      await loadMessages()
      if (!mounted) return

      messagesChannelRef.current = subscribeToMessages()
      typingChannelRef.current = subscribeToTyping()
      cleanupIntervalRef.current = cleanupTyping()
    }
    
    initialize()

    // Cleanup on unmount
    return () => {
      mounted = false
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current)
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current)
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadUser = async () => {
    const { user } = await authClient.getUser()
    setUser(user)
    userRef.current = user
  }

  const loadMessages = async () => {
    const currentUser = userRef.current
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
      const filtered = (data || []).filter((msg) => {
        if (msg.is_ai_message && msg.ai_output_mode === 'private') {
          return msg.user_id === currentUser?.id
        }
        return true
      })
      setMessages(filtered)
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
        async (payload) => {
          console.log('Received message event:', payload.eventType, payload.new)
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new message with profile data
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
              .eq('id', payload.new.id)
              .single()
            
            if (error) {
              console.error('Error fetching new message:', error)
              return
            }
            
            if (data) {
              const currentUser = userRef.current
              // Filter private AI messages
              if (data.is_ai_message && data.ai_output_mode === 'private') {
                if (data.user_id === currentUser?.id) {
                  setMessages((prev) => [...prev, data])
                }
              } else {
                setMessages((prev) => [...prev, data])
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status)
      })

    return channel
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

    return channel
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

    return interval
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string, isAI: boolean = false, outputMode: 'public' | 'private' = 'public') => {
    if (!user) {
      console.error('Cannot send message: user not loaded')
      return
    }

    console.log('Sending message:', { content, isAI, outputMode, userId: user.id })
    
    const { data, error } = await supabase.from('messages').insert({
      user_id: user.id,
      content,
      is_ai_message: isAI,
      ai_output_mode: outputMode,
    }).select().single()

    if (error) {
      console.error('Error sending message:', error)
      alert(`Error sending message: ${error.message}`)
    } else {
      console.log('Message sent successfully:', data)
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
