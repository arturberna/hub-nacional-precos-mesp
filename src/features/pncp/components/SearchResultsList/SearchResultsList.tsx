import type { PncpIndexItem } from '../../types'
import styles from './SearchResultsList.module.css'

interface SearchResultsListProps {
  results: PncpIndexItem[]
  query: string
  onSelectItem: (item: PncpIndexItem) => void
  onClear: () => void
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function SearchResultsList({ results, query, onSelectItem, onClear }: SearchResultsListProps) {
  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.count}>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
          <span className={styles.queryLabel}>para "<strong>{query}</strong>"</span>
        </div>
        <button className={styles.clearBtn} onClick={onClear} title="Limpar resultados">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Limpar
        </button>
      </div>

      {results.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>Nenhum item encontrado para "<strong>{query}</strong>"</p>
          <span>Tente outros termos ou verifique a grafia</span>
        </div>
      ) : (
        <ul className={styles.list}>
          {results.map(item => (
            <li key={item.id}>
              <button
                className={styles.resultItem}
                onClick={() => onSelectItem(item)}
              >
                <div className={styles.itemMain}>
                  <span className={styles.itemName}>{item.nome}</span>
                  <div className={styles.itemMeta}>
                    <span className={`${styles.tipoBadge} ${item.tipo === 'M' ? styles.material : styles.servico}`}>
                      {item.tipo === 'M' ? 'Material' : 'Serviço'}
                    </span>
                    <span className={styles.categoria}>{item.categoria}</span>
                    {item.sneaelis && (
                      <span className={styles.sneaelisBadge}>SNEAELIS</span>
                    )}
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <div className={styles.itemPrice}>
                    {item.vu_mediana > 0 ? fmtBRL(item.vu_mediana) : '—'}
                    <span className={styles.priceLabel}>mediana/{item.unidade}</span>
                  </div>
                  <div className={styles.itemStats}>
                    <span>{item.ocorrencias.toLocaleString('pt-BR')} ocorrências</span>
                    <span>{item.municipios_n} municípios</span>
                  </div>
                </div>

                <div className={styles.arrow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
