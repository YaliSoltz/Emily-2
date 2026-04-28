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

  // Send reset email
  const redirectTo = `${request.nextUrl.origin}/auth/callback?next=/adminresetpassword`
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error: resetError } = await anonClient.auth.resetPasswordForEmail(email, { redirectTo })

  if (resetError) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
