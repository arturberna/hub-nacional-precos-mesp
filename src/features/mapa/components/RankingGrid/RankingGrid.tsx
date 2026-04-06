import type { RankingEntry } from '../../types'
import styles from './RankingGrid.module.css'

function fmt(v: number) {
  return 'R$ ' + v.toFixed(2).replace('.', ',')
}

interface RankingGridProps {
  above: RankingEntry[]
  below: RankingEntry[]
}

export function RankingGrid({ above, below }: RankingGridProps) {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={`${styles.dot} ${styles.red}`} />
          <div className={styles.title}>Estados Acima da Média</div>
        </div>
        {above.map((entry, i) => (
          <div key={entry.uf} className={styles.item}>
            <span className={styles.rank}>{i + 1}</span>
            <span className={styles.uf}>{entry.uf}</span>
            <span className={styles.name}>{entry.data.name}</span>
            <span className={styles.price}>{fmt(entry.data.price)}</span>
            <span className={`${styles.var} ${styles.up}`}>+{entry.varPct}%</span>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={`${styles.dot} ${styles.green}`} />
          <div className={styles.title}>Estados Abaixo da Média</div>
        </div>
        {below.map((entry, i) => (
          <div key={entry.uf} className={styles.item}>
            <span className={styles.rank}>{i + 1}</span>
            <span className={styles.uf}>{entry.uf}</span>
            <span className={styles.name}>{entry.data.name}</span>
            <span className={styles.price}>{fmt(entry.data.price)}</span>
            <span className={`${styles.var} ${styles.down}`}>-{entry.varPct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
