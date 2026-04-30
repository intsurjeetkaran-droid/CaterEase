import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ClipboardList, TrendingUp, ArrowRight, AlertCircle, UtensilsCrossed, CheckCircle } from 'lucide-react'
import { providerAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import Spinner from '../../components/common/Spinner'

function CatererDashboard() {
  const { user } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['caterer-orders'],
    queryFn: () => providerAPI.getOrders().then((r) => r.data.data),
  })

  const orders = data || []
  const pending = orders.filter((o) => o.status === 'pending').length
  const inProgress = orders.filter((o) => o.status === 'in_progress').length
  const completed = orders.filter((o) => o.status === 'completed').length
  const earnings = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const noProfile = isError && error?.response?.status === 404

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your catering business overview</p>
      </div>

      {noProfile && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">Set up your business profile</p>
            <p className="text-sm text-gray-500 mt-0.5">
              You need a business profile before you can receive orders and add menu items.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: <ClipboardList size={20} className="text-yellow-500" />, label: 'Pending', value: pending, color: 'bg-yellow-50' },
              { icon: <TrendingUp size={20} className="text-purple-500" />, label: 'In Progress', value: inProgress, color: 'bg-purple-50' },
              { icon: <CheckCircle size={20} className="text-green-500" />, label: 'Completed', value: completed, color: 'bg-green-50' },
              { icon: <TrendingUp size={20} className="text-orange-500" />, label: 'Earnings', value: `₹${earnings.toLocaleString()}`, color: 'bg-orange-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.color} shrink-0`}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/caterer/orders" className="bg-orange-500 text-white rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:bg-orange-600 transition-colors group">
              <div>
                <p className="font-semibold text-base sm:text-lg">Manage Orders</p>
                <p className="text-orange-100 text-sm mt-0.5">
                  {orders.length > 0 ? `${orders.length} total order${orders.length !== 1 ? 's' : ''}` : 'No orders yet'}
                </p>
              </div>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/caterer/menus" className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:shadow-md transition-shadow group">
              <div>
                <p className="font-semibold text-base sm:text-lg text-gray-900">Manage Menus</p>
                <p className="text-gray-500 text-sm mt-0.5">Add or update your dishes</p>
              </div>
              <ArrowRight size={22} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Recent orders preview */}
          {orders.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                <Link to="/caterer/orders" className="text-sm text-orange-500 hover:text-orange-600">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer_id?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-400">
                        {order.event_date ? new Date(order.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{order.total_amount?.toLocaleString()}</p>
                      <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{order.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CatererDashboard
