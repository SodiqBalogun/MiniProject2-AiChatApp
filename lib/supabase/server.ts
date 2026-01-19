import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Creates a Supabase client for server-side usage (Server Components, Server Actions, Route Handlers)
 * 
 * Note: For automatic cookie handling and better Next.js App Router support,
 * install @supabase/ssr: npm install @supabase/ssr
 * Then update this function to use createServerClient from @supabase/ssr
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()
  
  // Get auth token from cookies if available
  const authToken = cookieStore.get('sb-access-token')?.value
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
  })
}
