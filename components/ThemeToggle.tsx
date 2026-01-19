'use client'

import { useState, useEffect } from 'react'
import { getTheme, setTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setCurrentTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTheme(getTheme())
  }, [])

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800" />
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => handleThemeChange('light')}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          theme === 'light'
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
            : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
        aria-label="Light theme"
      >
        ☀️
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
            : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
        aria-label="Dark theme"
      >
        🌙
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          theme === 'system'
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
            : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
        aria-label="System theme"
      >
        💻
      </button>
    </div>
  )
}
