export interface StateData {
  name: string
  price: number
}

export type StateMap = Record<string, StateData>

export interface MapaStats {
  avg: number
  belowCount: number
  minEntry: [string, StateData]
  maxEntry: [string, StateData]
  minVar: string
  maxVar: string
}

export interface RankingEntry {
  uf: string
  data: StateData
  varPct: string
  isAbove: boolean
}
