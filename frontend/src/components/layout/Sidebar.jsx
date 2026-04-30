import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed, LayoutDashboard, Users, ShoppingBag,
  ChefHat, ClipboardList, LogOut, Menu, X,
  MapPin, CreditCard, Moon, Sun
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useTheme } from '../../context/ThemeContext'

const navConfig = {
  customer: [
    { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/providers', label: 'Browse Providers', icon: MapPin },
    { to: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
  ],
  caterer: [
    { to: '/caterer', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/caterer/menus', label: 'My Menus', icon: UtensilsCrossed },
    { to: '/caterer/orders', label: 'Orders', icon: ClipboardList },
  ],
  owner: [
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/users', label: 'Users', icon: Users },
    { to: '/owner/orders', label: 'All Orders', icon: ShoppingBag },
  ],
}

// Map DB role → route role
const roleToPath = { provider: 'caterer', admin: 'owner', customer: 'customer' }

function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const pathRole = roleToPath[user?.role] || user?.role
  const links = navConfig[pathRole] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (to) => {
    if (to === `/${pathRole}`) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="bg-orange-500 p-1.5 rounded-lg">
          <UtensilsCrossed size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">CaterEase</span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
            <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user?.role === 'provider' ? 'Caterer' : user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(to)
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1 rounded-md">
            <UtensilsCrossed size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">CaterEase</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30">
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar
