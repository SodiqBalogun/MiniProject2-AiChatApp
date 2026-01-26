'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/supabase/client-auth'
import { createClientSupabase } from '@/lib/supabase/client'
import { getTheme, setTheme, applyTheme, ensureThemeApplied, type Theme } from '@/lib/theme'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    // Apply theme immediately from localStorage to prevent flash
    const currentTheme = getTheme()
    applyTheme(currentTheme)

    // Load theme from database and update
    const loadTheme = async () => {
      const { user } = await authClient.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', user.id)
          .single()

        if (data?.theme_preference) {
          try {
            const theme = typeof data.theme_preference === 'string' 
              ? JSON.parse(data.theme_preference) 
              : data.theme_preference
            // Always use setTheme to ensure proper application and sync
            setTheme(theme)
          } catch {
            const storedTheme = getTheme()
            setTheme(storedTheme)
          }
        } else {
          const storedTheme = getTheme()
          setTheme(storedTheme)
        }
      } else {
        // Not authenticated, use localStorage theme
        const storedTheme = getTheme()
        setTheme(storedTheme)
      }
    }

    // Load theme and profile in parallel
    loadTheme()
    loadProfile()

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

  // Ensure theme is applied after component renders and stays applied
  useEffect(() => {
    if (!loading) {
      // Use requestAnimationFrame to ensure DOM is ready, then verify and apply theme
      requestAnimationFrame(() => {
        ensureThemeApplied()
        // Also check again after a microtask to catch any late DOM updates
        Promise.resolve().then(() => {
          ensureThemeApplied()
        })
      })
    }
  }, [loading, profile])

  // Listen for storage changes (theme changed in another tab/window)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        try {
          const newTheme = JSON.parse(e.newValue || '') as Theme
          applyTheme(newTheme)
        } catch {
          const storedTheme = getTheme()
          applyTheme(storedTheme)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const loadProfile = async () => {
    const { user } = await authClient.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error loading profile:', error)
    } else if (data) {
      setProfile(data)
      setUsername(data.username)
      setDisplayName(data.display_name || '')
      setAvatarUrl(data.avatar_url || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        display_name: displayName || username,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } else {
      alert('Profile updated successfully!')
      router.push('/')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ color: 'var(--muted-foreground)' }}>Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ color: 'var(--muted-foreground)' }}>Profile not found</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        input::placeholder {
          color: var(--muted-foreground) !important;
        }
      `}</style>
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
        <div 
          className="w-full max-w-md rounded-lg border p-8 shadow-lg"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
          }}
        >
          <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Edit Profile
          </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: saving ? 'var(--muted)' : '#3b82f6' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg border px-4 py-2 font-medium transition-colors"
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
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
