'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Hands the admin panel the optional Hugging Face token for TRELLIS.
 *
 * The token is never bundled into client JS (no NEXT_PUBLIC_ prefix) and is
 * only released to a signed-in admin. It is a low-value read token whose sole
 * purpose is to bill ZeroGPU time to Emily's HF account instead of the shared
 * anonymous per-IP pool, so it stays optional — the flow works without one.
 */
export async function getHuggingFaceToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return process.env.HF_TOKEN?.trim() || null
}
