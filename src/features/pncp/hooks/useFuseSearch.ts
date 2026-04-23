import Fuse from 'fuse.js'
import { useState, useEffect, useRef } from 'react'
import type { PncpIndexItem } from '../types'

// O arquivo é um array raiz — Fuse indexa `nome`, `categoria` e o slug `id`
let fuseInstance: Fuse<PncpIndexItem> | null = null
let loadPromise: Promise<void> | null = null

async function ensureLoaded() {
  if (fuseInstance) return
  if (!loadPromise) {
    loadPromise = fetch('/pncp-data/items-index.json')
      .then(r => r.json())
      .then((items: PncpIndexItem[]) => {
        fuseInstance = new Fuse(items, {
          keys: [
            { name: 'nome',      weight: 3 },
            { name: 'categoria', weight: 1.5 },
            { name: 'id',        weight: 1 },
          ],
          threshold: 0.35,
          includeScore: true,
          minMatchCharLength: 2,
          ignoreLocation: true,
        })
      })
      .catch(() => { loadPromise = null })
  }
  await loadPromise
}

// Pré-carrega em background no import do módulo
ensureLoaded()

export interface FuseSearchResult {
  item: PncpIndexItem
  score: number
}

export function useFuseSearch() {
  const [isReady, setIsReady] = useState(!!fuseInstance)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    if (!fuseInstance) {
      ensureLoaded().then(() => {
        if (mountedRef.current) setIsReady(true)
      })
    }
    return () => { mountedRef.current = false }
  }, [])

  function search(query: string, limit = 8): FuseSearchResult[] {
    if (!fuseInstance || !query.trim() || query.length < 2) return []
    try {
      return fuseInstance
        .search(query.trim(), { limit })
        .map(r => ({ item: r.item, score: r.score ?? 1 }))
    } catch {
      return []
    }
  }

  return { search, isReady }
}
