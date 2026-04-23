import { useState } from 'react'
import { HeroSection } from '@/features/pncp/components/HeroSection'
import { SearchBox } from '@/features/pncp/components/SearchBox'
import { SearchResultsList } from '@/features/pncp/components/SearchResultsList'
import { ActionCards } from '@/features/pncp/components/ActionCards'
import { BottomPanels } from '@/features/pncp/components/BottomPanels'
import { ResultPanel } from '@/features/pncp/components/ResultPanel'
import type { PncpIndexItem } from '@/features/pncp/types'
import styles from './HomePage.module.css'

export function HomePage() {
  const [searchResults, setSearchResults] = useState<PncpIndexItem[] | null>(null)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [selectedItem,  setSelectedItem]  = useState<PncpIndexItem | null>(null)

  function handleSearch(results: PncpIndexItem[], query: string) {
    setSearchResults(results)
    setSearchQuery(query)
    setSelectedItem(null)
  }

  function handleSelectItem(item: PncpIndexItem) {
    setSelectedItem(item)
  }

  function handleClearResults() {
    setSearchResults(null)
    setSearchQuery('')
  }

  return (
    <>
      <HeroSection />

      <div className={styles.content}>
        <SearchBox
          onSearch={handleSearch}
          onSelectItem={handleSelectItem}
        />

        {/* Lista de resultados — empurra as seções abaixo */}
        {searchResults !== null && (
          <SearchResultsList
            results={searchResults}
            query={searchQuery}
            onSelectItem={handleSelectItem}
            onClear={handleClearResults}
          />
        )}

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

      {/* ResultPanel para itens selecionados na lista de resultados */}
      <ResultPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  )
}
