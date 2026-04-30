import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight, ChefHat } from 'lucide-react'
import { customerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

function Providers() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['providers'],
    queryFn: () => customerAPI.getProviders().then((r) => r.data.data),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Catering Providers</h1>
        <p className="text-gray-500 mt-1">Browse approved providers and their menus</p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorMessage
          message={error?.response?.data?.message || 'Failed to load providers.'}
          onRetry={refetch}
        />
      ) : !data?.length ? (
        <div className="text-center py-16 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-500">No providers available yet</p>
          <p className="text-sm mt-1">Check back soon — new catering providers are being approved.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((provider) => (
            <div key={provider._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-orange-100 to-amber-50 h-32 flex items-center justify-center">
                <ChefHat size={48} className="text-orange-400" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg">{provider.business_name}</h3>
                {provider.address && (
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{provider.address}</span>
                  </div>
                )}
                {provider.phone && (
                  <p className="text-sm text-gray-500 mt-1">{provider.phone}</p>
                )}
                <Link
                  to={`/customer/providers/${provider._id}/menus`}
                  className="mt-4 flex items-center justify-between bg-orange-50 text-orange-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors"
                >
                  View Menu <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Providers
