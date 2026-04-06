import type { ApiError } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions<TBody = unknown> {
  method?: RequestMethod
  body?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, signal } = options

  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let errorData: Partial<ApiError> = {}
    try {
      errorData = await response.json()
    } catch {
      // resposta sem JSON
    }
    const error: ApiError = {
      message: errorData.message ?? `Erro ${response.status}`,
      statusCode: response.status,
      errors: errorData.errors,
    }
    throw error
  }

  // 204 No Content
  if (response.status === 204) return undefined as TResponse

  return response.json() as Promise<TResponse>
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
