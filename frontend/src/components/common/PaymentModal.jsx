import { useState } from 'react'
import { X, CreditCard, Banknote, QrCode, Copy, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function PaymentModal({ order, provider, onClose, onSubmit, isSubmitting }) {
  const [paymentMethod, setPaymentMethod] = useState('') // 'online' or 'cash_in_hand'
  const [amount, setAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [copied, setCopied] = useState(false)

  const paid = order.payments?.reduce((s, p) => s + (p.status === 'paid' ? p.amount : 0), 0) ?? 0
  const remaining = Math.max(0, (order.total_amount ?? 0) - paid)

  const hasPaymentDetails = provider?.payment_details?.upi_id || provider?.payment_details?.qr_code

  const handleCopyUPI = () => {
    if (provider?.payment_details?.upi_id) {
      navigator.clipboard.writeText(provider.payment_details.upi_id)
      setCopied(true)
      toast.success('UPI ID copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = () => {
    if (!paymentMethod) {
      return toast.error('Please select a payment method')
    }

    const amountNum = Number(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      return toast.error('Please enter a valid amount')
    }

    if (amountNum > remaining) {
      return toast.error(`Amount cannot exceed ₹${remaining.toLocaleString()}`)
    }

    onSubmit({
      amount: amountNum,
      payment_method: paymentMethod,
      transaction_id: transactionId.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Make Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{order.total_amount?.toLocaleString()}</p>
            {paid > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Paid: ₹{paid.toLocaleString()} • Remaining: ₹{remaining.toLocaleString()}
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                disabled={!hasPaymentDetails}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'online'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${!hasPaymentDetails ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <CreditCard size={24} className={`mx-auto mb-2 ${paymentMethod === 'online' ? 'text-orange-500' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${paymentMethod === 'online' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Online Payment
                </p>
                {!hasPaymentDetails && (
                  <p className="text-xs text-red-500 mt-1">Not available</p>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_in_hand')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cash_in_hand'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Banknote size={24} className={`mx-auto mb-2 ${paymentMethod === 'cash_in_hand' ? 'text-orange-500' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${paymentMethod === 'cash_in_hand' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Cash in Hand
                </p>
              </button>
            </div>
          </div>

          {/* Online Payment Details */}
          {paymentMethod === 'online' && hasPaymentDetails && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Pay using the caterer's payment details below:
              </p>

              {provider?.payment_details?.upi_id && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">UPI ID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                      {provider.payment_details.upi_id}
                    </code>
                    <button
                      onClick={handleCopyUPI}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-600 dark:text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}

              {provider?.payment_details?.account_holder_name && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Account Holder</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{provider.payment_details.account_holder_name}</p>
                </div>
              )}

              {provider?.payment_details?.bank_name && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bank</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{provider.payment_details.bank_name}</p>
                </div>
              )}

              {provider?.payment_details?.qr_code && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <QrCode size={14} /> Scan QR Code
                  </p>
                  <img
                    src={provider.payment_details.qr_code}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 mx-auto"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Transaction ID (optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction/reference ID"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          {/* Cash in Hand Info */}
          {paymentMethod === 'cash_in_hand' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                You'll pay the caterer directly in cash. The caterer will confirm receipt of payment.
              </p>
            </div>
          )}

          {/* Amount Input */}
          {paymentMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={remaining}
                  placeholder={`Max ₹${remaining.toLocaleString()}`}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can pay partially or the full remaining amount
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !paymentMethod || !amount}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 dark:bg-orange-600 text-white font-medium hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Submit Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
