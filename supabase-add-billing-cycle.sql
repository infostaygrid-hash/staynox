-- Add billing_cycle column to properties table
ALTER TABLE properties
ADD COLUMN billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- (Optional) Update specific properties to 'yearly' if needed
-- UPDATE properties SET billing_cycle = 'yearly' WHERE type = 'flat';
