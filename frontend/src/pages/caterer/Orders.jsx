import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { providerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const nextStatus = {
  pending: 'accepted',
  accepted: 'in_progress',
  in_progress: 'completed',
}

function CatererOrders() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['caterer-orders'],
    queryFn: () => providerAPI.getOrders().then((r) => r.data.data),
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }) => providerAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated!')
      queryClient.invalidateQueries({ queryKey: ['caterer-orders'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  })

  const orders = data || []

  if (isError && error?.response?.status === 404) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-orange-400" />
          <p className="font-semibold text-gray-800 mb-1">Business profile not set up</p>
          <p className="text-gray-500 text-sm">Create your business profile first to receive orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming customer orders</p>
        </div>
        {orders.length > 0 && (
          <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? <Spinner /> : isError ? (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load orders.'} onRetry={refetch} />
      ) : !orders.length ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Package size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-500">No orders yet</p>
          <p className="text-sm mt-1">Orders from customers will appear here once they book your services.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{order.customer_id?.name || 'Customer'}</p>
                  <p className="text-sm text-gray-500 truncate">{order.customer_id?.email || '—'}</p>
                  <p className="text-sm text-orange-600 font-medium mt-1">📞 {order.customer_phone || '—'}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 font-medium min-w-[80px]">Event Date:</span>
                  <span className="text-gray-900">
                    {order.event_date ? new Date(order.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 font-medium min-w-[80px]">Location:</span>
                  <span className="text-gray-900">{order.event_location || '—'}</span>
                </div>
                {order.guest_count && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 font-medium min-w-[80px]">Guests:</span>
                    <span className="text-gray-900">{order.guest_count}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 font-medium min-w-[80px]">Notes:</span>
                    <span className="text-gray-700 italic">{order.notes}</span>
                  </div>
                )}
              </div>

              {order.items?.length > 0 && (
                <div className="border-t pt-3 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={item.menu_id || idx} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t mt-3 pt-3 flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-gray-900">Total: ₹{order.total_amount?.toLocaleString()}</p>
                <div className="flex gap-2 flex-wrap">
                  {nextStatus[order.status] && (
                    <button
                      onClick={() => mutation.mutate({ id: order._id, status: nextStatus[order.status] })}
                      disabled={mutation.isPending}
                      className="bg-orange-500 text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-60 capitalize"
                    >
                      Mark as {nextStatus[order.status].replace('_', ' ')}
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'accepted') && (
                    <button
                      onClick={() => { if (window.confirm('Cancel this order?')) mutation.mutate({ id: order._id, status: 'cancelled' }) }}
                      disabled={mutation.isPending}
                      className="bg-red-50 text-red-500 px-3 sm:px-4 py-1.5 rounded-lg text-sm hover:bg-red-100 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === 'completed' && <span className="text-green-600 text-sm font-medium">✓ Completed</span>}
                  {order.status === 'cancelled' && <span className="text-red-400 text-sm">Cancelled</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CatererOrders
