export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(req) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const [rows] = await db.execute(
    'SELECT id, name, email, address, role FROM users WHERE id = ?',
    [user.id]
  )
  if (rows.length === 0)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json(rows[0])
}
