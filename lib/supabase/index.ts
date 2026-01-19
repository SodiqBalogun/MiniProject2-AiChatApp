// Export all Supabase utilities and auth helpers
// Note: Import client utilities in client components, server utilities in server components
export { createClientSupabase } from './client'
export { createServerSupabase } from './server'
export {
  authClient,
  login,
  logout,
  signup,
  type AuthResponse,
} from './client-auth'
export { authServer } from './server-auth'
