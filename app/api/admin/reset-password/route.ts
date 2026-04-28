import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const email: string = body.email?.trim()?.toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 })
  }

  // Check user exists using service role
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers()
  if (listError) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  const exists = users.some(u => u.email?.toLowerCase() === email)
  if (!exists) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  }

  // User exists — tell the client to proceed with the browser-side reset call
  // (resetPasswordForEmail must be called from the browser so the PKCE code
  // verifier is stored in localStorage, not on the server)
  return NextResponse.json({ success: true })
}
