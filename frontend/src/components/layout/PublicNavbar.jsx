import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, Menu, X } from 'lucide-react'

function PublicNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <UtensilsCrossed size={22} />
            CaterEase
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-6">
            <a href="#how" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">How it works</a>
            <a href="#features" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">Features</a>
            <a href="#caterers" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">For Caterers</a>
          </div>

          {/* Auth buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden py-4 border-t border-gray-100 space-y-3">
            <a href="#how" onClick={() => setOpen(false)} className="block text-sm text-gray-600 py-2">How it works</a>
            <a href="#features" onClick={() => setOpen(false)} className="block text-sm text-gray-600 py-2">Features</a>
            <a href="#caterers" onClick={() => setOpen(false)} className="block text-sm text-gray-600 py-2">For Caterers</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center text-sm border border-gray-200 py-2 rounded-lg text-gray-700">Login</Link>
              <Link to="/register" className="flex-1 text-center text-sm bg-orange-500 text-white py-2 rounded-lg">Sign Up</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default PublicNavbar
