-- Emily Tal Portfolio — live 3D viewer opt-in
-- Run this in Supabase Dashboard → SQL Editor, BEFORE deploying the code that reads it.
--
-- `model_3d` (added in 0004) already holds the GLB produced by the TRELLIS run.
-- Until now nothing consumed it: the knit page always showed the pre-rendered
-- 360° frames. This flag turns on the live WebGL viewer for a single knit.
--
-- Off by default on purpose. Even at the reduced extract settings the GLB is a
-- few megabytes — heavier than the WebP frame sequence. It is worth it for a
-- piece whose texture rewards free zoom, and not worth it for the rest.
--
-- Models generated before 2026-08-25 used the Space's own defaults and are
-- roughly ten times larger. Regenerating one costs a full day of free ZeroGPU
-- quota, so it is worth doing only when that knit is turned on.

ALTER TABLE knits
  ADD COLUMN IF NOT EXISTS use_model_3d boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN knits.use_model_3d IS
  'Show the live WebGL GLB viewer instead of the 360 frame sequence. Requires model_3d.';
