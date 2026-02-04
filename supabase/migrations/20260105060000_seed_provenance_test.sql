-- Update the 5-AM Club loop to have author data for testing the "Library Badge"
UPDATE loops
SET 
  author_name = 'Robin Sharma',
  source_title = 'The 5 AM Club',
  author_bio = 'Leadership expert and humanitarian',
  function_type = 'practice' -- Ensuring it shows as a practice loop too for testing
WHERE name ILIKE '%5-AM Club%' OR name ILIKE '%5 AM Club%';

-- Also update Self Talk to NOT have it, to ensure contrast (it likely is null anyway)
-- Just ensuring at least one other loop exists without it is fine.
