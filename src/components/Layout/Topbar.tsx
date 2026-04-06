import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts'
import styles from './Topbar.module.css'

interface BreadcrumbItem {
  label: string
  active?: boolean
  icon?: React.ReactNode
}

interface TopbarProps {
  breadcrumbs: BreadcrumbItem[]
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'MS'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <header className={styles.topbar}>
      <div className={styles.breadcrumb}>
        {breadcrumbs.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i === 0 && item.icon}
            <span className={item.active ? styles.breadcrumbActive : undefined}>
              {item.label}
            </span>
            {i < breadcrumbs.length - 1 && <span className={styles.sep}>/</span>}
          </span>
        ))}
      </div>

      <div className={styles.right} ref={notifRef}>
        <button
          className={styles.btn}
          onClick={e => { e.stopPropagation(); setNotifOpen(v => !v) }}
          title="Notificações"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <div className={styles.notifDot} />
        </button>

        <button className={styles.btn} title="Ajuda">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        <div className={styles.divider} />

        <button className={styles.userBtn}>
          <div className={styles.userAvatar}>{initials}</div>
          <span className={styles.userName}>{user?.name ?? 'Usuário'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Notification Dropdown */}
        <div className={`${styles.notifDropdown} ${notifOpen ? styles.open : ''}`}>
          <div className={styles.notifHeader}>
            <span className={styles.notifTitle}>Notificações</span>
            <button className={styles.notifClear}>Marcar como lida</button>
          </div>

          <div className={styles.notifItem}>
            <div className={styles.notifUnreadDot} />
            <div className={`${styles.notifIcon} ${styles.blue}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
              </svg>
            </div>
            <div>
              <div className={styles.notifMsg}>Sobrepreço detectado em &quot;Tênis esportivo — lote 3&quot;</div>
              <div className={styles.notifTime}>há 15 min</div>
            </div>
          </div>

          <div className={styles.notifItem}>
            <div className={styles.notifUnreadDot} />
            <div className={`${styles.notifIcon} ${styles.gold}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <div className={styles.notifMsg}>Contrato #2024-0089 próximo do vencimento (7 dias)</div>
              <div className={styles.notifTime}>há 1h</div>
            </div>
          </div>

          <div className={styles.notifItem}>
            <div className={`${styles.notifIcon} ${styles.blue}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className={styles.notifMsg}>Atualização de preços PNCP disponível (março 2025)</div>
              <div className={styles.notifTime}>há 3h</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
