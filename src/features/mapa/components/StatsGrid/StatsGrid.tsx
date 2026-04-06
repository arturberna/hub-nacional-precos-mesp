import type { MapaStats } from '../../types'
import styles from './StatsGrid.module.css'

function fmt(v: number) {
  return 'R$ ' + v.toFixed(2).replace('.', ',')
}

interface StatsGridProps {
  stats: MapaStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  const { avg, belowCount, minEntry, maxEntry, minVar, maxVar } = stats

  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.blue}`}>
        <div className={`${styles.icon} ${styles.blue}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="4" /><line x1="18" y1="20" x2="18" y2="10" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div className={styles.label}>Média Nacional</div>
        <div className={styles.value}>{fmt(avg)}</div>
        <div className={styles.sub}>Preço médio por unidade</div>
      </div>

      <div className={`${styles.card} ${styles.green}`}>
        <div className={`${styles.icon} ${styles.green}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className={styles.label}>Na Média ou Abaixo</div>
        <div className={styles.value}>{belowCount} estados</div>
        <div className={styles.sub}>de 27 estados + DF</div>
      </div>

      <div className={`${styles.card} ${styles.green}`}>
        <div className={`${styles.icon} ${styles.green}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div className={styles.label}>Menor Preço</div>
        <div className={styles.value}>{fmt(minEntry[1].price)}</div>
        <div className={styles.sub}>{minEntry[1].name} · {minVar}% abaixo</div>
      </div>

      <div className={`${styles.card} ${styles.red}`}>
        <div className={`${styles.icon} ${styles.red}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
          </svg>
        </div>
        <div className={styles.label}>Maior Preço</div>
        <div className={styles.value}>{fmt(maxEntry[1].price)}</div>
        <div className={styles.sub}>{maxEntry[1].name} · {maxVar}% acima</div>
      </div>
    </div>
  )
}
