import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Package, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { customerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
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
  const [payingOrder, setPayingOrder] = useState(null)
  const [payAmount, setPayAmount] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => customerAPI.getMyOrders().then((r) => r.data.data),
  })

  const payMutation = useMutation({
    mutationFn: ({ orderId, amount }) => customerAPI.addPayment(orderId, amount),
    onSuccess: () => {
      toast.success('Payment recorded!')
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      setPayingOrder(null)
      setPayAmount('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Payment failed'),
  })

  const handlePay = (orderId, remaining) => {
    const amount = Number(payAmount)
    if (!payAmount || isNaN(amount) || amount <= 0) {
      return toast.error('Please enter a valid payment amount')
    }
    if (amount > remaining) {
      return toast.error(`Amount cannot exceed remaining balance of ₹${remaining.toLocaleString()}`)
    }
    payMutation.mutate({ orderId, amount })
  }

  const orders = data || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        {orders.length > 0 && (
          <span className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
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
          <p className="font-medium text-gray-500">No orders yet</p>
          <p className="text-sm mt-1">Browse providers and place your first catering order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const paid = order.payments?.reduce((s, p) => s + (p.status === 'paid' ? p.amount : 0), 0) ?? 0
            const remaining = Math.max(0, (order.total_amount ?? 0) - paid)
            const isFullyPaid = remaining === 0

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.provider_id?.business_name || 'Catering Provider'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Event: {order.event_date
                        ? new Date(order.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                {order.items?.length > 0 && (
                  <div className="border-t pt-3 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={item.menu_id || idx} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t mt-3 pt-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Total: </span>
                    <span className="font-semibold text-gray-900">₹{order.total_amount?.toLocaleString() ?? '—'}</span>
                    {isFullyPaid ? (
                      <span className="text-green-600 ml-2 font-medium">✓ Fully paid</span>
                    ) : remaining > 0 ? (
                      <span className="text-red-500 ml-2">(₹{remaining.toLocaleString()} remaining)</span>
                    ) : null}
                  </div>

                  {remaining > 0 && order.status !== 'cancelled' && (
                    payingOrder === order._id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number"
                          value={payAmount}
                          min="1"
                          max={remaining}
                          onChange={(e) => setPayAmount(e.target.value)}
                          placeholder={`Max ₹${remaining.toLocaleString()}`}
                          className="w-36 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <button
                          onClick={() => handlePay(order._id, remaining)}
                          disabled={payMutation.isPending}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 disabled:opacity-60"
                        >
                          {payMutation.isPending ? 'Processing...' : 'Pay'}
                        </button>
                        <button
                          onClick={() => { setPayingOrder(null); setPayAmount('') }}
                          className="text-gray-400 text-sm hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setPayingOrder(order._id); setPayAmount('') }}
                        className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm hover:bg-orange-100"
                      >
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyOrders
