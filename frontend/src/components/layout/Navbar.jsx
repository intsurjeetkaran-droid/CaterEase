import { Link, useNavigate } from 'react-router-dom'
import { LogOut, UtensilsCrossed } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const roleLinks = {
  customer: [
    { to: '/customer', label: 'Dashboard' },
    { to: '/customer/providers', label: 'Providers' },
    { to: '/customer/orders', label: 'My Orders' },
  ],
  provider: [
    { to: '/caterer', label: 'Dashboard' },
    { to: '/caterer/menus', label: 'Menus' },
    { to: '/caterer/orders', label: 'Orders' },
  ],
  admin: [
    { to: '/owner', label: 'Dashboard' },
    { to: '/owner/users', label: 'Users' },
    { to: '/owner/orders', label: 'Orders' },
  ],
}

function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = user ? roleLinks[user.role] || [] : []

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <UtensilsCrossed size={24} />
            CaterEase
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:block">
                  {user.name} <span className="text-orange-400 capitalize">({user.role})</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-orange-500 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
