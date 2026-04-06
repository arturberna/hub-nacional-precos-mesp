import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import styles from './Layout.module.css'

const BREADCRUMBS: Record<string, { label: string; icon?: React.ReactNode }[]> = {
  '/': [
    {
      label: 'Hub Nacional',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    { label: 'Painel Principal', active: true },
  ],
  '/mapa': [
    {
      label: 'Hub Nacional',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        </svg>
      ),
    },
    { label: 'Mapa de Preços', active: true },
  ],
  '/consultar': [
    { label: 'Hub Nacional' },
    { label: 'Consultar Preços', active: true },
  ],
  '/relatorios': [
    {
      label: 'Hub Nacional',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    { label: 'Relatórios', active: true },
  ],
}

function getBreadcrumbs(pathname: string) {
  return (
    BREADCRUMBS[pathname] ?? [
      { label: 'Hub Nacional' },
      { label: 'Página', active: true },
    ]
  )
}

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className={styles.shell}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      <div className={styles.panel}>
        <Topbar breadcrumbs={getBreadcrumbs(location.pathname)} />

        <main className={styles.main} id="mainScroll">
          <Outlet />
        </main>
      </div>

      <div className={styles.fabs}>
        <button className={`${styles.fab} ${styles.gold}`} title="Nova solicitação rápida">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className={`${styles.fab} ${styles.primary}`} title="Ajuda">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  )
}
