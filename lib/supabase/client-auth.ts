import { createClientSupabase } from './client'

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

/**
 * Client-side authentication helpers
 */
export const authClient = {
  /**
   * Sign up a new user
   * @param email - User email
   * @param password - User password
   * @param options - Additional signup options (e.g., metadata)
   */
  async signUp(
    email: string,
    password: string,
    options?: {
      metadata?: Record<string, any>
      redirectTo?: string
    }
  ): Promise<AuthResponse> {
    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.metadata,
          emailRedirectTo: options?.redirectTo,
        },
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }
    }
  },

  /**
   * Sign in an existing user
   * @param email - User email
   * @param password - User password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const supabase = createClientSupabase()
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

  /**
   * Get the current user session
   */
  async getSession() {
    try {
      const supabase = createClientSupabase()
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
   * Get the current user
   */
  async getUser() {
    try {
      const supabase = createClientSupabase()
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
}

// Export convenience aliases
export const login = authClient.signIn
export const logout = authClient.signOut
export const signup = authClient.signUp
