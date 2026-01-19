import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Creates a Supabase client for client-side usage (Client Components, hooks, etc.)
 * Uses @supabase/ssr for automatic cookie handling between client and server
 */
export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
