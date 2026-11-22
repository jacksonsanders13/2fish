-- Stores send product photos as well as phone clips, so the clips bucket
-- takes common photo types too. Same 200 MB cap per file.
update storage.buckets
set allowed_mime_types = array[
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/3gpp',
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'
]
where id = 'clips';
