'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/supabase/client-auth'
import { createClientSupabase } from '@/lib/supabase/client'
import { getTheme, setTheme, type Theme } from '@/lib/theme'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function SettingsPage() {
  const [theme, setCurrentTheme] = useState<Theme>('system')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    loadSettings()
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
      setCurrentTheme(data.theme_preference as Theme)
      setTheme(data.theme_preference as Theme)
    } else {
      const storedTheme = getTheme()
      setCurrentTheme(storedTheme)
    }
    setLoading(false)
  }

  const handleThemeChange = async (newTheme: Theme) => {
    setCurrentTheme(newTheme)
    setTheme(newTheme)

    const { user } = await authClient.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('id', user.id)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Theme
            </label>
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => handleThemeChange('light')}
                className={`rounded px-2 py-1 text-sm transition-colors ${
                  theme === 'light'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`rounded px-2 py-1 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`rounded px-2 py-1 text-sm transition-colors ${
                  theme === 'system'
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                💻 System
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
