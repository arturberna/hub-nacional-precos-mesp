import { useState, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import {
  ExclamationOctagonFill,
  ExclamationTriangleFill,
  ArrowUpCircleFill,
  BellFill,
  DashCircleFill,
} from 'react-bootstrap-icons'
import styles from './AlertasPage.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────
interface RawAlert {
  item_id: string
  nome: string
  categoria: string
  sneaelis: boolean
  municipio: string
  mes: string
  valor_unitario: number
  mediana_grupo: number
  ratio: number
  n_grupo: number
  tipo: 'overpriced' | 'underpriced'
  srp: boolean
  metodo: string
}

type Severity = 'critico' | 'grave' | 'anomalo' | 'alerta' | 'zero'

interface Alert extends RawAlert {
  severity: Severity
  uid: string
}

interface AnomaliesFile {
  total_overpriced: number
  total_underpriced: number
  parametros: { iqr_fator: number; ratio_anomalia: number; min_grupo_iqr: number }
  overpriced:  RawAlert[]
  underpriced: RawAlert[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  if (v === 0) return 'R$ 0,00'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtBRLShort(v: number) {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (Math.abs(v) >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}k`
  return fmtBRL(v)
}
function fmtMes(mes: string) {
  const [y, m] = mes.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[+m - 1]}/${y}`
}
function truncate(s: string, n = 70) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

function classifySeverity(r: RawAlert): Severity {
  if (r.tipo === 'underpriced') {
    return r.valor_unitario === 0 ? 'zero' : 'alerta'
  }
  if (r.ratio > 100) return 'critico'
  if (r.ratio >  20) return 'grave'
  return 'anomalo'
}

const SEV_ORDER: Record<Severity, number> = { critico: 0, grave: 1, anomalo: 2, alerta: 3, zero: 4 }

const SEV_META: Record<Severity, { label: string; color: string; bg: string; icon: ReactNode; criteria: string }> = {
  critico: {
    label:    'CRÍTICO',
    color:    '#DC2626',
    bg:       'rgba(220,38,38,0.1)',
    icon:     <ExclamationOctagonFill size={11} />,
    criteria: 'Preço mais de 100× acima da mediana do grupo. Risco extremo — possível fraude, erro grave ou divergência de unidade de medida.',
  },
  grave: {
    label:    'GRAVE',
    color:    '#EA580C',
    bg:       'rgba(234,88,12,0.1)',
    icon:     <ExclamationTriangleFill size={11} />,
    criteria: 'Preço entre 20× e 100× acima da mediana do grupo (método IQR, fator 1,5). Requer investigação e justificativa formal.',
  },
  anomalo: {
    label:    'ANÔMALO',
    color:    '#CA8A04',
    bg:       'rgba(202,138,4,0.1)',
    icon:     <ArrowUpCircleFill size={11} />,
    criteria: 'Preço entre 10× e 20× acima da mediana do grupo (método IQR, fator 1,5). Fora do padrão esperado — verificação recomendada.',
  },
  alerta: {
    label:    'ALERTA',
    color:    '#2563EB',
    bg:       'rgba(37,99,235,0.1)',
    icon:     <BellFill size={11} />,
    criteria: 'Subpreço detectado. Valor registrado abaixo da mediana do grupo. Pode indicar erro de digitação, unidade divergente ou fornecedor diferenciado.',
  },
  zero: {
    label:    'PREÇO ZERO',
    color:    '#7C3AED',
    bg:       'rgba(124,58,237,0.1)',
    icon:     <DashCircleFill size={11} />,
    criteria: 'Item registrado com valor R$ 0,00. Dado inválido ou gratuidade não documentada. Verificação obrigatória.',
  },
}

function buildNarrative(a: Alert): string {
  const nome = truncate(a.nome, 65)
  if (a.tipo === 'overpriced') {
    const ratio = a.ratio >= 1_000_000
      ? `${(a.ratio / 1_000_000).toFixed(0)}M×`
      : a.ratio >= 1_000
      ? `${(a.ratio / 1_000).toFixed(0)}k×`
      : `${a.ratio.toFixed(0)}×`
    return `${a.municipio} comprou "${nome}" por ${fmtBRL(a.valor_unitario)} — ${ratio} acima da mediana de ${fmtBRL(a.mediana_grupo)} em ${fmtMes(a.mes)}`
  }
  if (a.valor_unitario === 0) {
    return `${a.municipio} registrou preço R$ 0,00 para "${nome}" — mediana do grupo é ${fmtBRL(a.mediana_grupo)} (${a.n_grupo} registros) em ${fmtMes(a.mes)}`
  }
  const pct = (a.ratio * 100).toFixed(0)
  return `${a.municipio} comprou "${nome}" por ${fmtBRL(a.valor_unitario)} — apenas ${pct}% da mediana de ${fmtBRL(a.mediana_grupo)} em ${fmtMes(a.mes)}`
}

// ── Data hook ─────────────────────────────────────────────────────────────────
let _cache: Alert[] | null = null
let _file: AnomaliesFile | null = null

function useAlertsData() {
  const [alerts, setAlerts] = useState<Alert[]>(_cache ?? [])
  const [file,   setFile]   = useState<AnomaliesFile | null>(_file)
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    if (_cache) return
    fetch('/pncp-data/anomalies/overpriced.json')
      .then(r => r.json())
      .then((data: AnomaliesFile) => {
        _file = data
        const all: Alert[] = [
          ...data.overpriced,
          ...data.underpriced,
        ].map((r, i) => ({ ...r, severity: classifySeverity(r), uid: `${r.tipo}-${i}` }))
         .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || b.ratio - a.ratio)
        _cache = all
        setAlerts(all)
        setFile(data)
        setLoading(false)
      })
  }, [])

  return { alerts, file, loading }
}

// ── Alert card ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onRaioX }: { alert: Alert; onRaioX: (id: string) => void }) {
  const sev = SEV_META[alert.severity]

  return (
    <div
      className={styles.card}
      style={{ borderLeftColor: sev.color }}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardBadges}>
          <span className={styles.sevBadgeWrap}>
            <span className={styles.sevBadge} style={{ background: sev.bg, color: sev.color }}>
              {sev.icon} {sev.label}
            </span>
            <span className={styles.sevTooltipBox}>
              <strong style={{ display: 'block', marginBottom: 4, color: '#fff' }}>{sev.label}</strong>
              {sev.criteria}
            </span>
          </span>
          <span className={styles.catBadge}>{alert.categoria}</span>
          {alert.srp && <span className={styles.srpBadge}>SRP</span>}
          {alert.sneaelis && <span className={styles.sneaBadge}>SNEAELIS</span>}
        </div>

        <button
          className={styles.raioXBtn}
          onClick={() => onRaioX(alert.item_id)}
          title="Ver Raio-X do item"
        >
          Ver Raio-X →
        </button>
      </div>

      <p className={styles.cardNarrative}>{buildNarrative(alert)}</p>

      <div className={styles.cardFooter}>
        {alert.tipo === 'overpriced' && (
          <span className={styles.footerItem} style={{ color: sev.color }}>
            Ratio: <strong>{alert.ratio >= 1000 ? `${(alert.ratio/1000).toFixed(0)}k×` : `${alert.ratio.toFixed(0)}×`}</strong>
          </span>
        )}
        <span className={styles.footerItem}>
          Grupo: <strong>{alert.n_grupo} registros</strong>
        </span>
        <span className={styles.footerItem}>
          Método: <strong>{alert.metodo.toUpperCase()}</strong>
        </span>
        <span className={styles.footerItem} style={{ marginLeft: 'auto', color: '#9CA3AF' }}>
          {fmtMes(alert.mes)} · {alert.municipio}
        </span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 30

export function AlertasPage() {
  const { alerts, file, loading } = useAlertsData()
  const navigate = useNavigate()

  const [filterTipo,  setFilterTipo]  = useState<'all' | 'overpriced' | 'underpriced'>('all')
  const [filterSev,   setFilterSev]   = useState<'all' | Severity>('all')
  const [filterCat,   setFilterCat]   = useState('all')
  const [filterMuni,  setFilterMuni]  = useState('all')
  const [filterSRP,   setFilterSRP]   = useState(false)
  const [page,        setPage]        = useState(1)

  // Derived filters
  const categories = useMemo(() =>
    ['all', ...new Set(alerts.map(a => a.categoria))].filter(Boolean),
    [alerts]
  )
  const municipalities = useMemo(() =>
    ['all', ...new Set(alerts.map(a => a.municipio))].filter(Boolean),
    [alerts]
  )

  const filtered = useMemo(() => {
    let list = alerts
    if (filterTipo !== 'all')   list = list.filter(a => a.tipo === filterTipo)
    if (filterSev  !== 'all')   list = list.filter(a => a.severity === filterSev)
    if (filterCat  !== 'all')   list = list.filter(a => a.categoria === filterCat)
    if (filterMuni !== 'all')   list = list.filter(a => a.municipio === filterMuni)
    if (filterSRP)              list = list.filter(a => a.srp)
    return list
  }, [alerts, filterTipo, filterSev, filterCat, filterMuni, filterSRP])

  const visible = filtered.slice(0, page * PAGE_SIZE)

  // Chart data
  const byCat = useMemo(() => {
    const m: Record<string, number> = {}
    alerts.filter(a => a.tipo === 'overpriced').forEach(a => { m[a.categoria] = (m[a.categoria] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([cat, n]) => ({ cat: cat.length > 20 ? cat.slice(0, 20) + '…' : cat, n }))
  }, [alerts])

  const byMuni = useMemo(() => {
    const m: Record<string, number> = {}
    alerts.filter(a => a.tipo === 'overpriced').forEach(a => { m[a.municipio] = (m[a.municipio] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([muni, n]) => ({ muni, n }))
  }, [alerts])

  const byMes = useMemo(() => {
    const m: Record<string, { over: number; under: number }> = {}
    alerts.forEach(a => {
      if (!m[a.mes]) m[a.mes] = { over: 0, under: 0 }
      if (a.tipo === 'overpriced') m[a.mes].over++
      else m[a.mes].under++
    })
    return Object.entries(m).sort().map(([mes, v]) => ({
      mes: fmtMes(mes), ...v,
    }))
  }, [alerts])

  const sevCounts = useMemo(() => {
    const c: Record<string, number> = {}
    alerts.forEach(a => { c[a.severity] = (c[a.severity] || 0) + 1 })
    return c
  }, [alerts])

  function handleRaioX(itemId: string) {
    navigate(`/raio-x?id=${encodeURIComponent(itemId)}`)
  }

  function resetFilters() {
    setFilterTipo('all')
    setFilterSev('all')
    setFilterCat('all')
    setFilterMuni('all')
    setFilterSRP(false)
    setPage(1)
  }

  const hasFilters = filterTipo !== 'all' || filterSev !== 'all' || filterCat !== 'all' || filterMuni !== 'all' || filterSRP

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alertas de Anomalia</h1>
          <p className={styles.sub}>
            Detecção automática por modelo IQR · {file?.parametros && `fator ${file.parametros.iqr_fator} · ratio mín. ${file.parametros.ratio_anomalia}×`}
          </p>
        </div>
      </div>

      {/* ── KPI strip ── */}
      {!loading && (
        <div className={styles.kpiStrip}>
          <div className={styles.kpi}>
            <span className={styles.kpiVal} style={{ color: '#DC2626' }}>{file?.total_overpriced.toLocaleString('pt-BR')}</span>
            <span className={styles.kpiLabel}>Sobrepreços</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiVal} style={{ color: '#2563EB' }}>{file?.total_underpriced.toLocaleString('pt-BR')}</span>
            <span className={styles.kpiLabel}>Subpreços / preço zero</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiVal} style={{ color: '#DC2626' }}>{sevCounts.critico ?? 0}</span>
            <span className={styles.kpiLabel}><ExclamationOctagonFill size={12} />Alertas críticos</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiVal} style={{ color: '#EA580C' }}>{sevCounts.grave ?? 0}</span>
            <span className={styles.kpiLabel}><ExclamationTriangleFill size={12} />Alertas graves</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiVal}>{new Set(alerts.map(a => a.municipio)).size}</span>
            <span className={styles.kpiLabel}>Municípios afetados</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiVal}>{new Set(alerts.map(a => a.item_id)).size}</span>
            <span className={styles.kpiLabel}>Itens únicos</span>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} /> Carregando alertas…
        </div>
      )}

      {!loading && (
        <div className={styles.layout}>

          {/* ── Left: filters + cards ── */}
          <div className={styles.left}>

            {/* Filter bar */}
            <div className={styles.filterBar}>
              <select className={styles.sel} value={filterTipo} onChange={e => { setFilterTipo(e.target.value as typeof filterTipo); setPage(1) }}>
                <option value="all">Todos os tipos</option>
                <option value="overpriced">Sobrepreço</option>
                <option value="underpriced">Subpreço / Zero</option>
              </select>

              <select className={styles.sel} value={filterSev} onChange={e => { setFilterSev(e.target.value as typeof filterSev); setPage(1) }}>
                <option value="all">Toda gravidade</option>
                <option value="critico">Crítico</option>
                <option value="grave">Grave</option>
                <option value="anomalo">Anômalo</option>
                <option value="alerta">Alerta</option>
                <option value="zero">Preço Zero</option>
              </select>

              <select className={styles.sel} value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}>
                <option value="all">Todas categorias</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select className={styles.sel} value={filterMuni} onChange={e => { setFilterMuni(e.target.value); setPage(1) }}>
                <option value="all">Todos municípios</option>
                {municipalities.filter(m => m !== 'all').sort().map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <label className={styles.srpToggle}>
                <input type="checkbox" checked={filterSRP} onChange={e => { setFilterSRP(e.target.checked); setPage(1) }} />
                Somente SRP
              </label>

              {hasFilters && (
                <button className={styles.clearBtn} onClick={resetFilters}>Limpar</button>
              )}

              <span className={styles.resultCount}>
                {filtered.length.toLocaleString('pt-BR')} alerta{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Alert cards */}
            <div className={styles.cardList}>
              {visible.length === 0 ? (
                <div className={styles.noResults}>Nenhum alerta para os filtros selecionados.</div>
              ) : (
                visible.map(a => (
                  <AlertCard key={a.uid} alert={a} onRaioX={handleRaioX} />
                ))
              )}
            </div>

            {visible.length < filtered.length && (
              <button className={styles.loadMoreBtn} onClick={() => setPage(p => p + 1)}>
                Carregar mais ({filtered.length - visible.length} restantes)
              </button>
            )}
          </div>

          {/* ── Right: charts ── */}
          <div className={styles.right}>

            {/* By month */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Anomalias por mês</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={byMes} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="gOver" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gUnder" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(13,41,82,0.07)" />
                  <XAxis dataKey="mes" tick={{ fill: '#8898AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8898AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(74,144,217,0.15)', strokeWidth: 1 }}
                    contentStyle={{ background: '#0D2952', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                    itemStyle={{ color: '#E2E8F0' }}
                    formatter={(v: number, name: string) => [v, name === 'over' ? 'Sobrepreço' : 'Subpreço']}
                  />
                  <Area type="monotone" dataKey="over"   stroke="#DC2626" strokeWidth={2} fill="url(#gOver)"  dot={false} />
                  <Area type="monotone" dataKey="under"  stroke="#2563EB" strokeWidth={2} fill="url(#gUnder)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* By category */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Sobrepreços por categoria</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={byCat}
                  layout="vertical"
                  margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke="rgba(13,41,82,0.07)" />
                  <XAxis type="number" tick={{ fill: '#8898AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="cat" tick={{ fill: '#4B5563', fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(74,144,217,0.07)' }}
                    formatter={(v: number) => [v, 'alertas']}
                    contentStyle={{ background: '#0D2952', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Bar dataKey="n" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {byCat.map((_, i) => (
                      <Cell key={i} fill="#DC2626" fillOpacity={0.7 - i * 0.06} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By municipality */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Sobrepreços por município</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={byMuni}
                  layout="vertical"
                  margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke="rgba(13,41,82,0.07)" />
                  <XAxis type="number" tick={{ fill: '#8898AA', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="muni" tick={{ fill: '#4B5563', fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(74,144,217,0.07)' }}
                    formatter={(v: number) => [v, 'alertas']}
                    contentStyle={{ background: '#0D2952', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#fff', fontWeight: 700 }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Bar dataKey="n" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {byMuni.map((_, i) => (
                      <Cell key={i} fill="#2F6FB2" fillOpacity={0.8 - i * 0.07} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Severity breakdown */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Por gravidade</h3>
              <div className={styles.sevBreakdown}>
                {(Object.entries(SEV_META) as [Severity, typeof SEV_META[Severity]][]).map(([sev, meta]) => {
                  const count = sevCounts[sev] ?? 0
                  const total = alerts.length
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={sev} className={styles.sevRow}>
                      <span className={styles.sevBadgeWrap}>
                        <span className={styles.sevRowLabel} style={{ color: meta.color }}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className={styles.sevTooltipBox} style={{ bottom: 'auto', top: 'calc(100% + 6px)' }}>
                          <strong style={{ display: 'block', marginBottom: 4, color: '#fff' }}>{meta.label}</strong>
                          {meta.criteria}
                        </span>
                      </span>
                      <div className={styles.sevRowBar}>
                        <div
                          className={styles.sevRowFill}
                          style={{ width: `${pct}%`, background: meta.color, opacity: 0.75 }}
                        />
                      </div>
                      <span className={styles.sevRowCount}>{count.toLocaleString('pt-BR')}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
