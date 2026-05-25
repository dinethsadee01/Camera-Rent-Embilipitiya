-- Run this in Supabase SQL Editor BEFORE importing the seed
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS discount_type    text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_value   numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_amount  numeric NOT NULL DEFAULT 0;
