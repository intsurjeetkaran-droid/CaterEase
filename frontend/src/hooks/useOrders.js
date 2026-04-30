import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAPI, providerAPI, adminAPI } from '../services/api'
import useAuthStore from '../store/authStore'

/**
 * Custom hook for order operations based on user role
 */
export function useOrders() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Customer: Get my orders
  const useMyOrders = () => {
    return useQuery({
      queryKey: ['my-orders'],
      queryFn: () => customerAPI.getMyOrders().then((r) => r.data.data),
      enabled: user?.role === 'customer',
    })
  }

  // Provider: Get assigned orders
  const useProviderOrders = () => {
    return useQuery({
      queryKey: ['provider-orders'],
      queryFn: () => providerAPI.getOrders().then((r) => r.data.data),
      enabled: user?.role === 'provider',
    })
  }

  // Admin: Get all orders
  const useAllOrders = () => {
    return useQuery({
      queryKey: ['admin-orders'],
      queryFn: () => adminAPI.getOrders().then((r) => r.data.data),
      enabled: user?.role === 'admin',
    })
  }

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => customerAPI.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
  })

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => providerAPI.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: ({ orderId, amount }) => customerAPI.addPayment(orderId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
  })

  return {
    useMyOrders,
    useProviderOrders,
    useAllOrders,
    createOrder: createOrderMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    addPayment: addPaymentMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isPaymentProcessing: addPaymentMutation.isPending,
  }
}
