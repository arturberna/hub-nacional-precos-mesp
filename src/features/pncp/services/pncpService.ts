import type { PncpResponse, SearchSuggestion } from '../types'

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao'

export async function fetchPNCP(query: string): Promise<SearchSuggestion[]> {
  const params = new URLSearchParams({
    dataInicial: '20250101',
    dataFinal: '20250131',
    codigoModalidadeContratacao: '5',
    pagina: '1',
    tamanhoPagina: '20',
  })

  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error('Erro na API PNCP')

  const data: PncpResponse = await res.json()

  return data.data
    .filter(item =>
      item.objetoCompra?.toLowerCase().includes(query.toLowerCase()),
    )
    .map(item => ({
      text: item.objetoCompra,
      price: item.valorTotalEstimado != null
        ? 'R$ ' + item.valorTotalEstimado.toFixed(2).replace('.', ',')
        : '—',
      orgao: item.orgaoEntidade?.razaoSocial ?? 'Órgão público',
    }))
}

/** Local fallback suggestions when PNCP returns nothing */
export const LOCAL_SUGGESTIONS: SearchSuggestion[] = [
  { text: 'Bola de futebol society (tamanho 5)', price: 'R$ 87,40 méd.' },
  { text: 'Bola de basquete oficial', price: 'R$ 142,00 méd.' },
  { text: 'Bola de vôlei de praia', price: 'R$ 95,80 méd.' },
  { text: 'Tênis esportivo adulto nº40', price: 'R$ 189,90 méd.' },
  { text: 'Uniforme esportivo infantil kit', price: 'R$ 42,60 méd.' },
  { text: 'Colchonete ginástica 1,80m', price: 'R$ 124,00 méd.' },
  { text: 'Rede de vôlei oficial', price: 'R$ 310,00 méd.' },
  { text: 'Raquete de tênis adulto', price: 'R$ 98,50 méd.' },
]
