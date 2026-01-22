-- ============================================
-- FIX: Clear updated_at for all messages
-- ============================================
-- This function bypasses RLS to update all messages
-- Run this in your Supabase SQL Editor

-- Create a security definer function to bypass RLS
CREATE OR REPLACE FUNCTION clear_all_messages_updated_at()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages 
  SET updated_at = NULL;
END;
$$;

-- Execute the function
SELECT clear_all_messages_updated_at();

-- Drop the function after use (optional, but cleaner)
DROP FUNCTION IF EXISTS clear_all_messages_updated_at();

-- Verify the update worked
SELECT 
  COUNT(*) as total_messages,
  COUNT(updated_at) as messages_with_updated_at,
  COUNT(*) - COUNT(updated_at) as messages_with_null_updated_at
FROM public.messages;
