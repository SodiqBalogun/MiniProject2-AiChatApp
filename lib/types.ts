export interface Message {
  id: string
  user_id: string
  content: string
  is_ai_message: boolean
  ai_response_to?: string | null
  ai_output_mode?: 'public' | 'private'
  created_at: string
  profiles?: {
    username: string
    avatar_url?: string | null
    display_name?: string | null
  }
}

export interface Profile {
  id: string
  username: string
  avatar_url?: string | null
  display_name?: string | null
  theme_preference?: string
  created_at: string
  updated_at: string
}

export interface TypingIndicator {
  id: string
  user_id: string
  username: string
  updated_at: string
}
