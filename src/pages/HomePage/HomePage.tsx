import { HeroSection } from '@/features/pncp/components/HeroSection'
import { SearchBox } from '@/features/pncp/components/SearchBox'
import { ActionCards } from '@/features/pncp/components/ActionCards'
import { BottomPanels } from '@/features/pncp/components/BottomPanels'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <>
      <HeroSection />

      <div className={styles.content}>
        <SearchBox />

        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Ações Rápidas</h3>
          <button className={styles.sectionLink}>
            Ver todas
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <ActionCards />

        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Atividade Recente</h3>
        </div>

        <BottomPanels />
      </div>
    </>
  )
}
