import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, ShoppingBag, TrendingUp, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { adminAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import Spinner from '../../components/common/Spinner'

function OwnerDashboard() {
  const { user } = useAuthStore()

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['owner-users'],
    queryFn: () => adminAPI.getUsers().then((r) => r.data.data),
  })
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['owner-orders'],
    queryFn: () => adminAPI.getOrders().then((r) => r.data.data),
  })
  const { data: providers } = useQuery({
    queryKey: ['owner-providers'],
    queryFn: () => adminAPI.getProviders().then((r) => r.data.data),
  })

  const isLoading = loadingUsers || loadingOrders
  const totalRevenue = (orders || [])
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const pendingProviders = (providers || []).filter(p => p.approval_status === 'pending').length
  const completedOrders = (orders || []).filter(o => o.status === 'completed').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Welcome back, {user?.name}</p>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: <Users size={20} className="text-blue-500" />, label: 'Total Users', value: users?.length ?? 0, color: 'bg-blue-50' },
              { icon: <ShoppingBag size={20} className="text-orange-500" />, label: 'Total Orders', value: orders?.length ?? 0, color: 'bg-orange-50' },
              { icon: <CheckCircle size={20} className="text-green-500" />, label: 'Completed', value: completedOrders, color: 'bg-green-50' },
              { icon: <TrendingUp size={20} className="text-purple-500" />, label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-purple-50' },
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

          {/* Pending approvals banner */}
          {pendingProviders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800 font-medium">
                  {pendingProviders} caterer{pendingProviders !== 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              <Link to="/owner/users" className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 shrink-0">
                Review
              </Link>
            </div>
          )}

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Link to="/owner/users" className="bg-orange-500 text-white rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:bg-orange-600 transition-colors group">
              <div>
                <p className="font-semibold text-base sm:text-lg">Manage Users</p>
                <p className="text-orange-100 text-sm mt-0.5">{users?.length ?? 0} users registered</p>
              </div>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/owner/orders" className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:shadow-md transition-shadow group">
              <div>
                <p className="font-semibold text-base sm:text-lg text-gray-900">All Orders</p>
                <p className="text-gray-500 text-sm mt-0.5">₹{totalRevenue.toLocaleString()} total revenue</p>
              </div>
              <ArrowRight size={22} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Recent orders */}
          {(orders || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                <Link to="/owner/orders" className="text-sm text-orange-500 hover:text-orange-600">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium hidden sm:table-cell">Caterer</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Amount</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(orders || []).slice(0, 5).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{order.customer_id?.name || '—'}</td>
                        <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{order.provider_id?.business_name || '—'}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">₹{order.total_amount?.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{order.status.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default OwnerDashboard
