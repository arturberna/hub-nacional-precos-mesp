import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts'
import styles from './Sidebar.module.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'MS'

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      onClick={onToggle}
      title={collapsed ? 'Expandir menu' : 'Recolher menu'}
    >
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandTitle}>HUB NACIONAL</div>
          <div className={styles.brandSub}>Ministério do Esporte</div>
        </div>
        <div className={`${styles.chevron} ${collapsed ? styles.chevronCollapsed : ''}`}>
          <svg viewBox="0 0 10 10" fill="none">
            <path d="M6 2L3 5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* stopPropagation protege todos os NavLinks — o clique navega mas não colapsa */}
      <nav className={styles.nav} onClick={e => e.stopPropagation()}>
        <div className={styles.navSection}>Principal</div>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className={styles.navLabel}>Painel</span>
        </NavLink>

        <NavLink
          to="/consultar"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className={styles.navLabel}>Consultar Preços</span>
        </NavLink>

        <NavLink
          to="/compras"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span className={styles.navLabel}>Compras</span>
          <span className={styles.navBadge}>12</span>
        </NavLink>

        <NavLink
          to="/contratos"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className={styles.navLabel}>Contratos</span>
          <span className={styles.navBadge}>3</span>
        </NavLink>

        <div className={styles.navSection} style={{ marginTop: '12px' }}>Análises</div>

        <NavLink
          to="/raio-x"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          <span className={styles.navLabel}>Raio-X</span>
        </NavLink>

        <NavLink
          to="/comparador"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="9" height="18" rx="1"/><rect x="13" y="3" width="9" height="18" rx="1"/>
          </svg>
          <span className={styles.navLabel}>Comparador</span>
        </NavLink>

        <NavLink
          to="/relatorios"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className={styles.navLabel}>Relatórios</span>
        </NavLink>

        <NavLink
          to="/alertas"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className={styles.navLabel}>Alertas</span>
          <span className={`${styles.navBadge} ${styles.danger}`}>5</span>
        </NavLink>

        <NavLink
          to="/mapa"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          </svg>
          <span className={styles.navLabel}>Mapa de Preços</span>
        </NavLink>

        <div className={styles.navSection} style={{ marginTop: '12px' }}>Sistema</div>

        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M2 12h2M20 12h2M18.36 18.36l-1.41-1.41M7.05 7.05L5.64 5.64M12 2v2M12 20v2" />
          </svg>
          <span className={styles.navLabel}>Configurações</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name ?? 'Usuário'}</div>
            <div className={styles.userRole}>{user?.role ?? 'Gestor de Compras'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
