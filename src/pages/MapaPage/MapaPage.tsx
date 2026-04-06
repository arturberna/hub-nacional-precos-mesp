import { useMapaData } from '@/features/mapa/hooks/useMapaData'
import { BrazilMap } from '@/features/mapa/components/BrazilMap'
import { StatsGrid } from '@/features/mapa/components/StatsGrid'
import { RankingGrid } from '@/features/mapa/components/RankingGrid'
import styles from './MapaPage.module.css'

export function MapaPage() {
  const { stats, rankings, stateData } = useMapaData()

  return (
    <div className={styles.content}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>
            Mapa de <em>Preços</em>
          </div>
          <div className={styles.pageSub}>
            Distribuição regional de preços praticados em compras públicas esportivas
          </div>
        </div>

        <div className={styles.filterRow}>
          <select className={styles.filterSelect} defaultValue="Bola de futebol society">
            <option>Bola de futebol society</option>
            <option>Tênis esportivo</option>
            <option>Uniforme esportivo</option>
            <option>Colchonete ginástica</option>
            <option>Rede de vôlei</option>
          </select>
          <select className={styles.filterSelect} defaultValue="2025">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
          <button className={styles.filterBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.18-5.36" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Map */}
      <div className={styles.mapCard}>
        <div className={styles.mapCardHeader}>
          <div>
            <div className={styles.mapCardTitle}>Mapa Interativo por Estado</div>
            <div className={styles.mapCardSub}>Passe o mouse sobre cada estado para ver detalhes</div>
          </div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.green}`} />
              Na média ou abaixo
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.red}`} />
              Acima da média
            </div>
          </div>
        </div>

        <BrazilMap stateData={stateData} avg={stats.avg} />
      </div>

      {/* Rankings */}
      <RankingGrid above={rankings.above} below={rankings.below} />
    </div>
  )
}
