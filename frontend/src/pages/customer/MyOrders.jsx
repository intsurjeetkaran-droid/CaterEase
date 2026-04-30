import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Package, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { customerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import PaymentModal from '../../components/common/PaymentModal'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function MyOrders() {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => customerAPI.getMyOrders().then((r) => r.data.data),
  })

  const payMutation = useMutation({
    mutationFn: ({ orderId, paymentData }) => customerAPI.addPayment(orderId, paymentData),
    onSuccess: () => {
      toast.success('Payment submitted successfully!')
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      setSelectedOrder(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  })

  const handlePaymentSubmit = (paymentData) => {
    if (selectedOrder) {
      payMutation.mutate({ orderId: selectedOrder._id, paymentData })
    }
  }

  const orders = data || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        {orders.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorMessage
          message={error?.response?.data?.message || 'Failed to load your orders.'}
          onRetry={refetch}
        />
      ) : !orders.length ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No orders yet</p>
          <p className="text-sm mt-1">Browse providers and place your first catering order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const paid = order.payments?.reduce((s, p) => s + (p.status === 'paid' ? p.amount : 0), 0) ?? 0
            const pending = order.payments?.reduce((s, p) => s + (p.status === 'pending' ? p.amount : 0), 0) ?? 0
            const remaining = Math.max(0, (order.total_amount ?? 0) - paid - pending)
            const isFullyPaid = remaining === 0 && pending === 0

            return (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {order.provider_id?.business_name || 'Catering Provider'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Event: {order.event_date
                        ? new Date(order.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                    {order.event_location && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📍 {order.event_location}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                {order.items?.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={item.menu_id || idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 dark:border-gray-700 mt-3 pt-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total: </span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{order.total_amount?.toLocaleString() ?? '—'}</span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="text-xs space-y-1">
                    {paid > 0 && (
                      <p className="text-green-600 dark:text-green-400">✓ Paid: ₹{paid.toLocaleString()}</p>
                    )}
                    {pending > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">⏳ Pending: ₹{pending.toLocaleString()}</p>
                    )}
                    {remaining > 0 && (
                      <p className="text-red-500 dark:text-red-400">Remaining: ₹{remaining.toLocaleString()}</p>
                    )}
                    {isFullyPaid && (
                      <p className="text-green-600 dark:text-green-400 font-medium">✓ Fully paid</p>
                    )}
                  </div>

                  {/* Payment Button */}
                  {remaining > 0 && order.status !== 'cancelled' && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 dark:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                    >
                      <CreditCard size={16} /> Make Payment
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          provider={selectedOrder.provider_id}
          onClose={() => setSelectedOrder(null)}
          onSubmit={handlePaymentSubmit}
          isSubmitting={payMutation.isPending}
        />
      )}
    </div>
  )
}

export default MyOrders
