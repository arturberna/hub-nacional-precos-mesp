import styles from './BottomPanels.module.css'

const RECENT = [
  { dot: 'green', name: 'Bola de futebol society tamanho 5', meta: 'CATMAT 320021 · há 2h',     price: 'R$ 87,40',  badge: 'ok'   as const, badgeLabel: 'OK' },
  { dot: 'gold',  name: 'Colchonete ginástica 1,80m×60cm',  meta: 'CATMAT 150112 · ontem',      price: 'R$ 124,00', badge: 'warn' as const, badgeLabel: 'Atenção' },
  { dot: 'blue',  name: 'Uniforme esportivo infantil — kit', meta: 'CATMAT 488930 · 2 dias',     price: 'R$ 42,60',  badge: 'ok'   as const, badgeLabel: 'OK' },
  { dot: 'green', name: 'Rede de vôlei oficial competição',  meta: 'CATMAT 295810 · 3 dias',     price: 'R$ 310,00', badge: 'ok'   as const, badgeLabel: 'OK' },
]

const ALERTS = [
  {
    type: 'danger' as const,
    title: 'Possível sobrepreço detectado',
    sub: 'Tênis esportivo adulto — 32% acima da média regional',
    time: '15min',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
      </svg>
    ),
  },
  {
    type: 'warn' as const,
    title: 'Contrato próximo do vencimento',
    sub: 'Contrato #2024-0089 — 7 dias restantes',
    time: '1h',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    type: 'info' as const,
    title: 'Novos dados PNCP disponíveis',
    sub: 'Atualização de 14.280 itens — março 2025',
    time: '3h',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

export function BottomPanels() {
  return (
    <div className={styles.grid}>
      {/* Consultas Recentes */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Consultas Recentes</span>
          <button className={styles.panelLink}>Ver histórico</button>
        </div>
        <div>
          {RECENT.map(item => (
            <div key={item.name} className={styles.recentItem}>
              <div className={`${styles.dot} ${styles[item.dot as 'green' | 'gold' | 'blue']}`} />
              <div className={styles.recentInfo}>
                <div className={styles.recentName}>{item.name}</div>
                <div className={styles.recentMeta}>{item.meta}</div>
              </div>
              <div className={styles.recentPrice}>{item.price}</div>
              <span className={`${styles.recentBadge} ${styles[item.badge]}`}>
                {item.badgeLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas Ativos */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Alertas Ativos</span>
          <button className={styles.panelLink}>Gerenciar</button>
        </div>
        <div>
          {ALERTS.map(item => (
            <div key={item.title} className={styles.alertItem}>
              <div className={`${styles.alertIcon} ${styles[item.type]}`}>
                {item.icon}
              </div>
              <div className={styles.alertText}>
                <div className={styles.alertTitle}>{item.title}</div>
                <div className={styles.alertSub}>{item.sub}</div>
              </div>
              <div className={styles.alertTime}>{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
