import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Creates a Supabase client for client-side usage (Client Components, hooks, etc.)
 * 
 * For better Next.js App Router support with automatic cookie handling,
 * consider installing @supabase/ssr: npm install @supabase/ssr
 */
export function createClientSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
