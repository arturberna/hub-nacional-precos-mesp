export interface PncpItem {
  objetoCompra: string
  valorTotalEstimado: number | null
  orgaoEntidade: { razaoSocial: string; cnpj: string }
  dataPublicacaoInicio: string
  numeroControlePNCP: string
}

export interface PncpResponse {
  data: PncpItem[]
  totalRegistros: number
  totalPaginas: number
}

/** Estrutura real do public/pncp-data/items-index.json */
export interface PncpIndexItem {
  id: string
  nome: string
  categoria: string
  unidade: string
  tipo: 'M' | 'S'
  sneaelis: boolean
  ocorrencias: number
  vu_mediana: number
  municipios_n: number
}

/** Estrutura de public/pncp-data/items/{id}.json */
export interface ItemPreco {
  min: number
  p25: number
  mediana: number
  media: number
  p75: number
  p90: number
  max: number
  desvio: number
  n: number
}

export interface ItemSerieTemporal {
  mes: string        // "2025-04"
  mediana: number
  n: number
  min: number
  max: number
}

export interface ItemPorMunicipio {
  municipio: string
  mediana: number
  n: number
  min: number
  max: number
}

export interface ItemOcorrencia {
  mes: string
  municipio: string
  valor_unitario: number
  quantidade: number
  unidade: string
  srp: boolean
  modalidade_nome: string
  cnpj_orgao: string
  sequencial_compra: number
}

export interface ItemDetail {
  id: string
  nome: string
  categoria: string
  unidade: string
  tipo: 'M' | 'S'
  sneaelis: boolean
  preco: ItemPreco
  srp_pct: number
  serie_temporal: ItemSerieTemporal[]
  por_municipio: ItemPorMunicipio[]
  ocorrencias: ItemOcorrencia[]
}

export interface SearchSuggestion {
  text: string
  price: string
  orgao?: string
  item?: PncpIndexItem
}

export interface SearchHistoryItem {
  text: string
  count: number
  lastUsed: number
}
