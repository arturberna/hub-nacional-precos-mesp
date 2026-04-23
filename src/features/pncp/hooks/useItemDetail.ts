import { useState, useEffect } from 'react'
import type { ItemDetail } from '../types'

const cache = new Map<string, ItemDetail>()

export function useItemDetail(itemId: string | null) {
  const [detail,    setDetail]    = useState<ItemDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) {
      setDetail(null)
      setError(null)
      return
    }

    if (cache.has(itemId)) {
      setDetail(cache.get(itemId)!)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    fetch(`/pncp-data/items/${itemId}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json() as Promise<ItemDetail>
      })
      .then(data => {
        cache.set(itemId, data)
        setDetail(data)
      })
      .catch(() => setError('Detalhe não disponível para este item.'))
      .finally(() => setIsLoading(false))
  }, [itemId])

  return { detail, isLoading, error }
}
