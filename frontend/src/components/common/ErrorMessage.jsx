import { AlertCircle, RefreshCw } from 'lucide-react'

function ErrorMessage({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <AlertCircle size={32} className="text-red-400" />
      </div>
      <p className="text-gray-700 font-medium mb-1">Oops! Something went wrong</p>
      <p className="text-gray-400 text-sm mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
