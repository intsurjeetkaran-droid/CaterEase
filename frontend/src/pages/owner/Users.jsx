import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const roleColors = {
  customer: 'bg-blue-100 text-blue-700',
  provider: 'bg-orange-100 text-orange-700',
  admin: 'bg-purple-100 text-purple-700',
}

const approvalColors = {
  approved: 'text-green-600',
  rejected: 'text-red-500',
  pending: 'text-yellow-600',
}

function OwnerUsers() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['owner-users'],
    queryFn: () => adminAPI.getUsers().then((r) => r.data.data),
  })

  const { data: providers } = useQuery({
    queryKey: ['owner-providers'],
    queryFn: () => adminAPI.getProviders().then((r) => r.data.data),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => adminAPI.approveProvider(id, status),
    onSuccess: (_, { status }) => {
      toast.success(`Caterer ${status === 'approved' ? 'approved' : 'rejected'}!`)
      queryClient.invalidateQueries({ queryKey: ['owner-providers'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  })

  const users = data || []
  const providerMap = {}
  ;(providers || []).forEach(p => { providerMap[String(p.user_id)] = p })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all registered users and caterer approvals</p>
        </div>
        {users.length > 0 && (
          <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? <Spinner /> : isError ? (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load users.'} onRetry={refetch} />
      ) : !users.length ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Users size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-500">No users found</p>
          <p className="text-sm mt-1">Users will appear here once they register.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const providerProfile = providerMap[String(user._id)]
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{user.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                          {user.role === 'provider' ? 'caterer' : user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {user.role === 'provider' && providerProfile ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-medium capitalize ${approvalColors[providerProfile.approval_status]}`}>
                              {providerProfile.approval_status}
                            </span>
                            {providerProfile.approval_status !== 'approved' && (
                              <button
                                onClick={() => approveMutation.mutate({ id: providerProfile._id, status: 'approved' })}
                                disabled={approveMutation.isPending}
                                className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50"
                              >
                                <CheckCircle size={11} /> Approve
                              </button>
                            )}
                            {providerProfile.approval_status !== 'rejected' && (
                              <button
                                onClick={() => approveMutation.mutate({ id: providerProfile._id, status: 'rejected' })}
                                disabled={approveMutation.isPending}
                                className="flex items-center gap-1 text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle size={11} /> Reject
                              </button>
                            )}
                          </div>
                        ) : user.role === 'provider' ? (
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> No profile</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerUsers
