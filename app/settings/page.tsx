'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/supabase/client-auth'
import { createClientSupabase } from '@/lib/supabase/client'
import { getTheme, setTheme, type Theme } from '@/lib/theme'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    loadSettings()
    
    // Listen for theme changes to sync with database
    const handleThemeChange = async (e: Event) => {
      const customEvent = e as CustomEvent<Theme>
      const { user } = await authClient.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme_preference: customEvent.detail })
          .eq('id', user.id)
      }
    }

    window.addEventListener('theme-change', handleThemeChange)
    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
    }
  }, [])

  const loadSettings = async () => {
    const { user } = await authClient.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('theme_preference')
      .eq('id', user.id)
      .single()

    if (data?.theme_preference) {
      try {
        // Try to parse as new format
        const theme = typeof data.theme_preference === 'string' 
          ? JSON.parse(data.theme_preference) 
          : data.theme_preference
        setTheme(theme)
      } catch {
        // If parsing fails, use stored theme or default
        const storedTheme = getTheme()
        setTheme(storedTheme)
      }
    } else {
      const storedTheme = getTheme()
      setTheme(storedTheme)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ color: 'var(--muted-foreground)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div 
        className="w-full max-w-md rounded-lg border p-8 shadow-lg"
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
        }}
      >
        <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Settings
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Theme
            </label>
            <ThemeToggle />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-lg border px-4 py-2 font-medium transition-colors"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)'
              }}
            >
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
