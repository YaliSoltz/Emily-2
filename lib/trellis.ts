'use client'

/**
 * Browser-side client for the microsoft/TRELLIS.2 Hugging Face Space.
 *
 * Runs in the admin panel, in Emily's browser — deliberately NOT on the server.
 * The Space runs on ZeroGPU, whose quota is metered per IP (or per HF account
 * when a token is supplied). Calling it from one Vercel server IP would pool
 * everyone's usage onto a single bucket and drop the X-IP-Token header that
 * HF uses for anonymous metering. From the browser each admin gets their own.
 *
 * Endpoint shapes below were taken from the Space's own
 * /gradio_api/info schema, not guessed:
 *
 *   /start_session      ()                              -> ()
 *   /preprocess_image   (input: image)                  -> image      (removes background)
 *   /image_to_3d        (image, seed, resolution, ...)  -> html       (mesh kept in session state)
 *   /extract_glb        (decimation_target, texture_size) -> [glb, glb]
 *
 * `/image_to_3d` stores its result in a gr.State that the API cannot read, so
 * `/extract_glb` must run on the SAME client instance — Gradio ties the state
 * to the connection's session hash.
 */

const SPACE_ID = 'microsoft/TRELLIS.2'

/** Both GPU steps are declared @spaces.GPU(duration=120) on the Space. */
export const GPU_SECONDS_PER_RUN = 240

/**
 * How many times /extract_glb may be tried before the run is written off.
 *
 * Each attempt is its own 120s GPU reservation, so this stays low. Two is the
 * useful number: it survives a transient failure without quietly doubling the
 * cost of a run that was never going to work.
 */
const EXTRACT_ATTEMPTS = 2

export type TrellisResolution = '512' | '1024' | '1536'

export interface TrellisOptions {
  /** Optional HF token. Without one, quota is metered anonymously by IP. */
  token?: string
  resolution?: TrellisResolution
  seed?: number
  /** Target triangle count of the extracted mesh. */
  decimationTarget?: number
  textureSize?: number
  onProgress?: (stage: TrellisStage, detail?: string) => void
  signal?: AbortSignal
}

export type TrellisStage =
  | 'connecting'
  | 'preprocessing'
  | 'generating'
  | 'extracting'
  | 'downloading'

export interface TrellisResult {
  /** The generated mesh. */
  glb: Blob
  /** Background-removed, cropped square image the mesh was built from. */
  preprocessed: Blob | null
}

/** Defaults mirror the Space's own UI so results match what you'd get by hand. */
const DEFAULTS = {
  resolution: '1024' as TrellisResolution,
  ss_guidance_strength: 7.5,
  ss_guidance_rescale: 0.7,
  ss_sampling_steps: 12,
  ss_rescale_t: 5.0,
  shape_slat_guidance_strength: 7.5,
  shape_slat_guidance_rescale: 0.5,
  shape_slat_sampling_steps: 12,
  shape_slat_rescale_t: 3.0,
  tex_slat_guidance_strength: 1.0,
  tex_slat_guidance_rescale: 0.0,
  tex_slat_sampling_steps: 12,
  tex_slat_rescale_t: 3.0,
  // Measured on a real run: of a 16MB GLB, geometry was 14.7MB and the two
  // WebP textures together were 0.93MB. So the size problem is entirely
  // triangles, and decimation_target drops to the floor the Space allows —
  // 100k is still finer than one triangle per pixel at the size a knit is
  // shown, while cutting the file by roughly two thirds.
  //
  // texture_size deliberately stays at the Space's default. It is what carries
  // the weave, which is the point of a textile portfolio, and the viewer allows
  // 2x zoom. Halving it would save ~0.6MB and blur the fabric.
  decimation_target: 100000,
  texture_size: 2048,
}

/**
 * The Space's slider bounds, copied from its app.py:
 *
 *   decimation_target = gr.Slider(100000, 500000, value=300000, step=10000)
 *   texture_size      = gr.Slider(1024,   4096,  value=2048,   step=1024)
 *
 * Gradio validates these server-side, but only when /extract_glb is called —
 * which is after /image_to_3d has already spent its GPU time. An out-of-range
 * number therefore costs a whole generation to discover, so it is checked here
 * before anything is sent.
 */
const BOUNDS = {
  decimationTarget: { min: 100000, max: 500000 },
  textureSize: { min: 1024, max: 4096 },
} as const

export class TrellisError extends Error {
  constructor(
    message: string,
    readonly kind: 'quota' | 'timeout' | 'unavailable' | 'noToken' | 'failed',
    /** The untranslated message from the Space, kept for diagnosis. */
    readonly detail?: string
  ) {
    super(message)
    this.name = 'TrellisError'
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
}

/** Gradio returns files either as an absolute URL or a path relative to the Space. */
function fileUrl(file: unknown): string | null {
  if (!file || typeof file !== 'object') return null
  const f = file as { url?: string; path?: string }
  if (f.url) return f.url
  if (f.path) return `https://${SPACE_ID.replace(/[/.]/g, '-').toLowerCase()}.hf.space/gradio_api/file=${f.path}`
  return null
}

/**
 * Turns a Space error into something Emily can act on.
 *
 * The categories are deliberately narrow. An earlier version folded
 * "GPU task aborted" into the quota bucket, which made every GPU-side failure
 * — including a step simply running past its 120-second budget — report itself
 * as an exhausted quota. That sent the wrong person looking in the wrong place,
 * so every branch now keeps the original message in `detail`.
 */
function classify(error: unknown): TrellisError {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  // Always keep the untranslated text around — the Hebrew below is a summary,
  // not a substitute.
  if (typeof console !== 'undefined') console.error('[trellis]', error)

  // ZeroGPU says so explicitly when the budget is the problem, and usually
  // names the wait. Anything vaguer is not a quota error.
  if (lower.includes('quota') || lower.includes('exceeded your') || lower.includes('gpu quota')) {
    // ZeroGPU names the exact wait — it is the single most useful part of the
    // message, so it goes in the summary rather than only in the detail line.
    const wait = /try again in ([0-9:]+)/i.exec(message)?.[1]
    return new TrellisError(
      `מכסת ה-GPU החינמית של Hugging Face נוצלה${wait ? ` — אפשר לנסות שוב בעוד ${wait} (שעות:דקות:שניות)` : ''}. ` +
        `כל הרצה דורשת כ-${GPU_SECONDS_PER_RUN} שניות GPU פנויות, ולכן היא נחסמת גם כשנותרה מכסה חלקית. ` +
        'חשבון PRO בתשלום מקבל 25 דקות ליום.',
      'quota',
      message
    )
  }

  // The Space declares @spaces.GPU(duration=120) per step. A heavier photo can
  // run past that and be killed, which reads as an abort, not as a quota.
  if (lower.includes('aborted') || lower.includes('timeout') || lower.includes('timed out')) {
    return new TrellisError(
      'משימת ה-GPU נעצרה באמצע — לרוב מפני שהשלב ארך יותר מהזמן המוקצב לו (שתי דקות). נסי תמונה קטנה או פשוטה יותר, או הורידי את הרזולוציה ל-512.',
      'timeout',
      message
    )
  }

  if (lower.includes('sleeping') || lower.includes('not running') || lower.includes('build') || lower.includes('503')) {
    return new TrellisError('ה-Space של TRELLIS אינו זמין כרגע (ייתכן שהוא במצב שינה או בתחזוקה). נסי שוב מאוחר יותר.', 'unavailable', message)
  }

  return new TrellisError(`יצירת המודל נכשלה: ${message}`, 'failed', message)
}

/**
 * Sends one image through TRELLIS.2 and returns the resulting GLB.
 * The whole run takes a few minutes and consumes ~240 ZeroGPU seconds.
 */
export async function imageToGlb(image: Blob, options: TrellisOptions = {}): Promise<TrellisResult> {
  const {
    token,
    resolution = DEFAULTS.resolution,
    seed = 0,
    decimationTarget = DEFAULTS.decimation_target,
    textureSize = DEFAULTS.texture_size,
    onProgress,
    signal,
  } = options

  if (decimationTarget < BOUNDS.decimationTarget.min || decimationTarget > BOUNDS.decimationTarget.max) {
    throw new TrellisError(
      `ערך decimation_target חייב להיות בין ${BOUNDS.decimationTarget.min} ל-${BOUNDS.decimationTarget.max}.`,
      'failed',
      `decimation_target out of range: ${decimationTarget}`
    )
  }
  if (textureSize < BOUNDS.textureSize.min || textureSize > BOUNDS.textureSize.max) {
    throw new TrellisError(
      `ערך texture_size חייב להיות בין ${BOUNDS.textureSize.min} ל-${BOUNDS.textureSize.max}.`,
      'failed',
      `texture_size out of range: ${textureSize}`
    )
  }

  // Without a token the run is metered against this browser's IP address on
  // ZeroGPU's small anonymous budget, which is shared and usually already
  // spent. Failing here beats burning a run and blaming the quota afterwards.
  if (!token) {
    throw new TrellisError(
      'לא נמצא מפתח Hugging Face. בלעדיו ההרצה נספרת על כתובת ה-IP במכסה ציבורית זעירה וכמעט תמיד נכשלת. ודאי ש-HF_TOKEN מוגדר בסביבה ושאת מחוברת לפאנל הניהול.',
      'noToken'
    )
  }

  // Loaded on demand so the Gradio client never lands in the initial admin bundle.
  const { Client } = await import('@gradio/client')

  onProgress?.('connecting')
  throwIfAborted(signal)

  let client: Awaited<ReturnType<typeof Client.connect>>
  try {
    client = await Client.connect(SPACE_ID, { token: token as `hf_${string}` })
  } catch (error) {
    throw classify(error)
  }

  try {
    // Allocates this session's working directory on the Space.
    await client.predict('/start_session', {})
    throwIfAborted(signal)

    // Removes the background and crops to a centred square — exactly what the
    // carousel wants anyway, so the result is worth keeping.
    onProgress?.('preprocessing')
    const pre = await client.predict('/preprocess_image', { input: image })
    const preUrl = fileUrl((pre.data as unknown[])?.[0])
    throwIfAborted(signal)

    onProgress?.('generating', 'שלב 1 מתוך 2 — בונה את המודל')
    await client.predict('/image_to_3d', {
      image: preUrl ? { path: preUrl, url: preUrl, meta: { _type: 'gradio.FileData' } } : image,
      seed,
      resolution,
      ss_guidance_strength: DEFAULTS.ss_guidance_strength,
      ss_guidance_rescale: DEFAULTS.ss_guidance_rescale,
      ss_sampling_steps: DEFAULTS.ss_sampling_steps,
      ss_rescale_t: DEFAULTS.ss_rescale_t,
      shape_slat_guidance_strength: DEFAULTS.shape_slat_guidance_strength,
      shape_slat_guidance_rescale: DEFAULTS.shape_slat_guidance_rescale,
      shape_slat_sampling_steps: DEFAULTS.shape_slat_sampling_steps,
      shape_slat_rescale_t: DEFAULTS.shape_slat_rescale_t,
      tex_slat_guidance_strength: DEFAULTS.tex_slat_guidance_strength,
      tex_slat_guidance_rescale: DEFAULTS.tex_slat_guidance_rescale,
      tex_slat_sampling_steps: DEFAULTS.tex_slat_sampling_steps,
      tex_slat_rescale_t: DEFAULTS.tex_slat_rescale_t,
    })
    throwIfAborted(signal)

    // Reads the latents out of the session state left by the previous call.
    //
    // Worth retrying rather than failing the whole run: by this point the
    // expensive half is already paid for, and the latents are sitting in this
    // session. Re-running /extract_glb costs one more GPU reservation; letting
    // the error escape costs the generation as well, because the state dies
    // with the client and cannot be reached again from a new connection.
    onProgress?.('extracting', 'שלב 2 מתוך 2 — מחלץ את הקובץ')

    let extracted: Awaited<ReturnType<typeof client.predict>> | null = null
    let extractError: unknown = null
    for (let attempt = 1; attempt <= EXTRACT_ATTEMPTS; attempt++) {
      try {
        extracted = await client.predict('/extract_glb', {
          decimation_target: decimationTarget,
          texture_size: textureSize,
        })
        extractError = null
        break
      } catch (error) {
        extractError = error
        throwIfAborted(signal)

        // A missing budget or a killed task will not behave differently on a
        // second try, and each attempt spends real quota. Only transient
        // failures are worth repeating.
        const kind = classify(error).kind
        if (kind === 'quota' || kind === 'timeout' || attempt === EXTRACT_ATTEMPTS) break

        onProgress?.('extracting', `שלב 2 מתוך 2 — ניסיון ${attempt + 1} מתוך ${EXTRACT_ATTEMPTS}`)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    if (extractError || !extracted) {
      const inner = classify(extractError)
      throw new TrellisError(
        `המודל נבנה בהצלחה, אבל חילוץ הקובץ נכשל — ולכן ההרצה כולה אבודה. ` +
          `המודל נשמר רק בזיכרון הזמני של ה-Space ואי אפשר לחזור אליו מאוחר יותר, ` +
          `גם לא אחרי שהמכסה תתחדש. ${inner.message}`,
        inner.kind,
        inner.detail
      )
    }
    throwIfAborted(signal)

    const glbUrl = fileUrl((extracted.data as unknown[])?.[0])
    if (!glbUrl) throw new Error('ה-Space לא החזיר קובץ GLB')

    onProgress?.('downloading')
    const [glb, preprocessed] = await Promise.all([
      fetch(glbUrl, { signal }).then(r => {
        if (!r.ok) throw new Error(`הורדת ה-GLB נכשלה (${r.status})`)
        return r.blob()
      }),
      preUrl
        ? fetch(preUrl, { signal }).then(r => (r.ok ? r.blob() : null)).catch(() => null)
        : Promise.resolve(null),
    ])

    return { glb, preprocessed }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    if (error instanceof TrellisError) throw error
    throw classify(error)
  } finally {
    // Releases the Space's per-session working directory and the SSE connection.
    try { await client.close?.() } catch { /* best effort */ }
  }
}
