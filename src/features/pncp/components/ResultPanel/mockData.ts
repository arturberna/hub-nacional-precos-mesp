import type { PncpIndexItem } from '../../types'

// ── Seeded pseudo-random (reproducible per item) ──────────────────────────────
function sr(seed: string, i: number): number {
  let h = (i + 1) * 2654435761
  for (let j = 0; j < seed.length; j++) h = Math.imul(h ^ seed.charCodeAt(j), 2654435761)
  return (h >>> 0) / 4294967295
}

// ── Reference data ────────────────────────────────────────────────────────────
const ORGANS = [
  { name: 'Prefeitura de São Paulo',         uf: 'SP' },
  { name: 'SEME Fortaleza',                   uf: 'CE' },
  { name: 'Secretaria de Esportes MG',        uf: 'MG' },
  { name: 'Prefeitura de Salvador',           uf: 'BA' },
  { name: 'Governo do Estado do RS',          uf: 'RS' },
  { name: 'SEME Curitiba',                    uf: 'PR' },
  { name: 'Prefeitura de Recife',             uf: 'PE' },
  { name: 'Secretaria de Esportes DF',        uf: 'DF' },
  { name: 'Prefeitura de Manaus',             uf: 'AM' },
  { name: 'Governo do Estado do CE',          uf: 'CE' },
  { name: 'SEME Belém',                       uf: 'PA' },
  { name: 'Prefeitura de Natal',              uf: 'RN' },
  { name: 'Secretaria Estadual de Esportes GO', uf: 'GO' },
  { name: 'Prefeitura de Maceió',             uf: 'AL' },
  { name: 'SEME Porto Alegre',                uf: 'RS' },
  { name: 'Prefeitura de Florianópolis',      uf: 'SC' },
  { name: 'Governo do Estado do PA',          uf: 'PA' },
  { name: 'Prefeitura de João Pessoa',        uf: 'PB' },
  { name: 'Secretaria de Esportes RJ',        uf: 'RJ' },
  { name: 'Prefeitura de Teresina',           uf: 'PI' },
]

export const ALL_MUNICIPALITIES = [
  { name: 'São Paulo',               uf: 'SP', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro',          uf: 'RJ', lat: -22.9068, lng: -43.1729 },
  { name: 'Belo Horizonte',          uf: 'MG', lat: -19.9167, lng: -43.9345 },
  { name: 'Salvador',                uf: 'BA', lat: -12.9714, lng: -38.5014 },
  { name: 'Fortaleza',               uf: 'CE', lat:  -3.7172, lng: -38.5437 },
  { name: 'Curitiba',                uf: 'PR', lat: -25.4278, lng: -49.2731 },
  { name: 'Manaus',                  uf: 'AM', lat:  -3.1190, lng: -60.0217 },
  { name: 'Recife',                  uf: 'PE', lat:  -8.0476, lng: -34.8770 },
  { name: 'Porto Alegre',            uf: 'RS', lat: -30.0346, lng: -51.2177 },
  { name: 'Belém',                   uf: 'PA', lat:  -1.4558, lng: -48.5044 },
  { name: 'Goiânia',                 uf: 'GO', lat: -16.6864, lng: -49.2643 },
  { name: 'São Luís',                uf: 'MA', lat:  -2.5297, lng: -44.3027 },
  { name: 'Maceió',                  uf: 'AL', lat:  -9.6658, lng: -35.7350 },
  { name: 'Natal',                   uf: 'RN', lat:  -5.7945, lng: -35.2110 },
  { name: 'Teresina',                uf: 'PI', lat:  -5.0892, lng: -42.8019 },
  { name: 'Campo Grande',            uf: 'MS', lat: -20.4697, lng: -54.6201 },
  { name: 'João Pessoa',             uf: 'PB', lat:  -7.1195, lng: -34.8450 },
  { name: 'Aracaju',                 uf: 'SE', lat: -10.9167, lng: -37.0500 },
  { name: 'Porto Velho',             uf: 'RO', lat:  -8.7612, lng: -63.9004 },
  { name: 'Cuiabá',                  uf: 'MT', lat: -15.5989, lng: -56.0949 },
  { name: 'Florianópolis',           uf: 'SC', lat: -27.5954, lng: -48.5480 },
  { name: 'Macapá',                  uf: 'AP', lat:   0.0349, lng: -51.0694 },
  { name: 'Rio Branco',              uf: 'AC', lat:  -9.9754, lng: -67.8249 },
  { name: 'Palmas',                  uf: 'TO', lat: -10.2491, lng: -48.3243 },
  { name: 'Boa Vista',               uf: 'RR', lat:   2.8235, lng: -60.6758 },
  { name: 'Vitória',                 uf: 'ES', lat: -20.3155, lng: -40.3128 },
  { name: 'Brasília',                uf: 'DF', lat: -15.7801, lng: -47.9292 },
  { name: 'Campinas',                uf: 'SP', lat: -22.9056, lng: -47.0608 },
  { name: 'Santos',                  uf: 'SP', lat: -23.9618, lng: -46.3322 },
  { name: 'Ribeirão Preto',          uf: 'SP', lat: -21.1775, lng: -47.8103 },
  { name: 'Uberlândia',              uf: 'MG', lat: -18.9186, lng: -48.2772 },
  { name: 'Joinville',               uf: 'SC', lat: -26.3044, lng: -48.8461 },
  { name: 'Londrina',                uf: 'PR', lat: -23.3045, lng: -51.1696 },
  { name: 'Feira de Santana',        uf: 'BA', lat: -12.2664, lng: -38.9663 },
  { name: 'Niterói',                 uf: 'RJ', lat: -22.8833, lng: -43.1036 },
  { name: 'São Bernardo do Campo',   uf: 'SP', lat: -23.6939, lng: -46.5650 },
  { name: 'Osasco',                  uf: 'SP', lat: -23.5329, lng: -46.7920 },
  { name: 'Contagem',                uf: 'MG', lat: -19.9319, lng: -44.0536 },
  { name: 'Sorocaba',                uf: 'SP', lat: -23.5015, lng: -47.4526 },
  { name: 'Aparecida de Goiânia',    uf: 'GO', lat: -16.8231, lng: -49.2461 },
]

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MockPurchase {
  date: string
  organ: string
  uf: string
  price: number
  qty: number
  process: string
}

export interface MockMunicipality {
  name: string
  uf: string
  lat: number
  lng: number
  price: number
  ocorrencias: number
}

// ── Generators ────────────────────────────────────────────────────────────────
export function generatePurchases(item: PncpIndexItem): MockPurchase[] {
  const count = Math.min(item.ocorrencias, 12)
  const now = Date.now()
  const results: MockPurchase[] = []

  for (let i = 0; i < count; i++) {
    const r1 = sr(item.id, i * 3)
    const r2 = sr(item.id, i * 3 + 1)
    const r3 = sr(item.id, i * 3 + 2)

    const daysBack = Math.floor((i / count) * 340 + r1 * 25)
    const date = new Date(now - daysBack * 86_400_000)
    const organ = ORGANS[Math.floor(r2 * ORGANS.length)]
    const priceFactor = 0.82 + r3 * 0.38

    results.push({
      date:    date.toISOString().slice(0, 10),
      organ:   organ.name,
      uf:      organ.uf,
      price:   Math.round(item.vu_mediana * priceFactor * 100) / 100,
      qty:     Math.ceil(r1 * 90 + 5),
      process: `PNCP-${date.getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    })
  }

  return results.sort((a, b) => b.date.localeCompare(a.date))
}

export function generateMunicipalities(item: PncpIndexItem): MockMunicipality[] {
  const count = Math.min(item.municipios_n, ALL_MUNICIPALITIES.length)
  // Deterministic shuffle via seeded random
  const shuffled = [...ALL_MUNICIPALITIES].sort((a, b) => {
    const sa = sr(item.id + a.name, 0)
    const sb = sr(item.id + b.name, 0)
    return sa - sb
  })

  return shuffled.slice(0, count).map((m, i) => {
    const priceFactor = 0.80 + sr(item.id + m.name, i + 1) * 0.42
    return {
      ...m,
      price:      Math.round(item.vu_mediana * priceFactor * 100) / 100,
      ocorrencias: Math.ceil(sr(item.id + m.name, i + 2) * 8 + 1),
    }
  })
}
