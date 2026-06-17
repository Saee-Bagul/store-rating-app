import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb, initDb } from '@/lib/db'
import { validateEmail, validatePassword } from '@/lib/auth'

export async function POST(req) {
  try {
    await initDb()
    const { name, email, password, address } = await req.json()

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })

    if (name.length < 20 || name.length > 60)
      return NextResponse.json({ error: 'Name must be 20–60 characters' }, { status: 400 })

    if (!validateEmail(email))
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const pwErr = validatePassword(password)
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 })

    if (address && address.length > 400)
      return NextResponse.json({ error: 'Address max 400 characters' }, { status: 400 })

    const db = getDb()
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0)
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hash = await bcrypt.hash(password, 10)
    await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, address || '', 'user']
    )

    return NextResponse.json({ message: 'Registration successful' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
