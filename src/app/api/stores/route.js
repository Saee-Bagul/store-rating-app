export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getDb, initDb } from '@/lib/db'

export async function GET(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || ''
  const address = searchParams.get('address') || ''
  const sortBy = searchParams.get('sortBy') || 'name'
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC'
  const allowed = ['name', 'address', 'avg_rating']
  const col = allowed.includes(sortBy) ? sortBy : 'name'

  const db = getDb()
  const [rows] = await db.execute(
    `SELECT s.id, s.name, s.address, s.email,
        ROUND(AVG(r.rating), 2) as avg_rating,
        COUNT(r.id) as rating_count,
        (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating
     FROM stores s
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE (? = '' OR s.name LIKE ?)
       AND (? = '' OR s.address LIKE ?)
     GROUP BY s.id
     ORDER BY ${col === 'avg_rating' ? 'avg_rating' : `s.${col}`} ${sortDir}`,
    [user.id, name, `%${name}%`, address, `%${address}%`]
  )

  return NextResponse.json(rows)
}
