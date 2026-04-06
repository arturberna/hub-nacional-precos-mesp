import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { queryClient } from '@/lib/queryClient'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { MapaPage } from '@/pages/MapaPage'
import { RelatoriosPage } from '@/pages/RelatoriosPage'

const router = createBrowserRouter([
  /* Rotas públicas */
  {
    path: '/login',
    element: <LoginPage />,
  },

  /* Rotas protegidas com sidebar/topbar */
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: '/mapa',
            element: <MapaPage />,
          },
          {
            path: '/relatorios',
            element: <RelatoriosPage />,
          },
        ],
      },
    ],
  },

  /* 404 */
  {
    path: '*',
    element: (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#94a3b8' }}>404</h1>
          <p style={{ color: '#6B7280' }}>Página não encontrada</p>
        </div>
      </div>
    ),
  },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
