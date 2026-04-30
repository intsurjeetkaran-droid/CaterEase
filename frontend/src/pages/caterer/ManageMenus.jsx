import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'
import { providerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const emptyForm = { name: '', category: '', price: '', description: '' }

function ManageMenus() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['caterer-menus'],
    queryFn: () => providerAPI.getMenus().then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (data) => providerAPI.createMenu(data),
    onSuccess: () => {
      toast.success('Menu item added!')
      queryClient.invalidateQueries({ queryKey: ['caterer-menus'] })
      setForm(emptyForm)
      setShowForm(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add item'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => providerAPI.deleteMenu(id),
    onSuccess: () => {
      toast.success('Item deleted')
      queryClient.invalidateQueries({ queryKey: ['caterer-menus'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete item'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const price = Number(form.price)
    if (!form.name.trim()) return toast.error('Item name is required')
    if (!form.category.trim()) return toast.error('Category is required')
    if (!price || price <= 0) return toast.error('Price must be greater than zero')
    createMutation.mutate({ ...form, name: form.name.trim(), category: form.category.trim(), price })
  }

  const menus = data || []
  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Menus</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add and manage your catering menu items</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 dark:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">New Menu Item</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Item Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass} placeholder="e.g. Paneer Tikka" maxLength={100} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass} placeholder="e.g. Starters" maxLength={50} />
            </div>
            <div>
              <label className={labelClass}>Price (₹ per serving)</label>
              <input required type="number" min="1" step="1" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass} placeholder="200" />
            </div>
            <div>
              <label className={labelClass}>Description (optional)</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass} placeholder="Short description" maxLength={200} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={createMutation.isPending}
                className="bg-orange-500 dark:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-60">
                {createMutation.isPending ? 'Saving...' : 'Save Item'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Spinner /> : isError ? (
        <ErrorMessage message={error?.response?.data?.message || 'Failed to load menu items.'} onRetry={refetch} />
      ) : !menus.length ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No menu items yet</p>
          <p className="text-sm mt-1">Click "Add Item" above to create your first menu item.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {menus.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                {item.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{item.description}</p>}
                <p className="text-orange-500 dark:text-orange-400 font-semibold text-sm mt-1">₹{item.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) deleteMutation.mutate(item._id) }}
                disabled={deleteMutation.isPending}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManageMenus
