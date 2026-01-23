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
import { ChatSummaryButton, ChatSummaryDisplay } from './ChatSummary'

export function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const supabase = createClientSupabase()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
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

  // Track previous message count to detect new messages vs deletions
  const prevMessageCountRef = useRef<number>(0)
  
  useEffect(() => {
    const currentCount = messages.length
    const prevCount = prevMessageCountRef.current
    
    // Only scroll to bottom if a new message was added (count increased)
    // Don't scroll on deletions (count decreased) or initial load (prevCount is 0)
    if (prevCount > 0 && currentCount > prevCount) {
      scrollToBottom()
    }
    
    prevMessageCountRef.current = currentCount
  }, [messages])

  const loadUser = async () => {
    const { user } = await authClient.getUser()
    setUser(user)
    userRef.current = user
  }

  const loadMessages = async () => {
    const currentUser = userRef.current
    
    // Load messages first (without profile join since user_id references auth.users, not profiles directly)
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error loading messages:', messagesError)
      console.error('Error details:', JSON.stringify(messagesError, null, 2))
      setMessages([])
      setLoading(false)
      return
    }

    if (!messagesData || messagesData.length === 0) {
      setMessages([])
      setLoading(false)
      return
    }

    // Get unique user IDs
    const userIds = [...new Set(messagesData.map((msg) => msg.user_id))]
    
    // Fetch all profiles in one query
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, display_name')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error loading profiles:', profilesError)
    }

    // Create a map of user_id -> profile
    const profilesMap = new Map()
    if (profilesData) {
      profilesData.forEach((profile) => {
        profilesMap.set(profile.id, {
          username: profile.username,
          avatar_url: profile.avatar_url,
          display_name: profile.display_name,
        })
      })
    }

    // Combine messages with profiles
    const messagesWithProfiles = messagesData.map((msg) => ({
      ...msg,
      profiles: profilesMap.get(msg.user_id) || {
        username: msg.user_id.substring(0, 8), // Fallback username
        avatar_url: null,
        display_name: null,
      },
    }))

    // Filter out private AI messages that aren't for this user
    const filtered = messagesWithProfiles.filter((msg) => {
      if (msg.is_ai_message && msg.ai_output_mode === 'private') {
        return msg.user_id === currentUser?.id
      }
      return true
    })
    
    setMessages(filtered)
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
            // Fetch the new message
            const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .select('*')
              .eq('id', payload.new.id)
              .single()
            
            if (messageError) {
              console.error('Error fetching new message:', messageError)
              return
            }
            
            if (!messageData) return

            // Fetch profile for this user
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url, display_name')
              .eq('id', messageData.user_id)
              .single()

            const data = {
              ...messageData,
              profiles: profileData || {
                username: messageData.user_id.substring(0, 8),
                avatar_url: null,
                display_name: null,
              },
            }

            const currentUser = userRef.current
            // Filter private AI messages
            if (data.is_ai_message && data.ai_output_mode === 'private') {
              if (data.user_id === currentUser?.id) {
                setMessages((prev) => [...prev, data])
              }
            } else {
              setMessages((prev) => [...prev, data])
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated message with profile
            const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .select('*')
              .eq('id', payload.new.id)
              .single()
            
            if (messageError) {
              console.error('Error fetching updated message:', messageError)
              return
            }
            
            if (!messageData) return

            // Fetch profile for this user
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url, display_name')
              .eq('id', messageData.user_id)
              .single()

            const updatedMessage = {
              ...messageData,
              profiles: profileData || {
                username: messageData.user_id.substring(0, 8),
                avatar_url: null,
                display_name: null,
              },
            }

            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
            )
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

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
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

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user) {
      console.error('Cannot edit message: user not loaded')
      return
    }

    const { error } = await supabase
      .from('messages')
      .update({
        content: newContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('user_id', user.id) // Ensure user owns the message

    if (error) {
      console.error('Error editing message:', error)
      alert(`Error editing message: ${error.message}`)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) {
      console.error('Cannot delete message: user not loaded')
      return
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id) // Ensure user owns the message

    if (error) {
      console.error('Error deleting message:', error)
      alert(`Error deleting message: ${error.message}`)
    }
  }

  const handleGenerateSummary = async () => {
    setSummaryLoading(true)
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
        setSummaryOpen(true)
      }
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setSummaryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ color: 'var(--muted-foreground)' }}>Loading chat...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ color: 'var(--muted-foreground)' }}>Please log in to access the chat</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="relative z-40 flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            AI Chat Room
          </h1>
          {messages.length > 0 && (
            <ChatSummaryButton onClick={handleGenerateSummary} loading={summaryLoading} />
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4" 
        style={{ backgroundColor: 'var(--background)' }}
      >
        <ChatSummaryDisplay 
          summary={summary} 
          isOpen={summaryOpen} 
          onClose={() => setSummaryOpen(false)} 
        />
        <MessageList 
          messages={messages} 
          currentUserId={user.id}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
        />
        <TypingIndicatorComponent usernames={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        userId={user.id}
        username={user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
        onScrollToTop={scrollToTop}
        onScrollToBottom={scrollToBottom}
      />
    </div>
  )
}
