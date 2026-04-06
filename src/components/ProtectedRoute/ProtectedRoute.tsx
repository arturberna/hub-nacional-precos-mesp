import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts'

/**
 * Protege rotas que exigem autenticação.
 * Redireciona para /login preservando a rota de destino original.
 *
 * Uso no router:
 * ```tsx
 * {
 *   element: <ProtectedRoute />,
 *   children: [
 *     { path: '/', element: <HomePage /> },
 *     { path: '/exemplo', element: <ExemploPage /> },
 *   ],
 * }
 * ```
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
