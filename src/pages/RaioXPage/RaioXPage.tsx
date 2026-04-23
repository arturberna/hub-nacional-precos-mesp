import { useState, useMemo, useRef, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
  ComposedChart,
} from 'recharts'
import { useSearchParams } from 'react-router-dom'
import { useFuseSearch } from '@/features/pncp/hooks/useFuseSearch'
import { useItemDetail } from '@/features/pncp/hooks/useItemDetail'
import type { PncpIndexItem, ItemDetail, ItemOcorrencia } from '@/features/pncp/types'
import styles from './RaioXPage.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtBRLShort(v: number) {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (Math.abs(v) >= 1_000)     return `R$ ${(v / 1_000).toFixed(1).replace('.', ',')}k`
  return fmtBRL(v)
}
function fmtMes(mes: string) {
  const [y, m] = mes.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[+m - 1]}/${y.slice(2)}`
}

// ── Economy calculation ───────────────────────────────────────────────────────
interface MuniEconomy {
  municipio: string
  totalPago: number
  totalQtd: number
  poderiaPagar: number
  desperdicio: number   // + = overpaid, - = saved
  nCompras: number
  mediaPaga: number
}

function calcEconomy(detail: ItemDetail) {
  const mediana = detail.preco.mediana
  const byMuni = new Map<string, { totalPago: number; totalQtd: number; n: number }>()

  detail.ocorrencias.forEach(oc => {
    const entry = byMuni.get(oc.municipio) ?? { totalPago: 0, totalQtd: 0, n: 0 }
    entry.totalPago += oc.valor_unitario * oc.quantidade
    entry.totalQtd  += oc.quantidade
    entry.n         += 1
    byMuni.set(oc.municipio, entry)
  })

  const rankings: MuniEconomy[] = Array.from(byMuni.entries()).map(([municipio, s]) => ({
    municipio,
    totalPago:    s.totalPago,
    totalQtd:     s.totalQtd,
    poderiaPagar: mediana * s.totalQtd,
    desperdicio:  s.totalPago - mediana * s.totalQtd,
    nCompras:     s.n,
    mediaPaga:    s.totalPago / s.totalQtd,
  })).sort((a, b) => b.desperdicio - a.desperdicio)

  const totalPago       = rankings.reduce((s, r) => s + r.totalPago, 0)
  const poderiaPagar    = rankings.reduce((s, r) => s + r.poderiaPagar, 0)
  const totalDesperdicio = rankings.filter(r => r.desperdicio > 0).reduce((s, r) => s + r.desperdicio, 0)
  const totalEconomia   = rankings.filter(r => r.desperdicio < 0).reduce((s, r) => s + Math.abs(r.desperdicio), 0)

  return { rankings, totalPago, poderiaPagar, totalDesperdicio, totalEconomia, mediana }
}

// ── Spread buckets ────────────────────────────────────────────────────────────
function calcSpread(ocorrencias: ItemOcorrencia[], mediana: number) {
  const prices = ocorrencias
    .map(o => o.valor_unitario)
    .filter(p => p > 0 && p <= mediana * 8)

  if (prices.length < 2) return []
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const n   = Math.min(12, prices.length)
  const size = (max - min) / n || 1

  const buckets = Array.from({ length: n }, (_, i) => ({
    label: fmtBRL(min + size * i),
    centro: min + size * (i + 0.5),
    count: 0,
  }))
  prices.forEach(p => {
    const i = Math.min(Math.floor((p - min) / size), n - 1)
    buckets[i].count++
  })
  return buckets
}

// ── Tooltip components ────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tip}>
      {label && <p className={styles.tipLabel}>{label}</p>}
      {payload.filter(p => p.value !== undefined).map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#fff' }}>
          {p.name}: <strong>{fmtBRL(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Item search ───────────────────────────────────────────────────────────────
function ItemSearch({ onSelect }: { onSelect: (item: PncpIndexItem) => void }) {
  const { search, isReady } = useFuseSearch()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const results = useMemo(() => (q.length >= 2 ? search(q, 10) : []), [q, search])

  function pick(item: PncpIndexItem) {
    onSelect(item)
    setQ(item.nome)
    setOpen(false)
  }

  return (
    <div className={styles.searchWrap} ref={ref}>
      <div className={styles.searchBox}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={styles.searchInput}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={isReady ? 'Buscar item por nome ou categoria…' : 'Carregando índice…'}
          disabled={!isReady}
        />
        {q && (
          <button className={styles.clearQ} onClick={() => { setQ(''); setOpen(false) }}>×</button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map(r => (
            <li key={r.item.id} onMouseDown={() => pick(r.item)}>
              <div className={styles.srName}>{r.item.nome}</div>
              <div className={styles.srMeta}>
                <span className={`${styles.srTipo} ${r.item.tipo === 'M' ? styles.srMat : styles.srSvc}`}>
                  {r.item.tipo === 'M' ? 'Material' : 'Serviço'}
                </span>
                <span>{r.item.categoria}</span>
                <span className={styles.srPrice}>{fmtBRL(r.item.vu_mediana)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function RaioXPage() {
  const [searchParams] = useSearchParams()
  const urlId = searchParams.get('id')

  const [selectedItem, setSelectedItem] = useState<PncpIndexItem | null>(null)

  // itemId comes from the selected item OR from ?id= URL param (navigation from Alertas)
  const itemId = selectedItem?.id ?? urlId ?? null
  const { detail, isLoading, error } = useItemDetail(itemId)

  // When arriving via URL param, build a synthetic selectedItem from detail once loaded
  useEffect(() => {
    if (urlId && detail && !selectedItem) {
      setSelectedItem({
        id: detail.id,
        nome: detail.nome,
        categoria: detail.categoria,
        unidade: detail.unidade,
        tipo: detail.tipo,
        sneaelis: detail.sneaelis,
        ocorrencias: detail.ocorrencias.length,
        vu_mediana: detail.preco.mediana,
        municipios_n: detail.por_municipio.length,
      })
    }
  }, [urlId, detail, selectedItem])

  const economy = useMemo(() => detail ? calcEconomy(detail) : null, [detail])
  const spread  = useMemo(() => detail ? calcSpread(detail.ocorrencias, detail.preco.mediana) : [], [detail])

  const temporalData = useMemo(() =>
    detail?.serie_temporal.map(s => ({
      mes:     fmtMes(s.mes),
      Mediana: s.mediana,
      Mínimo:  s.min,
      Máximo:  s.max,
      n:       s.n,
    })) ?? [],
    [detail]
  )

  const hasData = !!detail && !!economy

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Raio-X do Item</h1>
          <p className={styles.sub}>Quem comprou, quando, por quanto — e quanto poderia ter economizado</p>
        </div>
      </div>

      {/* ── Search ── */}
      <ItemSearch onSelect={setSelectedItem} />

      {/* ── Empty state ── */}
      {!selectedItem && (
        <div className={styles.emptyState}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="11" /><line x1="11" y1="14" x2="11.01" y2="14" />
          </svg>
          <p>Busque um item acima para ver sua análise completa</p>
          <span>Experimente: "açúcar", "ajuda de custo", "pneu"</span>
        </div>
      )}

      {/* ── Loading ── */}
      {selectedItem && isLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          Analisando dados de <strong>{selectedItem.nome}</strong>…
        </div>
      )}

      {/* ── Error ── */}
      {selectedItem && error && !isLoading && (
        <div className={styles.errorState}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Detalhe não disponível para este item. Tente outro.
        </div>
      )}

      {/* ── Full analysis ── */}
      {hasData && (
        <>
          {/* ── Item identity ── */}
          <div className={styles.itemHeader}>
            <div className={styles.itemMeta}>
              <span className={`${styles.tipoBadge} ${detail.tipo === 'M' ? styles.tipoMat : styles.tipoSvc}`}>
                {detail.tipo === 'M' ? 'Material' : 'Serviço'}
              </span>
              <span className={styles.catBadge}>{detail.categoria}</span>
              {detail.sneaelis && <span className={styles.sneaelisBadge}>SNEAELIS</span>}
            </div>
            <h2 className={styles.itemName}>{detail.nome}</h2>
            <p className={styles.itemUnit}>Unidade: {detail.unidade}</p>
          </div>

          {/* ── KPI strip ── */}
          <div className={styles.kpiStrip}>
            {[
              { label: 'Mediana',    value: fmtBRL(detail.preco.mediana),                          color: 'var(--gold)' },
              { label: 'Mínimo',     value: fmtBRL(detail.preco.min),                              color: '#27AE60' },
              { label: 'Máximo',     value: fmtBRL(detail.preco.max),                              color: '#DC2626' },
              { label: 'Spread',     value: `${((detail.preco.max - detail.preco.min) / detail.preco.mediana * 100).toFixed(0)}%`, color: '#8898AA' },
              { label: 'Compras',    value: detail.preco.n.toLocaleString('pt-BR'),                 color: 'var(--blue-bright)' },
              { label: 'Municípios', value: detail.por_municipio.length.toLocaleString('pt-BR'),    color: 'var(--blue-bright)' },
            ].map(k => (
              <div key={k.label} className={styles.kpi}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <span className={styles.kpiValue} style={{ color: k.color }}>{k.value}</span>
              </div>
            ))}
          </div>

          {/* ══════════ WOW — ECONOMIA POTENCIAL ══════════ */}
          <div className={styles.economyHero}>
            <div className={styles.economyTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Economia Potencial
            </div>
            <p className={styles.economySubtitle}>
              O que aconteceria se todos os municípios tivessem pago a mediana nacional de{' '}
              <strong>{fmtBRL(detail.preco.mediana)}/{detail.unidade}</strong>
            </p>

            <div className={styles.economyNumbers}>
              <div className={styles.econNum}>
                <span className={styles.econLabel}>Total efetivamente pago</span>
                <span className={styles.econValue} style={{ color: '#E2E8F0' }}>
                  {fmtBRLShort(economy.totalPago)}
                </span>
              </div>
              <div className={styles.econArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
                </svg>
              </div>
              <div className={styles.econNum}>
                <span className={styles.econLabel}>Se pagassem a mediana</span>
                <span className={styles.econValue} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {fmtBRLShort(economy.poderiaPagar)}
                </span>
              </div>
              <div className={styles.econArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
                </svg>
              </div>
              <div className={styles.econNum}>
                <span className={styles.econLabel}>
                  {economy.totalDesperdicio > economy.totalEconomia ? '🔴 Perda líquida' : '🟢 Ganho líquido'}
                </span>
                <span
                  className={styles.econHighlight}
                  style={{ color: economy.totalDesperdicio > economy.totalEconomia ? '#FCA5A5' : '#86EFAC' }}
                >
                  {fmtBRLShort(Math.abs(economy.totalPago - economy.poderiaPagar))}
                </span>
              </div>
            </div>

            {/* Per-municipality bar chart */}
            {economy.rankings.length > 1 && (
              <div className={styles.economyChart}>
                <div className={styles.econChartTitle}>Desperdício (+) ou Economia (−) por município</div>
                <ResponsiveContainer width="100%" height={Math.max(160, economy.rankings.length * 36)}>
                  <BarChart
                    data={economy.rankings.map(r => ({ name: r.municipio, valor: r.desperdicio }))}
                    layout="vertical"
                    margin={{ top: 4, right: 80, bottom: 4, left: 120 }}
                  >
                    <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      type="number"
                      tickFormatter={v => fmtBRLShort(v)}
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 11 }}
                      width={116}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                      formatter={(v: number) => [fmtBRL(v), v > 0 ? 'Desperdício' : 'Economia']}
                      contentStyle={{ background: '#0D2952', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 700 }}
                      itemStyle={{ color: '#E2E8F0' }}
                    />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} maxBarSize={22}>
                      {economy.rankings.map(r => (
                        <Cell key={r.municipio} fill={r.desperdicio > 0 ? '#FCA5A5' : '#86EFAC'} fillOpacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Temporal + Spread ── */}
          <div className={styles.row2}>
            {/* Evolução temporal */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Evolução Temporal</h3>
              <p className={styles.cardSub}>Mediana mensal · min/máx registrados</p>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={temporalData} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="gradMed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F2C94C" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F2C94C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(13,41,82,0.07)" />
                  <XAxis dataKey="mes" tick={{ fill: '#8898AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => fmtBRLShort(v)}
                    tick={{ fill: '#8898AA', fontSize: 10 }}
                    axisLine={false} tickLine={false} width={60}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(74,144,217,0.2)', strokeWidth: 1 }} wrapperStyle={{ border: 'none', boxShadow: 'none' }} />
                  <Area
                    type="monotone"
                    dataKey="Máximo"
                    stroke="#DC2626"
                    strokeWidth={1.5}
                    fill="rgba(220,38,38,0.07)"
                    strokeDasharray="4 3"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="Mediana"
                    stroke="#F2C94C"
                    strokeWidth={2.5}
                    fill="url(#gradMed)"
                    dot={{ r: 3, fill: '#F2C94C', strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Mínimo"
                    stroke="#27AE60"
                    strokeWidth={1.5}
                    fill="rgba(39,174,96,0.07)"
                    strokeDasharray="4 3"
                    dot={false}
                  />
                  <ReferenceLine
                    y={detail.preco.mediana}
                    stroke="#F2C94C"
                    strokeOpacity={0.4}
                    strokeDasharray="6 4"
                    label={{ value: 'Mediana global', fill: '#F2C94C', fontSize: 10, position: 'insideTopRight' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Spread de preços */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Distribuição de Preços</h3>
              <p className={styles.cardSub}>Concentração das compras por faixa de preço</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={spread} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(13,41,82,0.07)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8898AA', fontSize: 9 }}
                    axisLine={false} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fill: '#8898AA', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    cursor={{ fill: 'rgba(74,144,217,0.07)' }}
                    formatter={(v: number) => [v, 'compras']}
                    contentStyle={{ background: '#0D2952', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <ReferenceLine
                    x={fmtBRL(detail.preco.mediana)}
                    stroke="#F2C94C"
                    strokeDasharray="4 3"
                    label={{ value: 'Mediana', fill: '#F2C94C', fontSize: 10 }}
                  />
                  <Bar dataKey="count" name="Compras" radius={[4, 4, 0, 0]}>
                    {spread.map((b, i) => (
                      <Cell
                        key={i}
                        fill={b.centro > detail.preco.mediana ? '#DC2626' : '#27AE60'}
                        fillOpacity={0.78}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className={styles.spreadLegend}>
                <span><span className={styles.dot} style={{ background: '#27AE60' }} />Abaixo ou na mediana</span>
                <span><span className={styles.dot} style={{ background: '#DC2626' }} />Acima da mediana</span>
              </div>
            </div>
          </div>

          {/* ── Tabela de compras ── */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Registro de Compras</h3>
            <p className={styles.cardSub}>
              {detail.ocorrencias.length} compra{detail.ocorrencias.length !== 1 ? 's' : ''} registrada{detail.ocorrencias.length !== 1 ? 's' : ''} ·
              ordenadas por valor unitário (maior primeiro)
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Município</th>
                    <th>Mês</th>
                    <th>Valor Unitário</th>
                    <th>vs Mediana</th>
                    <th>Qtd</th>
                    <th>Total Pago</th>
                    <th>Perda/Ganho</th>
                    <th>Modalidade</th>
                    <th>SRP</th>
                  </tr>
                </thead>
                <tbody>
                  {[...detail.ocorrencias]
                    .sort((a, b) => b.valor_unitario - a.valor_unitario)
                    .map((oc, i) => {
                      const delta      = oc.valor_unitario - detail.preco.mediana
                      const deltaPct   = (delta / detail.preco.mediana) * 100
                      const desperdicio = delta * oc.quantidade
                      const isOver     = delta > 0
                      return (
                        <tr key={i} className={isOver ? styles.rowOver : styles.rowUnder}>
                          <td className={styles.tdMuni}>{oc.municipio}</td>
                          <td>{fmtMes(oc.mes)}</td>
                          <td className={styles.tdPrice}>{fmtBRL(oc.valor_unitario)}</td>
                          <td>
                            <span
                              className={styles.deltaBadge}
                              style={{
                                background: isOver ? 'rgba(220,38,38,0.1)' : 'rgba(39,174,96,0.1)',
                                color: isOver ? '#DC2626' : '#27AE60',
                              }}
                            >
                              {isOver ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}%
                            </span>
                          </td>
                          <td>{oc.quantidade.toLocaleString('pt-BR')}</td>
                          <td>{fmtBRLShort(oc.valor_unitario * oc.quantidade)}</td>
                          <td className={styles.tdDesperdicio}>
                            <span style={{ color: isOver ? '#DC2626' : '#27AE60', fontWeight: 700 }}>
                              {isOver ? '+' : ''}{fmtBRLShort(desperdicio)}
                            </span>
                          </td>
                          <td className={styles.tdModal}>{oc.modalidade_nome}</td>
                          <td>{oc.srp ? <span className={styles.srpBadge}>SRP</span> : '—'}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Municipality detail ── */}
          {economy.rankings.length > 1 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Resumo por Município</h3>
              <p className={styles.cardSub}>Comparação individual vs mediana nacional de {fmtBRL(detail.preco.mediana)}/{detail.unidade}</p>
              <div className={styles.muniTable}>
                {economy.rankings.map((r, i) => (
                  <div key={r.municipio} className={`${styles.muniRow} ${i % 2 === 0 ? styles.muniRowEven : ''}`}>
                    <div className={styles.muniName}>{r.municipio}</div>
                    <div className={styles.muniStats}>
                      <span>{r.nCompras} compra{r.nCompras !== 1 ? 's' : ''}</span>
                      <span>{r.totalQtd.toLocaleString('pt-BR')} un.</span>
                      <span>Pago: <strong>{fmtBRL(r.mediaPaga)}/un</strong></span>
                      <span>Total: <strong>{fmtBRLShort(r.totalPago)}</strong></span>
                    </div>
                    <div className={styles.muniEcon}>
                      <span
                        className={styles.muniEconVal}
                        style={{ color: r.desperdicio > 0 ? '#DC2626' : '#27AE60' }}
                      >
                        {r.desperdicio > 0 ? '▲ Desperdiçou' : '▼ Economizou'}
                      </span>
                      <span
                        className={styles.muniEconNum}
                        style={{ color: r.desperdicio > 0 ? '#DC2626' : '#27AE60' }}
                      >
                        {fmtBRLShort(Math.abs(r.desperdicio))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
