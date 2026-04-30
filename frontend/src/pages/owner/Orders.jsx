import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { adminAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function OwnerOrders() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['owner-orders'],
    queryFn: () => adminAPI.getOrders().then((r) => r.data.data),
  })

  const orders = data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monitor every order on the platform</p>
        </div>
        {orders.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? <Spinner /> : isError ? (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load orders.'} onRetry={refetch} />
      ) : !orders.length ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Package size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No orders yet</p>
          <p className="text-sm mt-1">Orders will appear here once customers start booking.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">Caterer</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Event Date</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{order.customer_id?.name || '—'}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs hidden sm:block">{order.customer_id?.email || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 hidden sm:table-cell">{order.provider_id?.business_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {order.event_date ? new Date(order.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {order.total_amount != null ? `₹${order.total_amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {order.status?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerOrders
