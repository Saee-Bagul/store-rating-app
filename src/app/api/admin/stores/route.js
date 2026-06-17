export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserFromRequest, validateEmail } from '@/lib/auth'
import { getDb, initDb } from '@/lib/db'

export async function GET(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || ''
  const email = searchParams.get('email') || ''
  const address = searchParams.get('address') || ''
  const sortBy = searchParams.get('sortBy') || 'name'
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC'
  const allowed = ['name', 'email', 'address', 'avg_rating']
  const col = allowed.includes(sortBy) ? sortBy : 'name'

  const db = getDb()
  const [rows] = await db.execute(
    `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
        u.name as owner_name,
        ROUND(AVG(r.rating), 2) as avg_rating,
        COUNT(r.id) as rating_count
     FROM stores s
     LEFT JOIN users u ON s.owner_id = u.id
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE (? = '' OR s.name LIKE ?)
       AND (? = '' OR s.email LIKE ?)
       AND (? = '' OR s.address LIKE ?)
     GROUP BY s.id
     ORDER BY ${col === 'avg_rating' ? 'avg_rating' : `s.${col}`} ${sortDir}`,
    [name, `%${name}%`, email, `%${email}%`, address, `%${address}%`]
  )

  return NextResponse.json(rows)
}

export async function POST(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, address, owner_id } = await req.json()

  if (!name || !email)
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 })

  if (name.length < 20 || name.length > 60)
    return NextResponse.json({ error: 'Store name must be 20–60 characters' }, { status: 400 })

  if (!validateEmail(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  if (address && address.length > 400)
    return NextResponse.json({ error: 'Address max 400 characters' }, { status: 400 })

  const db = getDb()
  const [existing] = await db.execute('SELECT id FROM stores WHERE email = ?', [email])
  if (existing.length > 0)
    return NextResponse.json({ error: 'Store email already exists' }, { status: 409 })

  const [result] = await db.execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address || '', owner_id || null]
  )

  return NextResponse.json({ id: result.insertId, message: 'Store created' }, { status: 201 })
}
