import { useRef, useState } from 'react'
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions'
import { ResultPanel } from '../ResultPanel'
import type { PncpIndexItem } from '../../types'
import styles from './SearchBox.module.css'

const QUICK_TAGS = [
  'Bola de futebol',
  'Tênis esportivo',
  'Uniforme esportivo',
  'Colchonete ginástica',
  'Rede de vôlei',
]

interface SearchBoxProps {
  onSearch: (results: PncpIndexItem[], query: string) => void
  onSelectItem: (item: PncpIndexItem) => void
}

export function SearchBox({ onSearch, onSelectItem }: SearchBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const {
    suggestions, history, isLoading, query, selectedItem,
    setQuery, selectItem, clearSelection, escapeRegex, searchAll,
  } = useSearchSuggestions()

  function handleFocus() {
    if (query.length === 0 && history.length > 0) setDropdownOpen(true)
    else if (suggestions.length > 0) setDropdownOpen(true)
  }

  function handleChange(val: string) {
    setQuery(val)
    setDropdownOpen(val.length >= 2 || val.length === 0)
  }

  function handleDropdownSelect(text: string, item?: PncpIndexItem) {
    selectItem(text, item)
    setDropdownOpen(false)
    if (item) onSelectItem(item)
  }

  function handleBuscar() {
    if (query.trim().length < 2) return
    setDropdownOpen(false)
    const results = searchAll(query.trim())
    onSearch(results, query.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleBuscar()
  }

  function handleClickOutside(e: React.MouseEvent) {
    if (!boxRef.current?.contains(e.target as Node)) setDropdownOpen(false)
  }

  const showDropdown =
    dropdownOpen &&
    (isLoading || suggestions.length > 0 || (query.length === 0 && history.length > 0))

  function highlight(text: string) {
    if (!query) return text
    const safe = escapeRegex(query)
    return text.replace(
      new RegExp(`(${safe})`, 'gi'),
      '<strong style="color:var(--blue-light);font-weight:600">$1</strong>',
    )
  }

  return (
    <>
      <div className={styles.section} onClick={handleClickOutside}>
        <h2 className={styles.label}>
          O que você precisa <em>precificar</em> hoje?
        </h2>
        <p className={styles.hint}>Busque por item, CATMAT, categoria ou descrição livre</p>

        <div className={styles.box} ref={boxRef}>
          <div className={styles.searchIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            className={styles.input}
            type="text"
            value={query}
            placeholder="Ex: bola de futebol society, tênis esportivo, uniforme..."
            autoComplete="off"
            onChange={e => handleChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />

          <div className={styles.divider} />

          <button className={styles.filter}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filtros
          </button>

          <button className={styles.submitBtn} onClick={handleBuscar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar
          </button>

          {/* Autocomplete dropdown */}
          <div className={`${styles.dropdown} ${showDropdown ? styles.show : ''}`}>
            {isLoading && (
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.skeletonItem}>
                    <div className="skeleton medium" />
                    <div className="skeleton price" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && query.length === 0 && history.length > 0 && (
              <>
                <div className={styles.sectionLabel}>Buscas recentes</div>
                {history.map(item => (
                  <button
                    key={item.text}
                    className={styles.dropdownItem}
                    onClick={() => handleDropdownSelect(item.text)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    <span className={styles.itemBody}>
                      <span>{item.text}</span>
                    </span>
                    <span className={styles.itemHistoryPrice}>{item.count}x</span>
                  </button>
                ))}
              </>
            )}

            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
              <div className={styles.emptyMsg}>
                Nenhum item encontrado para "<strong>{query}</strong>"
              </div>
            )}

            {!isLoading && query.length >= 2 && suggestions.map(s => (
              <button
                key={s.text}
                className={styles.dropdownItem}
                onClick={() => handleDropdownSelect(s.text, s.item)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className={styles.itemBody}>
                  <span dangerouslySetInnerHTML={{ __html: highlight(s.text) }} />
                  {s.orgao && <span className={styles.itemOrgao}>{s.orgao}</span>}
                </span>
                {s.price && <span className={styles.itemPrice}>{s.price}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tags}>
          <span className={styles.tagsLabel}>Buscas frequentes:</span>
          {QUICK_TAGS.map(tag => (
            <button key={tag} className={styles.tag} onClick={() => handleDropdownSelect(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ResultPanel para seleções via dropdown */}
      <ResultPanel item={selectedItem} onClose={clearSelection} />
    </>
  )
}
