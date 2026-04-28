import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { email?: string; source?: string; hp?: string }
    const email = (body.email || '').trim().toLowerCase()
    const source = (body.source || 'site').toString()
    const honeypot = body.hp || ''

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Honeypot to deter bots
    if (honeypot) {
      return NextResponse.json({ ok: true })
    }

    // Persist to backend server if configured
    const serverBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL
    if (serverBase) {
      try {
        await fetch(`${serverBase}/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source })
        })
      } catch (err) {
        console.warn('Backend newsletter subscribe failed:', err)
        // Continue, not fatal
      }
    }

    // Optional: forward to external webhook if configured
    const webhook = process.env.NEWSLETTER_WEBHOOK_URL
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source, ts: new Date().toISOString() })
        })
      } catch (err) {
        console.warn('Newsletter webhook failed:', err)
        // Don’t fail user flow on webhook errors
      }
    }

    // Success (no persistence by default)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Newsletter subscribe error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
