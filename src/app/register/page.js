'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSuccess('Registration successful! Redirecting to login...')
    setTimeout(() => router.push('/login'), 1500)
  }

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1> StoreRate</h1>
          <p>Create your account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name <span style={{color:'var(--text-muted)',fontSize:12}}>(20–60 chars)</span></label>
            <input type="text" placeholder="Enter your full name" required minLength={20} maxLength={60}
              value={form.name} onChange={f('name')} />
            <span style={{fontSize:12,color:'var(--text-muted)'}}>{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" required
              value={form.email} onChange={f('email')} />
          </div>
          <div className="form-group">
            <label>Password <span style={{color:'var(--text-muted)',fontSize:12}}>(8–16 chars, 1 uppercase, 1 special)</span></label>
            <input type="password" placeholder="••••••••" required
              value={form.password} onChange={f('password')} />
          </div>
          <div className="form-group">
            <label>Address <span style={{color:'var(--text-muted)',fontSize:12}}>(optional, max 400 chars)</span></label>
            <textarea placeholder="Your address" maxLength={400}
              value={form.address} onChange={f('address')} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
