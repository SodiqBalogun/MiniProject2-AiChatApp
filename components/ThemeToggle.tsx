'use client'

import { useState, useEffect } from 'react'
import { getTheme, setTheme, type Theme, type ModeTheme, type ColorTheme } from '@/lib/theme'

const COLOR_THEMES: { value: ColorTheme; label: string; emoji: string }[] = [
  { value: 'default', label: 'Default', emoji: '⚪' },
  { value: 'pink', label: 'Pink', emoji: '🌸' },
  { value: 'blue', label: 'Blue', emoji: '💙' },
  { value: 'green', label: 'Green', emoji: '💚' },
  { value: 'purple', label: 'Purple', emoji: '💜' },
  { value: 'orange', label: 'Orange', emoji: '🧡' },
  { value: 'teal', label: 'Teal', emoji: '💠' },
]

const MODE_THEMES: { value: ModeTheme; label: string; emoji: string }[] = [
  { value: 'light', label: 'Light', emoji: '☀️' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'system', label: 'System', emoji: '💻' },
]

export function ThemeToggle() {
  const [theme, setCurrentTheme] = useState<Theme>({ mode: 'system', color: 'default' })
  const [mounted, setMounted] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTheme(getTheme())

    // Listen for custom theme-change events (when theme changes in same window)
    const handleThemeChangeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>
      setCurrentTheme(customEvent.detail)
    }

    // Listen for storage changes (e.g., theme changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        try {
          const newTheme = JSON.parse(e.newValue || '') as Theme
          setCurrentTheme(newTheme)
        } catch {
          // Fallback to default if parsing fails
          setCurrentTheme({ mode: 'system', color: 'default' })
        }
      }
    }

    // Listen for system theme changes when theme is set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      const currentTheme = getTheme()
      if (currentTheme.mode === 'system') {
        // Force a re-render to show the correct active state
        setCurrentTheme(currentTheme)
      }
    }

    window.addEventListener('theme-change', handleThemeChangeEvent)
    window.addEventListener('storage', handleStorageChange)
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      window.removeEventListener('theme-change', handleThemeChangeEvent)
      window.removeEventListener('storage', handleStorageChange)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  const handleModeChange = (mode: ModeTheme) => {
    const newTheme: Theme = { ...theme, mode }
    setCurrentTheme(newTheme)
    setTheme(newTheme)
  }

  const handleColorChange = (color: ColorTheme) => {
    const newTheme: Theme = { ...theme, color }
    setCurrentTheme(newTheme)
    setTheme(newTheme)
    setShowColorPicker(false)
  }

  if (!mounted) {
    return (
      <div 
        className="h-9 w-9 rounded-lg border"
        style={{ borderColor: 'var(--border)' }}
      />
    )
  }

  return (
    <div className="relative flex items-center gap-1">
      {/* Mode Toggle */}
      <div 
        className="flex items-center gap-1 rounded-lg border p-1"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--background)',
        }}
      >
        {MODE_THEMES.map((modeTheme) => (
          <button
            key={modeTheme.value}
            onClick={() => handleModeChange(modeTheme.value)}
            className="rounded px-2 py-1 text-sm transition-colors"
            style={{
              backgroundColor: theme.mode === modeTheme.value ? 'var(--accent)' : 'transparent',
              color: theme.mode === modeTheme.value ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
            }}
            onMouseEnter={(e) => {
              if (theme.mode !== modeTheme.value) {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
              }
            }}
            onMouseLeave={(e) => {
              if (theme.mode !== modeTheme.value) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
            aria-label={`${modeTheme.label} theme`}
            title={modeTheme.label}
          >
            {modeTheme.emoji}
          </button>
        ))}
      </div>

      {/* Color Theme Button */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="rounded-lg border px-2 py-1 text-sm transition-colors"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background)'
          }}
          aria-label="Color theme"
          title="Color theme"
        >
          🎨
        </button>

        {/* Color Picker Dropdown */}
        {showColorPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowColorPicker(false)}
            />
            <div 
              className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border p-3 shadow-lg"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
              }}
            >
              <div className="flex flex-col gap-2">
                {COLOR_THEMES.map((colorTheme) => (
                  <button
                    key={colorTheme.value}
                    onClick={() => handleColorChange(colorTheme.value)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors"
                    style={{
                      backgroundColor: theme.color === colorTheme.value ? 'var(--accent)' : 'transparent',
                      color: theme.color === colorTheme.value ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                    }}
                    onMouseEnter={(e) => {
                      if (theme.color !== colorTheme.value) {
                        e.currentTarget.style.backgroundColor = 'var(--muted)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme.color !== colorTheme.value) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                    aria-label={`${colorTheme.label} color theme`}
                  >
                    <span className="text-base">{colorTheme.emoji}</span>
                    <span className="font-medium">{colorTheme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
