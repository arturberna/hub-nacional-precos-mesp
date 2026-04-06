/* ============================================================
   Tipos globais da aplicação
   ============================================================ */

/** Usuário autenticado */
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatarUrl?: string
}

/** Credenciais de login */
export interface LoginCredentials {
  email: string
  password: string
}

/** Resposta paginada genérica */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

/** Resposta de erro da API */
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

/** Opção de select genérico */
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/** Parâmetros de query comuns */
export interface QueryParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
