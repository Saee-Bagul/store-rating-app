export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserFromRequest, validateEmail, validatePassword } from '@/lib/auth'
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
  const role = searchParams.get('role') || ''
  const sortBy = searchParams.get('sortBy') || 'name'
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC'

  const allowed = ['name', 'email', 'address', 'role', 'created_at']
  const col = allowed.includes(sortBy) ? sortBy : 'name'

  const db = getDb()
  const [rows] = await db.execute(
    `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
      ROUND((SELECT AVG(r.rating) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = u.id), 2) as store_rating
     FROM users u
     WHERE (? = '' OR u.name LIKE ?)
       AND (? = '' OR u.email LIKE ?)
       AND (? = '' OR u.address LIKE ?)
       AND (? = '' OR u.role = ?)
     ORDER BY ${col} ${sortDir}`,
    [name, `%${name}%`, email, `%${email}%`, address, `%${address}%`, role, role]
  )

  return NextResponse.json(rows)
}

export async function POST(req) {
  await initDb()
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, password, address, role } = await req.json()

  if (!name || !email || !password || !role)
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })

  if (name.length < 20 || name.length > 60)
    return NextResponse.json({ error: 'Name must be 20–60 characters' }, { status: 400 })

  if (!validateEmail(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  const pwErr = validatePassword(password)
  if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 })

  if (!['admin', 'user', 'store_owner'].includes(role))
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const db = getDb()
  const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length > 0)
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

  const hash = await bcrypt.hash(password, 10)
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hash, address || '', role]
  )

  return NextResponse.json({ id: result.insertId, message: 'User created' }, { status: 201 })
}
