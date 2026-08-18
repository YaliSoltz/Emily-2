-- Emily Tal Portfolio — Knits catalog
-- Run this in Supabase Dashboard → SQL Editor
--
-- Adds the `knits` table backing /knits, /knits/[slug] and the home-page carousel.
--
-- Unlike `gallery_items` (one row per language), a knit is one row with bilingual
-- columns: its slug, cover image and 360° frames are language-agnostic, and one
-- physical knit must map to exactly one URL.

-- ─────────────────────────────────────────
-- KNITS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,      -- URL segment, e.g. 'sea-wrap'
  title_he        text NOT NULL DEFAULT '',
  title_en        text NOT NULL DEFAULT '',
  description_he  text,
  description_en  text,
  alt_he          text,                      -- image alt text (falls back to title)
  alt_en          text,
  cover_image     text,                      -- Supabase Storage public URL
  images          jsonb NOT NULL DEFAULT '[]'::jsonb,  -- string[] — detail shots
  rotation_frames jsonb NOT NULL DEFAULT '[]'::jsonb,  -- string[] — ordered 360° frames
  model_3d        text,                      -- reserved for a future GLB/GLTF
  order_index     integer NOT NULL DEFAULT 0,
  is_published    boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knits_order_idx ON knits (order_index);

ALTER TABLE knits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read knits" ON knits
  FOR SELECT USING (true);

CREATE POLICY "Authenticated write knits" ON knits
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TRIGGER knits_updated_at
  BEFORE UPDATE ON knits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- HOME HERO MEDIA
-- ─────────────────────────────────────────
-- No schema change needed — the hero visual is stored as keys on the existing
-- `home` page row's jsonb columns, and is read from the 'he' row for both
-- languages (same convention as the About headshot).
--
--   content_json.hero_media_type   'none' | 'image' | 'video'
--   content_json.hero_focal        CSS object-position, e.g. 'center', 'center 30%'
--   content_json.hero_alt          alt text for the hero image
--   images_json.hero_image_url     still image
--   images_json.hero_video_url     mp4/webm, muted autoplay loop
--   images_json.hero_poster_url    poster frame — also the reduced-motion /
--                                  data-saver / video-error fallback
--
-- Until these are set the home page falls back to the typographic hero.
