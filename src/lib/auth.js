import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'store-rating-secret-key-2024'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getUserFromRequest(req) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function validatePassword(password) {
  if (password.length < 8 || password.length > 16)
    return 'Password must be 8–16 characters'
  if (!/[A-Z]/.test(password))
    return 'Password must have at least one uppercase letter'
  if (!/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password))
    return 'Password must have at least one special character'
  return null
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
