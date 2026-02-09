-- Recreate manitoba_region enum without parklands and swan_river
-- 1. Create new enum
CREATE TYPE manitoba_region_new AS ENUM (
  'winnipeg', 'southeast', 'interlake', 'southwest', 'northwest', 'the_pas', 'thompson', 'beyond_borders'
);

-- 2. Alter columns to use new enum
ALTER TABLE jobs ALTER COLUMN region TYPE manitoba_region_new USING region::text::manitoba_region_new;
ALTER TABLE job_seeker_intakes ALTER COLUMN region TYPE manitoba_region_new USING region::text::manitoba_region_new;
ALTER TABLE employer_inquiries ALTER COLUMN region TYPE manitoba_region_new USING region::text::manitoba_region_new;

-- 3. Drop old enum and rename new one
DROP TYPE manitoba_region;
ALTER TYPE manitoba_region_new RENAME TO manitoba_region;