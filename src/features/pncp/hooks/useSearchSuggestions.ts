import { useState, useCallback, useRef } from 'react'
import { useFuseSearch } from './useFuseSearch'
import type { SearchSuggestion, SearchHistoryItem, PncpIndexItem } from '../types'

const HISTORY_KEY = 'search_history_v1'
const MAX_HISTORY = 8
const DEBOUNCE_MS = 250

function getHistory(): SearchHistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') }
  catch { return [] }
}

function saveHistory(items: SearchHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function fmtBRL(v: number) {
  return 'R$ ' + v.toFixed(2).replace('.', ',')
}

export interface UseSearchSuggestionsReturn {
  suggestions: SearchSuggestion[]
  history: SearchHistoryItem[]
  isLoading: boolean
  query: string
  selectedItem: PncpIndexItem | null
  setQuery: (v: string) => void
  selectItem: (text: string, item?: PncpIndexItem) => void
  clearSelection: () => void
  clearSuggestions: () => void
  escapeRegex: (text: string) => string
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const { search, isReady } = useFuseSearch()

  const [query,        setQueryState]  = useState('')
  const [suggestions,  setSuggestions] = useState<SearchSuggestion[]>([])
  const [history,      setHistory]     = useState<SearchHistoryItem[]>(getHistory)
  const [isLoading,    setIsLoading]   = useState(false)
  const [selectedItem, setSelectedItem] = useState<PncpIndexItem | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setQuery = useCallback((val: string) => {
    setQueryState(val)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (val.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    timerRef.current = setTimeout(() => {
      const results = search(val)
      setSuggestions(
        results.map(r => ({
          text:  r.item.nome,
          price: r.item.vu_mediana > 0 ? fmtBRL(r.item.vu_mediana) + ' méd.' : '—',
          orgao: r.item.categoria,
          item:  r.item,
        }))
      )
      setIsLoading(false)
    }, isReady ? DEBOUNCE_MS : 600)
  }, [search, isReady])

  const selectItem = useCallback((text: string, item?: PncpIndexItem) => {
    setQueryState(text)
    setSuggestions([])
    if (item) setSelectedItem(item)

    const items = getHistory()
    const existing = items.find(h => h.text === text)
    if (existing) {
      existing.count   += 1
      existing.lastUsed = Date.now()
    } else {
      items.push({ text, count: 1, lastUsed: Date.now() })
    }
    items.sort((a, b) => {
      const now = Date.now()
      const sA  = a.count * 2 + (now - a.lastUsed < 86_400_000 ? 5 : 0)
      const sB  = b.count * 2 + (now - b.lastUsed < 86_400_000 ? 5 : 0)
      return sB - sA
    })
    const updated = items.slice(0, MAX_HISTORY)
    saveHistory(updated)
    setHistory(updated)
  }, [])

  const clearSelection   = useCallback(() => setSelectedItem(null), [])
  const clearSuggestions = useCallback(() => setSuggestions([]), [])

  const searchAll = useCallback((q: string) => {
    return search(q, 20).map(r => r.item)
  }, [search])

  return {
    suggestions, history, isLoading, query, selectedItem,
    setQuery, selectItem, clearSelection, clearSuggestions, escapeRegex, searchAll,
  }
}
