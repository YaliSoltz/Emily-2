'use client'

import { createClient } from '@/lib/supabase/client'

const BUCKET = 'public-images'

/** Uploads one blob to Supabase Storage and returns its public URL. */
export async function uploadBlob(path: string, blob: Blob, contentType?: string): Promise<string> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: contentType ?? blob.type ?? 'application/octet-stream',
  })
  if (error) throw new Error(`העלאה נכשלה (${path}): ${error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

/**
 * Uploads an ordered list of blobs, preserving order in both the filenames and
 * the returned array. Runs a few at a time so a 36-frame batch does not open 36
 * parallel connections.
 */
export async function uploadOrdered(
  folder: string,
  blobs: Blob[],
  ext: string,
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = new Array(blobs.length)
  const CONCURRENCY = 4
  let done = 0
  let cursor = 0

  const worker = async () => {
    while (cursor < blobs.length) {
      const i = cursor++
      const name = `frame-${String(i + 1).padStart(2, '0')}.${ext}`
      urls[i] = await uploadBlob(`${folder}/${name}`, blobs[i])
      onProgress?.(++done, blobs.length)
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, blobs.length) }, worker))
  return urls
}
