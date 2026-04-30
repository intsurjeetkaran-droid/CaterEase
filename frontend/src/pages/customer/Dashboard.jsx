import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag, Users, CreditCard, ArrowRight } from 'lucide-react'
import { customerAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import Spinner from '../../components/common/Spinner'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function CustomerDashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => customerAPI.getMyOrders().then((r) => r.data.data),
  })

  const orders = data || []
  const pending = orders.filter((o) => o.status === 'pending').length
  const completed = orders.filter((o) => o.status === 'completed').length
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your catering overview</p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<ShoppingBag size={22} className="text-orange-500" />}
              label="Total Orders"
              value={orders.length}
              color="bg-orange-50 dark:bg-orange-900/30"
            />
            <StatCard
              icon={<Users size={22} className="text-blue-500" />}
              label="Pending"
              value={pending}
              color="bg-blue-50 dark:bg-blue-900/30"
            />
            <StatCard
              icon={<CreditCard size={22} className="text-green-500" />}
              label="Total Spent"
              value={`₹${totalSpent.toLocaleString()}`}
              color="bg-green-50 dark:bg-green-900/30"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/customer/providers"
              className="bg-orange-500 dark:bg-orange-600 text-white rounded-2xl p-6 flex items-center justify-between hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
            >
              <div>
                <p className="font-semibold text-lg">Browse Providers</p>
                <p className="text-orange-100 text-sm mt-1">Find caterers for your event</p>
              </div>
              <ArrowRight size={24} />
            </Link>
            <Link
              to="/customer/orders"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">My Orders</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{completed} completed orders</p>
              </div>
              <ArrowRight size={24} className="text-gray-400 dark:text-gray-500" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default CustomerDashboard
