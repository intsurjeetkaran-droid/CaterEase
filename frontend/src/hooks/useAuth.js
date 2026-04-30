import { useNavigate } from 'react-router-dom'
import useAuthStore, { rolePath } from '../store/authStore'

/**
 * Custom hook for authentication operations
 * Provides login, register, logout with automatic navigation
 */
export function useAuth() {
  const navigate = useNavigate()
  const { user, token, isLoading, error, login, register, logout } = useAuthStore()

  const handleLogin = async (credentials) => {
    try {
      const user = await login(credentials)
      const path = rolePath[user.role] || '/'
      navigate(path)
      return user
    } catch (err) {
      throw err
    }
  }

  const handleRegister = async (userData) => {
    try {
      const user = await register(userData)
      const path = rolePath[user.role] || '/'
      navigate(path)
      return user
    } catch (err) {
      throw err
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }
}
