import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000
  const max = 3
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(t => now - t < windowMs)
  if (timestamps.length >= max) return true
  rateLimitMap.set(ip, [...timestamps, now])
  return false
}

async function sendContactNotification(data: {
  name: string
  email: string
  phone: string | null
  message: string
}) {
  try {
    const supabase = await createClient()
    const { data: contactInfo } = await supabase
      .from('contact_info')
      .select('email')
      .single()

    const adminEmail = contactInfo?.email
    if (!adminEmail) return

    const siteUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const submittedAt = new Intl.DateTimeFormat('he-IL', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Asia/Jerusalem',
    }).format(new Date())

    await getResend().emails.send({
      from: 'Emily Tal Portfolio <onboarding@resend.dev>',
      to: adminEmail,
      replyTo: data.email,
      subject: `הודעה חדשה מ-${data.name} | Emily Tal`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#3D2519;">
          <h2 style="margin:0 0 20px;font-size:20px;border-bottom:1px solid #E8E0D5;padding-bottom:12px;">
            הודעה חדשה מהאתר
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.7;">
            <tr>
              <td style="padding:6px 12px 6px 0;color:#5C3D2E;font-weight:bold;white-space:nowrap;vertical-align:top;width:80px;">שם:</td>
              <td style="padding:6px 0;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#5C3D2E;font-weight:bold;vertical-align:top;">מייל:</td>
              <td style="padding:6px 0;">
                <a href="mailto:${escapeHtml(data.email)}" style="color:#5C3D2E;">${escapeHtml(data.email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#5C3D2E;font-weight:bold;vertical-align:top;">טלפון:</td>
              <td style="padding:6px 0;">${data.phone ? escapeHtml(data.phone) : 'לא צוין'}</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#5C3D2E;font-weight:bold;vertical-align:top;">הודעה:</td>
              <td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(data.message)}</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;color:#5C3D2E;font-weight:bold;vertical-align:top;">נשלח:</td>
              <td style="padding:6px 0;color:#888;">${submittedAt}</td>
            </tr>
          </table>
          <p style="margin-top:28px;">
            <a href="${siteUrl}/admin/messages"
               style="display:inline-block;background:#5C3D2E;color:#F5F0E8;text-decoration:none;padding:10px 20px;font-size:13px;letter-spacing:0.05em;">
              צפייה בפאנל הניהול
            </a>
          </p>
          <p style="margin-top:16px;font-size:11px;color:#aaa;">
            מענה על מייל זה ישלח ישירות אל ${escapeHtml(data.email)}
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[contact notification] failed to send email:', err)
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await request.json()
  const { name, email, message, phone } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const phoneRegex = /^[+\d\s\-().]{7,20}$/
  if (phone?.trim() && !phoneRegex.test(phone.trim())) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('messages').insert({
    name, email, message,
    phone: phone?.trim() || null,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }

  // Fire and forget — email failure does not affect the response to the user
  void sendContactNotification({
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    message: message.trim(),
  })

  return NextResponse.json({ success: true })
}
