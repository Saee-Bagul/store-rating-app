import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb, initDb } from '@/lib/db'
import { signToken, validateEmail } from '@/lib/auth'

export async function POST(req) {
  try {
    await initDb()
    const { email, password } = await req.json()

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    if (!validateEmail(email))
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const db = getDb()
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])

    if (rows.length === 0)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const user = rows[0]
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    const res = NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })

    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
