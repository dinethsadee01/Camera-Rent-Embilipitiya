-- Create a sequence for booking codes so generation is atomic and server-side.
-- setval with is_called=false means the NEXT nextval() returns max+1.

CREATE SEQUENCE IF NOT EXISTS booking_code_seq;

SELECT setval(
  'booking_code_seq',
  COALESCE((
    SELECT MAX(CAST(SUBSTRING(booking_code FROM 4) AS integer))
    FROM bookings
    WHERE booking_code ~ '^BK-[0-9]+$'
  ), 0)
  -- is_called defaults to true: next nextval() returns max+1
);

CREATE OR REPLACE FUNCTION next_booking_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'BK-' || nextval('booking_code_seq')::text;
$$;

GRANT EXECUTE ON FUNCTION next_booking_code() TO authenticated;
