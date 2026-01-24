-- Add ai_prompt column to store the user's prompt for AI messages
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'ai_prompt'
  ) THEN
    ALTER TABLE public.messages 
    ADD COLUMN ai_prompt TEXT;
  END IF;
END $$;
