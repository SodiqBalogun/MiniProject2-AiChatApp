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
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
        <span className="hidden text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:block">
          {username}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/profile')
              }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/settings')
              }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
