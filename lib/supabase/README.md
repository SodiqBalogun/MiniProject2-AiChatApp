# Supabase Auth Helpers

This directory contains Supabase authentication helpers for Next.js App Router.

## Setup

1. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. (Optional) For better Next.js App Router support with automatic cookie handling, install:

```bash
npm install @supabase/ssr
```

## Usage

### Client-Side (Client Components, hooks)

```tsx
'use client'

import { login, logout, signup, authClient } from '@/lib/supabase'

// Sign up
const handleSignUp = async () => {
  const result = await signup('user@example.com', 'password123', {
    metadata: { name: 'John Doe' }
  })
  
  if (result.success) {
    console.log('User signed up successfully')
  } else {
    console.error('Error:', result.error)
  }
}

// Sign in
const handleLogin = async () => {
  const result = await login('user@example.com', 'password123')
  
  if (result.success) {
    console.log('User logged in successfully')
  } else {
    console.error('Error:', result.error)
  }
}

// Sign out
const handleLogout = async () => {
  const result = await logout()
  
  if (result.success) {
    console.log('User logged out successfully')
  }
}

// Get current user
const getUser = async () => {
  const { user, error } = await authClient.getUser()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Current user:', user)
}
```

### Server-Side (Server Components, Server Actions, Route Handlers)

```tsx
import { authServer } from '@/lib/supabase'

// In a Server Component
export default async function ProfilePage() {
  const { user, error } = await authServer.getUser()
  
  if (error || !user) {
    return <div>Not authenticated</div>
  }
  
  return <div>Welcome, {user.email}!</div>
}

// In a Server Action
'use server'

import { authServer } from '@/lib/supabase'

export async function getCurrentUser() {
  const { user, error } = await authServer.getUser()
  return { user, error }
}
```

## API Reference

### Client-Side Helpers (`authClient`)

- `signUp(email, password, options?)` - Sign up a new user
- `signIn(email, password)` - Sign in an existing user
- `signOut()` - Sign out the current user
- `getSession()` - Get the current session
- `getUser()` - Get the current user

### Server-Side Helpers (`authServer`)

- `getSession()` - Get the current session (server-side)
- `getUser()` - Get the current user (server-side)
- `signOut()` - Sign out the current user (server-side)

### Convenience Exports

- `login` - Alias for `authClient.signIn`
- `logout` - Alias for `authClient.signOut`
- `signup` - Alias for `authClient.signUp`

## Response Types

All auth functions return a `AuthResponse` type:

```typescript
interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}
```

Session/user getters return:

```typescript
{ session: Session | null, error: Error | null }
// or
{ user: User | null, error: Error | null }
```
