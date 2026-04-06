import { QueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/types'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10,   // 10 minutos
      retry: (failureCount, error) => {
        const apiError = error as ApiError
        if (apiError?.statusCode >= 400 && apiError?.statusCode < 500) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
