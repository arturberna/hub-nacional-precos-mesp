import { useMemo } from 'react'
import type { StateMap, MapaStats, RankingEntry } from '../types'

export const STATE_DATA: StateMap = {
  AC: { name: 'Acre',                  price: 198.50 },
  AL: { name: 'Alagoas',               price: 231.80 },
  AM: { name: 'Amazonas',              price: 278.40 },
  AP: { name: 'Amapá',                 price: 312.60 },
  BA: { name: 'Bahia',                 price: 235.90 },
  CE: { name: 'Ceará',                 price: 222.40 },
  DF: { name: 'Dist. Federal',         price: 289.50 },
  ES: { name: 'Espírito Santo',        price: 248.70 },
  GO: { name: 'Goiás',                 price: 238.20 },
  MA: { name: 'Maranhão',              price: 208.30 },
  MG: { name: 'Minas Gerais',          price: 252.60 },
  MS: { name: 'Mato Grosso do Sul',    price: 244.80 },
  MT: { name: 'Mato Grosso',           price: 241.30 },
  PA: { name: 'Pará',                  price: 225.60 },
  PB: { name: 'Paraíba',               price: 218.90 },
  PE: { name: 'Pernambuco',            price: 240.50 },
  PI: { name: 'Piauí',                 price: 212.70 },
  PR: { name: 'Paraná',                price: 258.40 },
  RJ: { name: 'Rio de Janeiro',        price: 318.90 },
  RN: { name: 'Rio Grande do Norte',   price: 228.40 },
  RO: { name: 'Rondônia',              price: 262.30 },
  RR: { name: 'Roraima',               price: 295.40 },
  RS: { name: 'Rio Grande do Sul',     price: 272.80 },
  SC: { name: 'Santa Catarina',        price: 265.20 },
  SE: { name: 'Sergipe',               price: 235.40 },
  SP: { name: 'São Paulo',             price: 305.80 },
  TO: { name: 'Tocantins',             price: 232.50 },
}

export function useMapaData() {
  const stats = useMemo<MapaStats>(() => {
    const entries = Object.entries(STATE_DATA) as [string, { name: string; price: number }][]
    const prices = entries.map(([, d]) => d.price)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const belowCount = entries.filter(([, d]) => d.price <= avg).length
    const minEntry = entries.reduce((a, b) => b[1].price < a[1].price ? b : a)
    const maxEntry = entries.reduce((a, b) => b[1].price > a[1].price ? b : a)
    const minVar = ((avg - minEntry[1].price) / avg * 100).toFixed(1)
    const maxVar = ((maxEntry[1].price - avg) / avg * 100).toFixed(1)

    return { avg, belowCount, minEntry, maxEntry, minVar, maxVar }
  }, [])

  const rankings = useMemo<{ above: RankingEntry[]; below: RankingEntry[] }>(() => {
    const { avg } = stats
    const entries = Object.entries(STATE_DATA) as [string, { name: string; price: number }][]

    const toEntry = (isAbove: boolean) => (([uf, data]: [string, { name: string; price: number }]): RankingEntry => ({
      uf,
      data,
      varPct: (Math.abs(data.price - avg) / avg * 100).toFixed(1),
      isAbove,
    }))

    const above = entries
      .filter(([, d]) => d.price > avg)
      .sort((a, b) => b[1].price - a[1].price)
      .slice(0, 6)
      .map(toEntry(true))

    const below = entries
      .filter(([, d]) => d.price <= avg)
      .sort((a, b) => a[1].price - b[1].price)
      .slice(0, 6)
      .map(toEntry(false))

    return { above, below }
  }, [stats])

  return { stats, rankings, stateData: STATE_DATA }
}
