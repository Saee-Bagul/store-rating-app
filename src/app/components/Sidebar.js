'use client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const adminNav = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/stores', label: 'Stores', icon: '🏪' },
  { href: '/profile', label: 'Change Password', icon: '🔒' },
]

const userNav = [
  { href: '/stores', label: 'Browse Stores', icon: '🏪' },
  { href: '/profile', label: 'Change Password', icon: '🔒' },
]

const ownerNav = [
  { href: '/dashboard/store-owner', label: 'My Store', icon: '📊' },
  { href: '/profile', label: 'Change Password', icon: '🔒' },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUser(d))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'store_owner' ? ownerNav : userNav
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : '?'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⭐ StoreRate</h1>
        <p>Rating Platform</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <div className="user-badge">
            <div className="user-badge-avatar">{initials}</div>
            <div className="user-badge-info">
              <div className="user-badge-name">{user.name}</div>
              <div className="user-badge-role">{user.role.replace('_', ' ')}</div>
            </div>
          </div>
        )}
        <button className="nav-item" onClick={logout} style={{ color: '#ef4444', width: '100%' }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
