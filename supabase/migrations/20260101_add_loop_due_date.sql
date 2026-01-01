-- Migration: Add due_date to loops table
-- Date: 2026-01-01

ALTER TABLE IF EXISTS loops 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
