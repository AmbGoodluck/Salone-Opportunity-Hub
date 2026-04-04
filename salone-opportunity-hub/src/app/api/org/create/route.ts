import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 1. Try to create the auth user via admin API (bypasses rate limits & email confirmation)
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: 'organization' },
    })

    let userId: string

    if (createError) {
      // User already exists - look them up
      const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 })
      }
      const existing = users.find((u) => u.email === email)
      if (!existing) {
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }
      userId = existing.id

      // Ensure email is confirmed
      await admin.auth.admin.updateUserById(userId, { email_confirm: true })
    } else {
      userId = newUser.user.id
    }

    // 2. Create the organization record (ignore duplicate)
    const { error: orgError } = await admin.from('organizations').insert({
      id: userId,
      name,
      email,
    })

    if (orgError && orgError.code !== '23505') {
      return NextResponse.json({ error: orgError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Org create API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
