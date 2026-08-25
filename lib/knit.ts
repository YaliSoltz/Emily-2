import type { Knit, Lang } from './types'

/** Minimum frames worth mounting the 360° viewer for — below this it reads as a jump cut. */
export const MIN_ROTATION_FRAMES = 8

export function knitTitle(knit: Knit, lang: Lang): string {
  const preferred = lang === 'he' ? knit.title_he : knit.title_en
  return preferred?.trim() || knit.title_he?.trim() || knit.title_en?.trim() || knit.slug
}

export function knitDescription(knit: Knit, lang: Lang): string {
  const preferred = lang === 'he' ? knit.description_he : knit.description_en
  return preferred?.trim() || ''
}

/** Alt text, falling back to the title so no image ever ships without one. */
export function knitAlt(knit: Knit, lang: Lang): string {
  const preferred = lang === 'he' ? knit.alt_he : knit.alt_en
  return preferred?.trim() || knitTitle(knit, lang)
}

export function hasRotation(knit: Knit): boolean {
  return knit.rotation_frames.length >= MIN_ROTATION_FRAMES
}

/**
 * Live WebGL viewer, opted in per knit. The GLB is raw TRELLIS output and weighs
 * several megabytes, so this never loads until the visitor asks for it.
 */
export function hasLiveModel(knit: Knit): boolean {
  return knit.use_model_3d === true && !!knit.model_3d
}

/** What the detail page shows for the main visual — decided in one place. */
export type KnitViewerKind = 'model' | 'rotation' | 'static'

export function knitViewerKind(knit: Knit): KnitViewerKind {
  if (hasLiveModel(knit)) return 'model'
  if (hasRotation(knit)) return 'rotation'
  return 'static'
}
