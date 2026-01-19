'use client'

interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  if (usernames.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="italic">{usernames[0]} is typing...</span>
        <span className="flex gap-1">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
            .
          </span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            .
          </span>
        </span>
      </div>
    )
  }

  return (
    <div className="text-sm text-zinc-500 dark:text-zinc-400">
      <span className="italic">
        {usernames.slice(0, -1).join(', ')} and {usernames[usernames.length - 1]} are
        typing...
      </span>
    </div>
  )
}
