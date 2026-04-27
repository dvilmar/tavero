import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ exists: false })

  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return NextResponse.json({ exists: false })

  const exists = data.users.some(
    u => u.email?.toLowerCase() === email.toLowerCase()
  )
  return NextResponse.json({ exists })
}
