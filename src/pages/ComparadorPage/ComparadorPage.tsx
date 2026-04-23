import { useState, useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell,
} from 'recharts'
import { useComparadorData } from '@/features/comparador/hooks/useComparadorData'
import type { MunicipalityStats } from '@/features/comparador/hooks/useComparadorData'
import styles from './ComparadorPage.module.css'

// ── Cores por slot de município ───────────────────────────────────────────────
const COLORS = ['#2F6FB2', '#F2A52B', '#27AE60'] as const
const COLORS_BG = ['rgba(47,111,178,0.1)', 'rgba(242,165,43,0.1)', 'rgba(39,174,96,0.1)'] as const

const MAX_SLOTS = 3

function fmtBRL(v: number) {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(1)}bi`
  if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)         return `R$ ${(v / 1_000).toFixed(0)}k`
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtBRLFull(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Custom radar tooltip ──────────────────────────────────────────────────────
function RadarTip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; color: string }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tip}>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value.toFixed(1)}</strong>
        </div>
      ))}
    </div>
  )
}

function BarTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tip}>
      <p className={styles.tipLabel}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{Number(p.value).toLocaleString('pt-BR')}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Municipality selector ─────────────────────────────────────────────────────
function MuniSelector({
  index, value, options, color, onChange, onRemove, canRemove,
}: {
  index: number
  value: string
  options: MunicipalityStats[]
  color: string
  onChange: (v: string) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)

  const filtered = useMemo(() =>
    options
      .filter(m => m.municipio.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 8),
    [options, search]
  )

  const selected = options.find(m => m.municipio === value)

  function pick(municipio: string) {
    onChange(municipio)
    setSearch('')
    setOpen(false)
  }

  return (
    <div className={styles.selectorWrap} style={{ '--accent': color } as React.CSSProperties}>
      <div className={styles.selectorLabel} style={{ color }}>
        <span className={styles.selectorDot} style={{ background: color }} />
        Município {index + 1}
        {canRemove && (
          <button className={styles.removeBtn} onClick={onRemove} title="Remover">×</button>
        )}
      </div>

      <div className={styles.selectorBox}>
        <input
          className={styles.selectorInput}
          placeholder={selected ? selected.municipio : 'Buscar município…'}
          value={open ? search : (selected?.municipio ?? '')}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{ borderColor: selected ? color : undefined }}
        />
        {open && filtered.length > 0 && (
          <ul className={styles.selectorDropdown}>
            {filtered.map(m => (
              <li
                key={m.municipio}
                className={`${styles.selectorOption} ${m.municipio === value ? styles.selected : ''}`}
                onMouseDown={() => pick(m.municipio)}
              >
                <span>{m.municipio}</span>
                <span className={styles.optionMeta}>{m.total_registros.toLocaleString('pt-BR')} reg.</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ComparadorPage() {
  const { municipalities, overview, anomalies, isLoading } = useComparadorData()
  const [slots, setSlots] = useState<string[]>(['', ''])

  const selected = useMemo(() =>
    slots
      .map(s => municipalities.find(m => m.municipio === s))
      .filter((m): m is MunicipalityStats => m !== undefined),
    [slots, municipalities]
  )

  const ready = selected.length >= 2

  // ── Category comparison data ──────────────────────────────────────────────
  const categoryData = useMemo(() => {
    if (!ready || !overview) return []

    // Union of categories across selected municipalities
    const catSet = new Set<string>()
    selected.forEach(m => m.top_categorias.forEach(c => catSet.add(c.categoria)))
    const cats = [...catSet].filter(c => c !== 'Outros') // exclude generic "Outros"

    const globalMedianas: Record<string, number> = {}
    overview.por_categoria.forEach(c => { globalMedianas[c.categoria] = c.vu_mediana })

    return cats.map(cat => {
      const entry: Record<string, number | string> = { categoria: cat.length > 22 ? cat.slice(0, 22) + '…' : cat }
      selected.forEach((m, i) => {
        const found = m.top_categorias.find(c => c.categoria === cat)
        const n = found?.n ?? 0
        entry[m.municipio] = n
        // Estimated spend using global vu_mediana for that category
        const mediana = globalMedianas[cat] ?? 100
        entry[`${m.municipio}_spend`] = Math.round(n * mediana)
      })
      return entry
    })
  }, [selected, overview, ready])

  // ── Radar data (normalized 0-100) ─────────────────────────────────────────
  const radarData = useMemo(() => {
    if (!ready) return []
    const allValores   = municipalities.map(m => m.valor_total)
    const allRegistros = municipalities.map(m => m.total_registros)
    const allItens     = municipalities.map(m => m.itens_unicos)
    const maxValor     = Math.max(...allValores)
    const maxRegistros = Math.max(...allRegistros)
    const maxItens     = Math.max(...allItens)

    const axes = [
      {
        metric: 'Volume Gasto',
        ...Object.fromEntries(selected.map(m => [m.municipio, Math.round((m.valor_total / maxValor) * 100)])),
      },
      {
        metric: 'Nº Compras',
        ...Object.fromEntries(selected.map(m => [m.municipio, Math.round((m.total_registros / maxRegistros) * 100)])),
      },
      {
        metric: 'Itens Únicos',
        ...Object.fromEntries(selected.map(m => [m.municipio, Math.round((m.itens_unicos / maxItens) * 100)])),
      },
      {
        metric: 'Uso de SRP',
        ...Object.fromEntries(selected.map(m => [m.municipio, Math.round(m.srp_pct)])),
      },
      {
        metric: 'Meses Ativos',
        ...Object.fromEntries(selected.map(m => [m.municipio, Math.round((m.meses_ativos / 12) * 100)])),
      },
      {
        metric: 'Categorias',
        ...Object.fromEntries(selected.map(m => [m.municipio, Math.round((m.categorias_n / 20) * 100)])),
      },
    ]
    return axes
  }, [selected, municipalities, ready])

  // ── Anomaly data ──────────────────────────────────────────────────────────
  const anomalyData = useMemo(() =>
    selected.map((m, i) => ({
      municipio: m.municipio,
      color: COLORS[i],
      overpriced:  anomalies.overpriced[m.municipio]  ?? 0,
      underpriced: anomalies.underpriced[m.municipio] ?? 0,
    })),
    [selected, anomalies]
  )

  function updateSlot(i: number, v: string) {
    setSlots(prev => { const next = [...prev]; next[i] = v; return next })
  }

  function addSlot() {
    if (slots.length < MAX_SLOTS) setSlots(prev => [...prev, ''])
  }

  function removeSlot(i: number) {
    setSlots(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Volume Total',   fmt: (m: MunicipalityStats) => fmtBRL(m.valor_total),     sub: 'em licitações' },
    { label: 'Mediana Unitária', fmt: (m: MunicipalityStats) => fmtBRLFull(m.vu_mediana), sub: 'valor unitário' },
    { label: 'Compras',        fmt: (m: MunicipalityStats) => m.total_registros.toLocaleString('pt-BR'), sub: 'registros' },
    { label: 'Itens Únicos',   fmt: (m: MunicipalityStats) => m.itens_unicos.toLocaleString('pt-BR'),    sub: 'itens distintos' },
    { label: '% SRP',          fmt: (m: MunicipalityStats) => `${m.srp_pct.toFixed(1)}%`, sub: 'Sistema Registro de Preços' },
    { label: 'Meses Ativos',   fmt: (m: MunicipalityStats) => `${m.meses_ativos}/12`,      sub: 'meses com compras' },
  ]

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Comparador de Municípios</h1>
          <p className={styles.sub}>
            Selecione 2 ou 3 municípios para revelar disparidades nos padrões de compra
          </p>
        </div>
      </div>

      {/* ── Selector row ── */}
      <div className={styles.selectorRow}>
        {slots.map((slot, i) => (
          <MuniSelector
            key={i}
            index={i}
            value={slot}
            options={municipalities.filter(m => !slots.some((s, j) => j !== i && s === m.municipio))}
            color={COLORS[i]}
            onChange={v => updateSlot(i, v)}
            onRemove={() => removeSlot(i)}
            canRemove={slots.length > 2 && i === slots.length - 1}
          />
        ))}

        {slots.length < MAX_SLOTS && (
          <button className={styles.addBtn} onClick={addSlot}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar município
          </button>
        )}
      </div>

      {isLoading && (
        <div className={styles.loadingMsg}>
          <div className={styles.spinner} /> Carregando dados…
        </div>
      )}

      {!isLoading && !ready && (
        <div className={styles.emptyState}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <p>Selecione pelo menos 2 municípios para iniciar a comparação</p>
        </div>
      )}

      {ready && (
        <>
          {/* ── KPI comparison ── */}
          <div className={styles.kpiSection}>
            <h2 className={styles.sectionTitle}>Visão Geral</h2>
            <div className={styles.kpiGrid}>
              {kpis.map(kpi => (
                <div key={kpi.label} className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>{kpi.label}</div>
                  <div className={styles.kpiSub}>{kpi.sub}</div>
                  <div className={styles.kpiValues}>
                    {selected.map((m, i) => {
                      const raw = kpi.label === 'Volume Total' ? m.valor_total :
                                  kpi.label === 'Mediana Unitária' ? m.vu_mediana :
                                  kpi.label === 'Compras' ? m.total_registros :
                                  kpi.label === 'Itens Únicos' ? m.itens_unicos :
                                  kpi.label === '% SRP' ? m.srp_pct :
                                  m.meses_ativos
                      const allRaws = selected.map(s =>
                        kpi.label === 'Volume Total' ? s.valor_total :
                        kpi.label === 'Mediana Unitária' ? s.vu_mediana :
                        kpi.label === 'Compras' ? s.total_registros :
                        kpi.label === 'Itens Únicos' ? s.itens_unicos :
                        kpi.label === '% SRP' ? s.srp_pct :
                        s.meses_ativos
                      )
                      const maxRaw = Math.max(...allRaws)
                      const pct = maxRaw > 0 ? (raw / maxRaw) * 100 : 0
                      return (
                        <div key={m.municipio} className={styles.kpiRow}>
                          <span className={styles.kpiMuni} style={{ color: COLORS[i] }}>
                            {m.municipio}
                          </span>
                          <div className={styles.kpiBarWrap}>
                            <div
                              className={styles.kpiBar}
                              style={{ width: `${pct}%`, background: COLORS[i] }}
                            />
                          </div>
                          <span className={styles.kpiVal}>{kpi.fmt(m)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Radar chart ── */}
          <div className={styles.row}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Perfil Comparativo</h2>
              <p className={styles.cardSub}>Índices normalizados em relação ao máximo entre os 143 municípios do estado</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                  <PolarGrid stroke="rgba(13,41,82,0.1)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                  />
                  {selected.map((m, i) => (
                    <Radar
                      key={m.municipio}
                      name={m.municipio}
                      dataKey={m.municipio}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ r: 3, fill: COLORS[i] }}
                    />
                  ))}
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => <span style={{ color: '#6B7280', fontSize: 12 }}>{v}</span>}
                  />
                  <Tooltip content={<RadarTip />} wrapperStyle={{ border: 'none', boxShadow: 'none' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Anomalias */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Alertas de Anomalia</h2>
              <p className={styles.cardSub}>Itens com preço fora do padrão detectados pelo modelo IQR</p>
              <div className={styles.anomalyList}>
                {anomalyData.map(a => (
                  <div key={a.municipio} className={styles.anomalyItem}>
                    <div className={styles.anomalyMuni} style={{ color: a.color }}>{a.municipio}</div>
                    <div className={styles.anomalyStats}>
                      <div className={styles.anomalyStat}>
                        <span className={styles.anomalyCount} style={{ color: '#DC2626' }}>{a.overpriced}</span>
                        <span className={styles.anomalyStatLabel}>sobrepreço</span>
                      </div>
                      <div className={styles.anomalyStat}>
                        <span className={styles.anomalyCount} style={{ color: '#2F6FB2' }}>{a.underpriced}</span>
                        <span className={styles.anomalyStatLabel}>subpreço</span>
                      </div>
                      <div className={styles.anomalyBar}>
                        <div
                          title="Sobrepreço"
                          style={{
                            width: `${Math.min(a.overpriced * 8, 100)}%`,
                            background: '#DC2626',
                            height: '100%',
                            borderRadius: '99px 0 0 99px',
                          }}
                        />
                        <div
                          title="Subpreço"
                          style={{
                            width: `${Math.min(a.underpriced * 8, 100)}%`,
                            background: '#2F6FB2',
                            height: '100%',
                            borderRadius: '0 99px 99px 0',
                            marginLeft: 2,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Category comparison ── */}
          {categoryData.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Categorias em Comum</h2>
              <p className={styles.cardSub}>
                Nº de registros de compra por categoria · categorias presentes em ao menos um dos municípios selecionados
              </p>
              <ResponsiveContainer width="100%" height={Math.max(260, categoryData.length * 48)}>
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 4, right: 60, bottom: 4, left: 180 }}
                >
                  <CartesianGrid horizontal={false} stroke="rgba(13,41,82,0.07)" />
                  <XAxis
                    type="number"
                    tick={{ fill: '#8898AA', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoria"
                    tick={{ fill: '#4B5563', fontSize: 11 }}
                    width={176}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(13,41,82,0.04)' }} wrapperStyle={{ border: 'none', boxShadow: 'none' }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => <span style={{ color: '#6B7280', fontSize: 12 }}>{v}</span>}
                  />
                  {selected.map((m, i) => (
                    <Bar
                      key={m.municipio}
                      dataKey={m.municipio}
                      name={m.municipio}
                      fill={COLORS[i]}
                      fillOpacity={0.82}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Detailed comparison table ── */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Tabela Detalhada</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    {selected.map((m, i) => (
                      <th key={m.municipio} style={{ color: COLORS[i] }}>{m.municipio}</th>
                    ))}
                    {selected.length === 2 && <th>Diferença</th>}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Volume total',       values: selected.map(m => fmtBRL(m.valor_total)),                       raws: selected.map(m => m.valor_total) },
                    { label: 'Mediana unit.',      values: selected.map(m => fmtBRLFull(m.vu_mediana)),                    raws: selected.map(m => m.vu_mediana) },
                    { label: 'Total de compras',   values: selected.map(m => m.total_registros.toLocaleString('pt-BR')),   raws: selected.map(m => m.total_registros) },
                    { label: 'Itens únicos',       values: selected.map(m => m.itens_unicos.toLocaleString('pt-BR')),      raws: selected.map(m => m.itens_unicos) },
                    { label: 'Uso de SRP',         values: selected.map(m => `${m.srp_pct.toFixed(1)}%`),                 raws: selected.map(m => m.srp_pct) },
                    { label: 'Meses ativos',       values: selected.map(m => `${m.meses_ativos}`),                         raws: selected.map(m => m.meses_ativos) },
                    { label: 'Categorias ativas',  values: selected.map(m => `${m.categorias_n}`),                         raws: selected.map(m => m.categorias_n) },
                    { label: 'Sobrepreços',        values: anomalyData.map(a => String(a.overpriced)),                     raws: anomalyData.map(a => a.overpriced) },
                    { label: 'Subpreços',          values: anomalyData.map(a => String(a.underpriced)),                    raws: anomalyData.map(a => a.underpriced) },
                  ].map(row => {
                    const maxRaw   = Math.max(...row.raws)
                    const winner   = row.raws.indexOf(maxRaw)
                    const diffPct  = selected.length === 2 && row.raws[1] > 0
                      ? `${row.raws[0] > row.raws[1] ? '+' : ''}${(((row.raws[0] - row.raws[1]) / row.raws[1]) * 100).toFixed(1)}%`
                      : '—'
                    return (
                      <tr key={row.label}>
                        <td className={styles.rowLabel}>{row.label}</td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={`${styles.rowVal} ${i === winner ? styles.rowWinner : ''}`}
                            style={i === winner ? { color: COLORS[i] } : undefined}
                          >
                            {v}
                          </td>
                        ))}
                        {selected.length === 2 && (
                          <td className={`${styles.rowDiff} ${
                            row.raws[0] > row.raws[1] ? styles.diffPos : styles.diffNeg
                          }`}>
                            {diffPct}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.footnote}>
              Dados referentes ao período {overview?.periodo.inicio} – {overview?.periodo.fim} · UF: {overview?.uf}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
