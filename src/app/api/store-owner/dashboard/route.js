export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getDb, initDb } from '@/lib/db'

export async function GET(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'store_owner')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const sortBy = searchParams.get('sortBy') || 'name'
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC'
  const allowed = ['name', 'email', 'rating', 'created_at']
  const col = allowed.includes(sortBy) ? sortBy : 'name'

  const db = getDb()
  const [storeRows] = await db.execute(
    `SELECT s.id, s.name, s.address, s.email,
        ROUND(AVG(r.rating), 2) as avg_rating,
        COUNT(r.id) as rating_count
     FROM stores s
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [user.id]
  )

  if (storeRows.length === 0)
    return NextResponse.json({ store: null, raters: [] })

  const store = storeRows[0]
  const [raters] = await db.execute(
    `SELECT u.name, u.email, r.rating, r.updated_at
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     WHERE r.store_id = ?
     ORDER BY ${col === 'rating' ? 'r.rating' : `u.${col}`} ${sortDir}`,
    [store.id]
  )

  return NextResponse.json({ store, raters })
}
