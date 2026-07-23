-- Booking codes must never collide, even if two devices compute the same
-- MAX(existing)+1 at nearly the same instant. Without this, next_booking_code()
-- alone can only make a collision unlikely, not impossible.
ALTER TABLE bookings
  ADD CONSTRAINT bookings_booking_code_key UNIQUE (booking_code);

-- Creates a booking and its line items inside a single transaction, so a
-- mid-way failure (e.g. the items insert erroring) can never leave an
-- orphaned booking with no items. Retries the code generation if two
-- concurrent creates land on the same MAX(...)+1 value — the UNIQUE
-- constraint above turns that race into a clean, retryable error instead
-- of a silently duplicated booking_code.
CREATE OR REPLACE FUNCTION create_booking_with_items(
  booking_data jsonb,
  items_data jsonb
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_booking bookings;
  attempt int := 0;
BEGIN
  LOOP
    attempt := attempt + 1;
    BEGIN
      INSERT INTO bookings (
        booking_code, customer_id, start_date, end_date, total_price, status,
        payment_status, payment_method, advance_amount, discount_type,
        discount_value, discount_amount, pickup_time, return_time, notes
      )
      VALUES (
        next_booking_code(),
        (booking_data->>'customer_id')::uuid,
        (booking_data->>'start_date')::date,
        (booking_data->>'end_date')::date,
        (booking_data->>'total_price')::numeric,
        booking_data->>'status',
        booking_data->>'payment_status',
        NULLIF(booking_data->>'payment_method', ''),
        (booking_data->>'advance_amount')::numeric,
        NULLIF(booking_data->>'discount_type', ''),
        NULLIF(booking_data->>'discount_value', '')::numeric,
        COALESCE((booking_data->>'discount_amount')::numeric, 0),
        NULLIF(booking_data->>'pickup_time', ''),
        NULLIF(booking_data->>'return_time', ''),
        NULLIF(booking_data->>'notes', '')
      )
      RETURNING * INTO new_booking;

      EXIT; -- insert succeeded, leave the retry loop
    EXCEPTION WHEN unique_violation THEN
      IF attempt >= 5 THEN
        RAISE;
      END IF;
      -- another device claimed the same code between MAX() and INSERT; retry
    END;
  END LOOP;

  INSERT INTO booking_items (booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  SELECT
    new_booking.id,
    NULLIF(item->>'item_id', '')::uuid,
    NULLIF(item->>'custom_name', ''),
    (item->>'quantity')::int,
    (item->>'daily_rate')::numeric,
    COALESCE((item->>'is_free')::boolean, false)
  FROM jsonb_array_elements(items_data) AS item;

  RETURN new_booking;
END;
$$;

GRANT EXECUTE ON FUNCTION create_booking_with_items(jsonb, jsonb) TO authenticated;

-- Same atomicity guarantee for edits: update the booking fields and replace
-- its line items inside one transaction. Previously this was three separate
-- round trips (update, delete, insert) from the client — any one failing
-- midway left the booking and its items inconsistent.
CREATE OR REPLACE FUNCTION update_booking_with_items(
  p_booking_id uuid,
  booking_data jsonb,
  items_data jsonb
)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_booking bookings;
BEGIN
  UPDATE bookings SET
    start_date      = (booking_data->>'start_date')::date,
    end_date        = (booking_data->>'end_date')::date,
    total_price     = (booking_data->>'total_price')::numeric,
    payment_status  = booking_data->>'payment_status',
    payment_method  = NULLIF(booking_data->>'payment_method', ''),
    advance_amount  = (booking_data->>'advance_amount')::numeric,
    discount_type   = NULLIF(booking_data->>'discount_type', ''),
    discount_value  = NULLIF(booking_data->>'discount_value', '')::numeric,
    discount_amount = COALESCE((booking_data->>'discount_amount')::numeric, 0),
    pickup_time     = NULLIF(booking_data->>'pickup_time', ''),
    return_time     = NULLIF(booking_data->>'return_time', ''),
    notes           = NULLIF(booking_data->>'notes', '')
  WHERE id = p_booking_id
  RETURNING * INTO updated_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  DELETE FROM booking_items WHERE booking_id = p_booking_id;

  INSERT INTO booking_items (booking_id, item_id, custom_name, quantity, daily_rate, is_free)
  SELECT
    p_booking_id,
    NULLIF(item->>'item_id', '')::uuid,
    NULLIF(item->>'custom_name', ''),
    (item->>'quantity')::int,
    (item->>'daily_rate')::numeric,
    COALESCE((item->>'is_free')::boolean, false)
  FROM jsonb_array_elements(items_data) AS item;

  RETURN updated_booking;
END;
$$;

GRANT EXECUTE ON FUNCTION update_booking_with_items(uuid, jsonb, jsonb) TO authenticated;
