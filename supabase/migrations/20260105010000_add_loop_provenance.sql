-- Migration: Add Recipe Provenance Columns to Loops
-- Date: 2026-01-05
-- Description: Adds author/source attribution fields to the loops table

-- Add provenance columns
ALTER TABLE public.loops
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS author_image_url TEXT,
ADD COLUMN IF NOT EXISTS source_title TEXT,
ADD COLUMN IF NOT EXISTS source_link TEXT,
ADD COLUMN IF NOT EXISTS end_goal_description TEXT;

-- Comment the columns
COMMENT ON COLUMN public.loops.author_name IS 'Name of the author/expert behind this loop';
COMMENT ON COLUMN public.loops.author_bio IS 'Brief bio of the author';
COMMENT ON COLUMN public.loops.author_image_url IS 'URL to author profile image';
COMMENT ON COLUMN public.loops.source_title IS 'Book, seminar, or framework that inspired this loop';
COMMENT ON COLUMN public.loops.source_link IS 'Link to purchase the book or access the training';
COMMENT ON COLUMN public.loops.end_goal_description IS 'The end goal or "Why" behind the loop';
