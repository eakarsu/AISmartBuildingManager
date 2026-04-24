import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Building2, LogOut, LayoutGrid } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {}
    } catch {
      return {}
    }
  })()

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/hvac', label: 'HVAC' },
    { path: '/lighting', label: 'Lighting' },
    { path: '/climate', label: 'Climate' },
    { path: '/maintenance', label: 'Maintenance' },
    { path: '/energy', label: 'Energy' },
    { path: '/comfort', label: 'Comfort' },
    { path: '/security', label: 'Security' },
    { path: '/space', label: 'Space' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/reports', label: 'Reports' },
    { path: '/activity', label: 'Activity' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block gradient-text">AI Smart Building</span>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/profile')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                {(user.name || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm text-dark-300">{user.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
