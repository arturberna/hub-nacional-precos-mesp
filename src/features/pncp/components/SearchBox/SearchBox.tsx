import { useRef, useState } from 'react'
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions'
import styles from './SearchBox.module.css'

const QUICK_TAGS = [
  'Bola de futebol',
  'Tênis esportivo',
  'Uniforme esportivo',
  'Colchonete ginástica',
  'Rede de vôlei',
]

export function SearchBox() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { suggestions, history, isLoading, query, setQuery, selectItem, escapeRegex } =
    useSearchSuggestions()

  function handleFocus() {
    if (query.length === 0 && history.length > 0) setDropdownOpen(true)
    else if (suggestions.length > 0) setDropdownOpen(true)
  }

  function handleChange(val: string) {
    setQuery(val)
    setDropdownOpen(val.length >= 2 || val.length === 0)
  }

  function handleSelect(text: string) {
    selectItem(text)
    setDropdownOpen(false)
  }

  function handleClickOutside(e: React.MouseEvent) {
    if (!boxRef.current?.contains(e.target as Node)) setDropdownOpen(false)
  }

  const showDropdown =
    dropdownOpen && (isLoading || suggestions.length > 0 || (query.length === 0 && history.length > 0))

  function highlight(text: string) {
    if (!query) return text
    const safe = escapeRegex(query)
    return text.replace(
      new RegExp(`(${safe})`, 'gi'),
      '<strong style="color:var(--blue-mid)">$1</strong>',
    )
  }

  return (
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
        />

        <div className={styles.divider} />

        <button className={styles.filter}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filtros
        </button>

        <button className={styles.submitBtn}>
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
                  <div className={`skeleton medium`} />
                  <div className={`skeleton price`} />
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
                  onClick={() => handleSelect(item.text)}
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

          {!isLoading && query.length >= 2 && suggestions.map(s => (
            <button
              key={s.text}
              className={styles.dropdownItem}
              onClick={() => handleSelect(s.text)}
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
          <button key={tag} className={styles.tag} onClick={() => handleSelect(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
