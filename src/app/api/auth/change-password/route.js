import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserFromRequest, validatePassword } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function PUT(req) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: 'Both fields required' }, { status: 400 })

  const pwErr = validatePassword(newPassword)
  if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 })

  const db = getDb()
  const [rows] = await db.execute('SELECT password FROM users WHERE id = ?', [user.id])

  const isValid = await bcrypt.compare(currentPassword, rows[0].password)
  if (!isValid)
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

  const hash = await bcrypt.hash(newPassword, 10)
  await db.execute('UPDATE users SET password = ? WHERE id = ?', [hash, user.id])

  return NextResponse.json({ message: 'Password updated successfully' })
}
