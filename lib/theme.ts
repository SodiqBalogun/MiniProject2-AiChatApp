'use client'

export type ColorTheme = 'pink' | 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'default'
export type ModeTheme = 'light' | 'dark' | 'system'
export type Theme = {
  mode: ModeTheme
  color: ColorTheme
}

const DEFAULT_THEME: Theme = { mode: 'system', color: 'default' }

export function getTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  const stored = localStorage.getItem('theme')
  if (stored) {
    try {
      return JSON.parse(stored) as Theme
    } catch {
      // Legacy support: if it's a string, convert to new format
      const legacyTheme = stored as ModeTheme
      if (['light', 'dark', 'system'].includes(legacyTheme)) {
        return { mode: legacyTheme as ModeTheme, color: 'default' }
      }
    }
  }
  return DEFAULT_THEME
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  localStorage.setItem('theme', JSON.stringify(theme))
  applyTheme(theme)
  // Dispatch custom event so all ThemeToggle components can update
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  
  const root = window.document.documentElement
  
  // Remove all theme classes
  root.classList.remove(
    'light', 'dark',
    'theme-pink', 'theme-blue', 'theme-green', 
    'theme-purple', 'theme-orange', 'theme-teal'
  )
  
  // Apply color theme
  if (theme.color !== 'default') {
    root.classList.add(`theme-${theme.color}`)
  }
  
  // Apply mode theme
  if (theme.mode === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme.mode)
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return
  const theme = getTheme()
  applyTheme(theme)
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    const currentTheme = getTheme()
    if (currentTheme.mode === 'system') {
      applyTheme(currentTheme)
    }
  }
  
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  // Return cleanup function (though it's not used in useEffect, it's good practice)
  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
}
