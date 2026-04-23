import { useState, useEffect } from 'react'

export interface MunicipalityStats {
  municipio: string
  total_registros: number
  itens_unicos: number
  valor_total: number
  vu_mediana: number
  srp_pct: number
  categorias_n: number
  meses_ativos: number
  top_categorias: Array<{ categoria: string; n: number }>
}

export interface CategoryStats {
  categoria: string
  itens: number
  valor_total: number
  vu_mediana: number
  municipios: number
  srp_pct: number
}

export interface Overview {
  uf: string
  periodo: { inicio: string; fim: string }
  total_registros: number
  total_itens_unicos: number
  total_municipios: number
  total_valor: number
  srp_pct: number
  por_tipo: { M: number; S: number }
  por_categoria: CategoryStats[]
}

export interface AnomalyCounts {
  overpriced: Record<string, number>
  underpriced: Record<string, number>
}

interface ComparadorData {
  municipalities: MunicipalityStats[]
  overview: Overview | null
  anomalies: AnomalyCounts
  isLoading: boolean
}

let cache: ComparadorData | null = null

export function useComparadorData(): ComparadorData {
  const [data, setData] = useState<ComparadorData>(
    cache ?? { municipalities: [], overview: null, anomalies: { overpriced: {}, underpriced: {} }, isLoading: true }
  )

  useEffect(() => {
    if (cache) { setData(cache); return }

    Promise.all([
      fetch('/pncp-data/stats/by-municipality.json').then(r => r.json()),
      fetch('/pncp-data/stats/overview.json').then(r => r.json()),
      fetch('/pncp-data/anomalies/overpriced.json').then(r => r.json()),
    ]).then(([munis, ov, anom]: [MunicipalityStats[], Overview, {
      overpriced: Array<{ municipio: string }>,
      underpriced: Array<{ municipio: string }>
    }]) => {
      const overpriced: Record<string, number>  = {}
      const underpriced: Record<string, number> = {}
      anom.overpriced.forEach(a  => { overpriced[a.municipio]  = (overpriced[a.municipio]  || 0) + 1 })
      anom.underpriced.forEach(a => { underpriced[a.municipio] = (underpriced[a.municipio] || 0) + 1 })

      cache = { municipalities: munis, overview: ov, anomalies: { overpriced, underpriced }, isLoading: false }
      setData(cache)
    }).catch(() => {
      setData(d => ({ ...d, isLoading: false }))
    })
  }, [])

  return data
}
