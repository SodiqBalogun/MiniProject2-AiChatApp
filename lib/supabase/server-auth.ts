import { createServerSupabase } from './server'

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

/**
 * Server-side authentication helpers
 */
export const authServer = {
  /**
   * Get the current user session (server-side)
   */
  async getSession() {
    try {
      const supabase = await createServerSupabase()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        return { session: null, error }
      }

      return { session: data.session, error: null }
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error : new Error('Failed to get session'),
      }
    }
  },

  /**
   * Get the current user (server-side)
   */
  async getUser() {
    try {
      const supabase = await createServerSupabase()
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Failed to get user'),
      }
    }
  },

  /**
   * Sign out the current user (server-side)
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const supabase = await createServerSupabase()
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }
    }
  },
}
