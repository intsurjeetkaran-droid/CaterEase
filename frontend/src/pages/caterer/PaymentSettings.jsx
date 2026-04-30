import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Save, QrCode, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { providerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'

function PaymentSettings() {
  const queryClient = useQueryClient()
  const [upiId, setUpiId] = useState('')
  const [qrCode, setQrCode] = useState('') // base64 or URL
  const [bankName, setBankName] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => providerAPI.getProfile().then((r) => r.data.data),
    onSuccess: (data) => {
      if (data?.payment_details) {
        setUpiId(data.payment_details.upi_id || '')
        setQrCode(data.payment_details.qr_code || '')
        setBankName(data.payment_details.bank_name || '')
        setAccountHolderName(data.payment_details.account_holder_name || '')
      }
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => providerAPI.updatePaymentDetails(data),
    onSuccess: () => {
      toast.success('Payment details updated successfully!')
      queryClient.invalidateQueries(['provider-profile'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update payment details'),
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file')
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size must be less than 2MB')
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setQrCode(reader.result) // data:image/png;base64,...
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!upiId.trim() && !qrCode) {
      return toast.error('Please provide at least UPI ID or QR Code')
    }

    mutation.mutate({
      upi_id: upiId.trim(),
      qr_code: qrCode,
      bank_name: bankName.trim(),
      account_holder_name: accountHolderName.trim(),
    })
  }

  if (isLoading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Configure your payment details for customers to pay you
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* UPI Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-orange-500 dark:text-orange-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">UPI Payment Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  UPI ID *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@paytm"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Customers will use this UPI ID for online payments
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <QrCode size={20} className="text-orange-500 dark:text-orange-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">QR Code (Optional)</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload QR Code Image
              </label>
              
              {qrCode ? (
                <div className="relative">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-48 h-48 object-contain border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setQrCode('')}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove QR code"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, JPEG (max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Upload your UPI payment QR code. Customers can scan this to pay you directly.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {mutation.isPending ? 'Saving...' : 'Save Payment Details'}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Customers will see these payment details when they choose to pay online. 
          Make sure your UPI ID is correct and active.
        </p>
      </div>
    </div>
  )
}

export default PaymentSettings
