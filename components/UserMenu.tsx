'use client'

import { useState, useRef, useEffect } from 'react'
import { authClient } from '@/lib/supabase/client-auth'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings } from 'lucide-react'

interface UserMenuProps {
  user: any
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
        style={{ 
          '--hover-bg': 'var(--muted)',
        } as React.CSSProperties & { '--hover-bg': string }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--muted)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            username.charAt(0).toUpperCase()
          )}
        </div>
        <span className="hidden text-sm font-medium sm:block" style={{ color: 'var(--foreground)' }}>
          {username}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border shadow-lg" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
          <div className="p-2">
            <div className="px-3 py-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {user.email}
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/profile')
              }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/settings')
              }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
