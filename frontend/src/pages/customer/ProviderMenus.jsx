import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { customerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

function ProviderMenus() {
  const { providerId } = useParams()
  const navigate = useNavigate()
  const [cart, setCart] = useState({}) // { menuId: { item, quantity } }
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const { data: menus, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['menus', providerId],
    queryFn: () => customerAPI.getMenus(providerId).then((r) => r.data.data),
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: (orderData) => customerAPI.createOrder(orderData),
    onSuccess: () => {
      toast.success('Order placed successfully!')
      navigate('/customer/orders')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to place order'),
  })

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item._id]: { item, quantity: (prev[item._id]?.quantity || 0) + 1 },
    }))
  }

  const removeFromCart = (id) => {
    setCart((prev) => {
      const updated = { ...prev }
      if (updated[id]?.quantity > 1) {
        updated[id] = { ...updated[id], quantity: updated[id].quantity - 1 }
      } else {
        delete updated[id]
      }
      return updated
    })
  }

  const cartItems = Object.values(cart)
  const total = cartItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0)

  const placeOrder = () => {
    if (!eventDate) return toast.error('Please select an event date')
    if (eventDate <= today) return toast.error('Event date must be in the future')
    if (!eventLocation.trim()) return toast.error('Please enter event location')
    if (!customerPhone.trim()) return toast.error('Please enter your phone number')
    if (!cartItems.length) return toast.error('Add at least one item to your cart')

    mutation.mutate({
      provider_id: providerId,
      event_date: eventDate,
      event_location: eventLocation.trim(),
      customer_phone: customerPhone.trim(),
      guest_count: guestCount ? Number(guestCount) : undefined,
      items: cartItems.map(({ item, quantity }) => ({ menu_id: item._id, quantity })),
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/customer/providers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Providers
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Menu Items</h1>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorMessage
          message={error?.response?.data?.message || 'Failed to load menu items.'}
          onRetry={refetch}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu list */}
          <div className="lg:col-span-2">
            {!menus?.length ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-40" />
                <p className="font-medium text-gray-500">No menu items available</p>
                <p className="text-sm mt-1">This provider hasn't added any menu items yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {menus.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
                      <p className="text-orange-500 font-semibold mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cart[item._id] ? (
                        <>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">{cart[item._id].quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-600 transition-colors"
                        >
                          <Plus size={14} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart / Order summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={20} className="text-orange-500" />
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
              {cartItems.length > 0 && (
                <span className="ml-auto text-xs bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </div>

            {!cartItems.length ? (
              <p className="text-gray-400 text-sm text-center py-6">Your cart is empty</p>
            ) : (
              <div className="space-y-2 mb-4">
                {cartItems.map(({ item, quantity }) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate mr-2">{item.name} × {quantity}</span>
                    <span className="font-medium shrink-0">₹{(item.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-500">₹{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Location *</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Grand Hotel, Mumbai"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements..."
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={mutation.isPending || !cartItems.length || !menus?.length}
              className="mt-4 w-full bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderMenus
