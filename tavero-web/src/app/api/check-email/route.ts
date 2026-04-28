import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { email?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ exists: true }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  if (!email) return NextResponse.json({ exists: true })

  // Avoid account enumeration: never expose existence publicly
  return NextResponse.json({ exists: true })
}
