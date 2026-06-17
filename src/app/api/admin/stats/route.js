export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getDb, initDb } from '@/lib/db'

export async function GET(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getDb()
  const [[userCount]] = await db.execute('SELECT COUNT(*) as total FROM users')
  const [[storeCount]] = await db.execute('SELECT COUNT(*) as total FROM stores')
  const [[ratingCount]] = await db.execute('SELECT COUNT(*) as total FROM ratings')

  return NextResponse.json({
    totalUsers: userCount.total,
    totalStores: storeCount.total,
    totalRatings: ratingCount.total,
  })
}
