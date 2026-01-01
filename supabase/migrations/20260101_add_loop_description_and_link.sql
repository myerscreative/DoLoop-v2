-- Migration: Add description and affiliate_link to loops table
-- Date: 2026-01-01

ALTER TABLE IF EXISTS loops 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- Update types/loop.ts was already done in a previous step, but good to keep in mind.
