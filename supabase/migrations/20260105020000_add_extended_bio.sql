-- Migration: Add extended_bio column to template_creators
-- Date: 2026-01-05
-- Description: Stores AI-generated rich biographies (300+ words) for template authors

ALTER TABLE public.template_creators
ADD COLUMN IF NOT EXISTS extended_bio TEXT;

COMMENT ON COLUMN public.template_creators.extended_bio IS 'AI-generated extended biography with author, book, and loop context';
