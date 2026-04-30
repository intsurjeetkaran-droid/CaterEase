import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { providerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => providerAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated!')
      queryClient.invalidateQueries({ queryKey: ['caterer-orders'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  })

  const paymentMutation = useMutation({
    mutationFn: ({ orderId, paymentId, status }) => providerAPI.updatePaymentStatus(orderId, paymentId, status),
    onSuccess: () => {
      toast.success('Payment status updated!')
      queryClient.invalidateQueries({ queryKey: ['caterer-orders'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update payment'),
  })

  const orders = data || []

  if (isError && error?.response?.status === 404) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Orders</h1>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-orange-400" />
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Business profile not set up</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create your business profile first to receive orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage incoming customer orders</p>
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
          <p className="text-sm mt-1">Orders from customers will appear here once they book your services.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const paid = order.payments?.reduce((s, p) => s + (p.status === 'paid' ? p.amount : 0), 0) ?? 0
            const pending = order.payments?.reduce((s, p) => s + (p.status === 'pending' ? p.amount : 0), 0) ?? 0
            const remaining = Math.max(0, (order.total_amount ?? 0) - paid - pending)
            const pendingCashPayments = order.payments?.filter(p => p.status === 'pending' && p.payment_method === 'cash_in_hand') || []

            return (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 sm:p-6">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{order.customer_id?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{order.customer_id?.email || '—'}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mt-1">📞 {order.customer_phone || '—'}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Event Details */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3 space-y-1">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">Event Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {order.event_date ? new Date(order.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">Location:</span>
                    <span className="text-gray-900 dark:text-white">{order.event_location || '—'}</span>
                  </div>
                  {order.guest_count && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">Guests:</span>
                      <span className="text-gray-900 dark:text-white">{order.guest_count}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">Notes:</span>
                      <span className="text-gray-700 dark:text-gray-300 italic">{order.notes}</span>
                    </div>
                  )}
                </div>

                {order.items?.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={item.menu_id || idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                        <span className="shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment Status */}
                <div className="border-t border-gray-100 dark:border-gray-700 mt-3 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">Total: ₹{order.total_amount?.toLocaleString()}</p>
                  </div>
                  
                  <div className="text-xs space-y-1 mb-3">
                    {paid > 0 && (
                      <p className="text-green-600 dark:text-green-400">✓ Received: ₹{paid.toLocaleString()}</p>
                    )}
                    {pending > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">⏳ Pending: ₹{pending.toLocaleString()}</p>
                    )}
                    {remaining > 0 && (
                      <p className="text-red-500 dark:text-red-400">Remaining: ₹{remaining.toLocaleString()}</p>
                    )}
                  </div>

                  {/* Pending Cash Payments */}
                  {pendingCashPayments.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                        Cash Payment Confirmation Required:
                      </p>
                      {pendingCashPayments.map((payment) => (
                        <div key={payment._id} className="flex items-center justify-between gap-2 mb-2 last:mb-0">
                          <span className="text-sm text-gray-700 dark:text-gray-300">₹{payment.amount.toLocaleString()}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => paymentMutation.mutate({ orderId: order._id, paymentId: payment._id, status: 'paid' })}
                              disabled={paymentMutation.isPending}
                              className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                              title="Confirm received"
                            >
                              <CheckCircle size={12} /> Received
                            </button>
                            <button
                              onClick={() => paymentMutation.mutate({ orderId: order._id, paymentId: payment._id, status: 'failed' })}
                              disabled={paymentMutation.isPending}
                              className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                              title="Mark as failed"
                            >
                              <XCircle size={12} /> Failed
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {nextStatus[order.status] && (
                      <button
                        onClick={() => statusMutation.mutate({ id: order._id, status: nextStatus[order.status] })}
                        disabled={statusMutation.isPending}
                        className="bg-orange-500 dark:bg-orange-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm hover:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-60 capitalize"
                      >
                        Mark as {nextStatus[order.status].replace('_', ' ')}
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'accepted') && (
                      <button
                        onClick={() => { if (window.confirm('Cancel this order?')) statusMutation.mutate({ id: order._id, status: 'cancelled' }) }}
                        disabled={statusMutation.isPending}
                        className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-3 sm:px-4 py-1.5 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    )}
                    {order.status === 'completed' && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Completed</span>}
                    {order.status === 'cancelled' && <span className="text-red-400 dark:text-red-500 text-sm">Cancelled</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CatererOrders
