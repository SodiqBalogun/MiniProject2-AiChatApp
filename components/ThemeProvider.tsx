'use client'

import { useEffect } from 'react'
import { initTheme, getTheme, setTheme, type Theme } from '@/lib/theme'
import { authClient } from '@/lib/supabase/client-auth'
import { createClientSupabase } from '@/lib/supabase/client'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // First, initialize theme from localStorage (for immediate application)
    initTheme()
    
    // Then, try to load theme from database if user is authenticated
    const loadThemeFromDatabase = async () => {
      try {
        const { user } = await authClient.getUser()
        if (user) {
          const supabase = createClientSupabase()
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
            // No theme in database, use localStorage theme
            const storedTheme = getTheme()
            setTheme(storedTheme)
          }
        } else {
          // Not authenticated, use localStorage theme
          const storedTheme = getTheme()
          setTheme(storedTheme)
        }
      } catch (error) {
        // On error, fall back to localStorage theme
        console.error('Error loading theme from database:', error)
        const storedTheme = getTheme()
        setTheme(storedTheme)
      }
    }

    loadThemeFromDatabase()

    // Listen for theme changes to sync with database
    const handleThemeChange = async (e: Event) => {
      const customEvent = e as CustomEvent<Theme>
      try {
        const { user } = await authClient.getUser()
        if (user) {
          const supabase = createClientSupabase()
          await supabase
            .from('profiles')
            .update({ theme_preference: customEvent.detail })
            .eq('id', user.id)
        }
      } catch (error) {
        console.error('Error syncing theme to database:', error)
      }
    }

    window.addEventListener('theme-change', handleThemeChange)
    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
    }
  }, [])

  return <>{children}</>
}
