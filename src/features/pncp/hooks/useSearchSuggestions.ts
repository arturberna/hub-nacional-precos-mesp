import { useState, useCallback, useRef } from 'react'
import { fetchPNCP, LOCAL_SUGGESTIONS } from '../services/pncpService'
import type { SearchSuggestion, SearchHistoryItem } from '../types'

const HISTORY_KEY = 'search_history_v1'
const MAX_HISTORY = 8
const DEBOUNCE_MS = 400

function getHistory(): SearchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveHistory(items: SearchHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function smartFilter(query: string): SearchSuggestion[] {
  const q = query.toLowerCase()
  return LOCAL_SUGGESTIONS
    .map(item => {
      const text = item.text.toLowerCase()
      let score = 0
      if (text.includes(q)) score += 3
      q.split(' ').forEach(word => { if (text.includes(word)) score += 2 })
      if (text.startsWith(q)) score += 4
      return { ...item, score }
    })
    .filter(i => (i as { score: number } & SearchSuggestion).score > 0)
    .sort((a, b) =>
      (b as { score: number } & SearchSuggestion).score -
      (a as { score: number } & SearchSuggestion).score,
    )
}

export interface UseSearchSuggestionsReturn {
  suggestions: SearchSuggestion[]
  history: SearchHistoryItem[]
  isLoading: boolean
  query: string
  setQuery: (v: string) => void
  selectItem: (text: string) => void
  clearSuggestions: () => void
  escapeRegex: (text: string) => string
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [query, setQueryState] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [history, setHistory] = useState<SearchHistoryItem[]>(getHistory)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setQuery = useCallback((val: string) => {
    setQueryState(val)

    if (timerRef.current) clearTimeout(timerRef.current)

    if (val.length === 0) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    if (val.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    timerRef.current = setTimeout(async () => {
      try {
        const apiResults = await fetchPNCP(val)
        if (apiResults.length > 0) {
          setSuggestions(apiResults)
        } else {
          setSuggestions(smartFilter(val).slice(0, 6))
        }
      } catch {
        setSuggestions(smartFilter(val).slice(0, 6))
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  const selectItem = useCallback((text: string) => {
    setQueryState(text)
    setSuggestions([])

    const items = getHistory()
    const existing = items.find(h => h.text === text)
    if (existing) {
      existing.count += 1
      existing.lastUsed = Date.now()
    } else {
      items.push({ text, count: 1, lastUsed: Date.now() })
    }
    items.sort((a, b) => {
      const now = Date.now()
      const scoreA = a.count * 2 + (now - a.lastUsed < 86_400_000 ? 5 : 0)
      const scoreB = b.count * 2 + (now - b.lastUsed < 86_400_000 ? 5 : 0)
      return scoreB - scoreA
    })
    const updated = items.slice(0, MAX_HISTORY)
    saveHistory(updated)
    setHistory(updated)
  }, [])

  const clearSuggestions = useCallback(() => setSuggestions([]), [])

  return { suggestions, history, isLoading, query, setQuery, selectItem, clearSuggestions, escapeRegex }
}
