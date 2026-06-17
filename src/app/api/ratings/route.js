export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getDb, initDb } from '@/lib/db'

export async function POST(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'user')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { store_id, rating } = await req.json()

  if (!store_id || !rating)
    return NextResponse.json({ error: 'store_id and rating required' }, { status: 400 })

  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })

  const db = getDb()
  const [storeCheck] = await db.execute('SELECT id FROM stores WHERE id = ?', [store_id])
  if (storeCheck.length === 0)
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  const [existing] = await db.execute(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
    [user.id, store_id]
  )

  if (existing.length > 0) {
    await db.execute(
      'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
      [rating, user.id, store_id]
    )
    return NextResponse.json({ message: 'Rating updated' })
  } else {
    await db.execute(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [user.id, store_id, rating]
    )
    return NextResponse.json({ message: 'Rating submitted' }, { status: 201 })
  }
}
