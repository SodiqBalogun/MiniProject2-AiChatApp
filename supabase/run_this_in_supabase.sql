-- ============================================
-- MIGRATION: Add Message Edit/Delete Support
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- This will add support for editing and deleting messages

-- Step 1: Add updated_at column to messages table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.messages 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Step 2: Add UPDATE policy for messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'messages' 
    AND policyname = 'Users can update their own messages'
  ) THEN
    CREATE POLICY "Users can update their own messages"
      ON public.messages FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Step 3: Create trigger function to update updated_at on message update
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at_trigger ON public.messages;
CREATE TRIGGER update_messages_updated_at_trigger
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Step 5: Clean up existing messages - set updated_at to NULL for ALL existing messages
-- Since the edit feature is new, any messages created before this migration haven't been edited
-- Only messages edited AFTER this migration will have updated_at set
UPDATE public.messages 
SET updated_at = NULL;

-- ============================================
-- Migration Complete!
-- ============================================
-- You can verify the changes by running:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'messages' AND column_name = 'updated_at';
