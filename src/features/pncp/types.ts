export interface PncpItem {
  objetoCompra: string
  valorTotalEstimado: number | null
  orgaoEntidade: {
    razaoSocial: string
    cnpj: string
  }
  dataPublicacaoInicio: string
  numeroControlePNCP: string
}

export interface PncpResponse {
  data: PncpItem[]
  totalRegistros: number
  totalPaginas: number
}

export interface SearchSuggestion {
  text: string
  price: string
  orgao?: string
}

export interface SearchHistoryItem {
  text: string
  count: number
  lastUsed: number
}
