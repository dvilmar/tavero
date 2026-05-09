import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id } = await request.json()

    if (!restaurant_id || typeof restaurant_id !== 'string') {
      return NextResponse.json({ error: 'Missing restaurant_id' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') ?? null
    const referer = request.headers.get('referer') ?? null

    await (supabase.from('menu_visits') as any).insert({
      restaurant_id,
      user_agent: userAgent?.slice(0, 500) ?? null,
      referer: referer?.slice(0, 500) ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
