import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAPI, providerAPI } from '../services/api'
import useAuthStore from '../store/authStore'

/**
 * Custom hook for menu operations
 */
export function useMenus() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Customer: Get menus for a specific provider
  const useProviderMenus = (providerId) => {
    return useQuery({
      queryKey: ['provider-menus', providerId],
      queryFn: () => customerAPI.getMenus(providerId).then((r) => r.data.data),
      enabled: !!providerId && user?.role === 'customer',
    })
  }

  // Provider: Get my menus
  const useMyMenus = () => {
    return useQuery({
      queryKey: ['my-menus'],
      queryFn: () => providerAPI.getMenus().then((r) => r.data.data),
      enabled: user?.role === 'provider',
    })
  }

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: (menuData) => providerAPI.createMenu(menuData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menus'] })
    },
  })

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }) => providerAPI.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menus'] })
    },
  })

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: (id) => providerAPI.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menus'] })
    },
  })

  return {
    useProviderMenus,
    useMyMenus,
    createMenu: createMenuMutation.mutateAsync,
    updateMenu: updateMenuMutation.mutateAsync,
    deleteMenu: deleteMenuMutation.mutateAsync,
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
    isDeleting: deleteMenuMutation.isPending,
  }
}
