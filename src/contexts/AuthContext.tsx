import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { User, LoginCredentials } from '@/types'

/* ============================================================
   Tipos do contexto
   ============================================================ */
interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

/* ============================================================
   Criação do contexto
   ============================================================ */
const AuthContext = createContext<AuthContextValue | null>(null)

/* ============================================================
   Mock de autenticação — substituir pela chamada real à API
   ============================================================ */
const MOCK_USER: User = {
  id: '1',
  name: 'Usuário Demo',
  email: 'demo@exemplo.com',
  role: 'admin',
}

async function mockLogin(credentials: LoginCredentials): Promise<User> {
  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 800))

  if (credentials.email === 'demo@exemplo.com' && credentials.password === '123456') {
    return MOCK_USER
  }

  throw new Error('E-mail ou senha inválidos.')
}

/* ============================================================
   Provider
   ============================================================ */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser, removeUser] = useLocalStorage<User | null>('auth_user', null)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedUser = await mockLogin(credentials)
    setUser(loggedUser)
    // Em produção: salvar token retornado pela API
    // localStorage.setItem('auth_token', response.token)
  }, [setUser])

  const logout = useCallback(() => {
    removeUser()
    localStorage.removeItem('auth_token')
  }, [removeUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false, // em produção: true enquanto verifica token inicial
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ============================================================
   Hook de acesso ao contexto
   ============================================================ */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return context
}
