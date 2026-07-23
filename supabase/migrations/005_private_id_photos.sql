-- NIC/ID photos are sensitive personal data. They were previously stored
-- in a public bucket with the permanent public URL saved on the customer
-- row — anyone who obtained that URL could view the photo forever. Switch
-- to a private bucket where the app mints short-lived signed URLs on demand.

-- Rename the column to reflect what it now holds: an object *path* inside
-- the bucket, not a directly-usable URL. This is intentional — it forces
-- every call site to be updated (a stale "url" name would silently break
-- once the bucket goes private, since old public URLs stop resolving).
ALTER TABLE customers RENAME COLUMN id_photo_url TO id_photo_path;

-- Existing rows stored the full public URL (".../object/public/id-photos/<path>").
-- Normalize them down to just the object path so createSignedUrl() can use
-- them directly, same as newly uploaded photos.
UPDATE customers
SET id_photo_path = regexp_replace(id_photo_path, '^.*/id-photos/', '')
WHERE id_photo_path IS NOT NULL
  AND id_photo_path LIKE 'http%';

-- Flip the bucket private. The existing storage.objects policies for
-- authenticated users (INSERT/SELECT/UPDATE on bucket_id = 'id-photos',
-- added earlier) already cover what createSignedUrl() and upload() need —
-- no policy changes required here.
UPDATE storage.buckets SET public = false WHERE id = 'id-photos';
