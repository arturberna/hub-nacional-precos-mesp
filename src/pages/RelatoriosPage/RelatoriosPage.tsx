import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { STATE_DATA } from '@/features/mapa/hooks/useMapaData'
import styles from './RelatoriosPage.module.css'

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  gold:     '#F2C94C',
  blue:     '#2F6FB2',
  blueMid:  '#1E4D8C',
  blueDeep: '#0D2952',
  green:    '#27AE60',
  red:      '#DC2626',
  grid:     'rgba(13,41,82,0.07)',
  tick:     '#8898AA',
  surface:  '#FFFFFF',
}

// ─── Mock temporal data ───────────────────────────────────────────────────────
const MONTHLY = [
  { mes: 'Jan', media: 238.4, maximo: 305.2, minimo: 192.1 },
  { mes: 'Fev', media: 241.8, maximo: 308.6, minimo: 195.3 },
  { mes: 'Mar', media: 246.2, maximo: 312.4, minimo: 197.8 },
  { mes: 'Abr', media: 243.5, maximo: 310.1, minimo: 196.0 },
  { mes: 'Mai', media: 249.1, maximo: 317.8, minimo: 199.4 },
  { mes: 'Jun', media: 252.7, maximo: 321.3, minimo: 201.6 },
  { mes: 'Jul', media: 248.3, maximo: 315.9, minimo: 198.2 },
  { mes: 'Ago', media: 254.6, maximo: 323.1, minimo: 203.5 },
  { mes: 'Set', media: 257.9, maximo: 326.4, minimo: 205.8 },
  { mes: 'Out', media: 250.4, maximo: 318.9, minimo: 199.1 },
  { mes: 'Nov', media: 253.2, maximo: 320.7, minimo: 200.9 },
  { mes: 'Dez', media: 249.8, maximo: 318.9, minimo: 198.5 },
]

const REGIONS: { label: string; ufs: string[] }[] = [
  { label: 'Norte',         ufs: ['AC','AM','AP','PA','RO','RR','TO'] },
  { label: 'Nordeste',      ufs: ['AL','BA','CE','MA','PB','PE','PI','RN','SE'] },
  { label: 'Centro-Oeste',  ufs: ['DF','GO','MS','MT'] },
  { label: 'Sudeste',       ufs: ['ES','MG','RJ','SP'] },
  { label: 'Sul',           ufs: ['PR','RS','SC'] },
]

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.ttLabel}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>R$ {p.value.toFixed(2).replace('.', ',')}</strong>
        </p>
      ))}
    </div>
  )
}

function PctTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.chartTooltip}>
      <p className={styles.ttLabel}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value > 0 ? '+' : ''}{p.value.toFixed(1)}%</strong>
        </p>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function RelatoriosPage() {
  const [period,    setPeriod]    = useState('2024')
  const [regionFilter, setRegionFilter] = useState('Todas')

  // ── derived data ──
  const entries = useMemo(() => Object.entries(STATE_DATA), [])
  const prices  = useMemo(() => entries.map(([, d]) => d.price), [entries])
  const avg     = useMemo(() => prices.reduce((a, b) => a + b, 0) / prices.length, [prices])
  const minP    = useMemo(() => Math.min(...prices), [prices])
  const maxP    = useMemo(() => Math.max(...prices), [prices])
  const belowCount = useMemo(() => prices.filter(p => p <= avg).length, [prices, avg])

  // states bar chart (filtered by region)
  const statesData = useMemo(() => {
    const ufs = regionFilter === 'Todas'
      ? entries
      : entries.filter(([uf]) => {
          const r = REGIONS.find(r => r.label === regionFilter)
          return r?.ufs.includes(uf)
        })
    return ufs
      .sort((a, b) => b[1].price - a[1].price)
      .map(([uf, d]) => ({
        uf,
        name:  d.name,
        preco: d.price,
        var:   +((d.price - avg) / avg * 100).toFixed(1),
      }))
  }, [entries, regionFilter, avg])

  // region averages
  const regionData = useMemo(() =>
    REGIONS.map(r => {
      const regionPrices = r.ufs.map(uf => STATE_DATA[uf]?.price ?? 0)
      const regionAvg = regionPrices.reduce((a, b) => a + b, 0) / regionPrices.length
      return { name: r.label, media: +regionAvg.toFixed(2) }
    }),
  [])

  // donut
  const pieData = useMemo(() => [
    { name: 'Acima da média', value: entries.length - belowCount, color: C.red   },
    { name: 'Abaixo da média', value: belowCount,                 color: C.green },
  ], [entries.length, belowCount])

  // variation bar chart (top 10 absolute variation)
  const varData = useMemo(() =>
    [...statesData]
      .sort((a, b) => Math.abs(b.var) - Math.abs(a.var))
      .slice(0, 14)
      .reverse(),
  [statesData])

  const fmtBRL = (v: number) => `R$ ${v.toFixed(0)}`
  const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.sub}>Análise de preços de materiais esportivos · {period}</p>
        </div>

        <div className={styles.filters}>
          <select
            className={styles.select}
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          <select
            className={styles.select}
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
          >
            <option>Todas</option>
            {REGIONS.map(r => <option key={r.label}>{r.label}</option>)}
          </select>

          <button className={styles.exportBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className={styles.kpiGrid}>
        <KpiCard
          label="Preço Médio Nacional"
          value={`R$ ${avg.toFixed(2).replace('.', ',')}`}
          delta="+3,2% vs ano anterior"
          deltaUp
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          }
        />
        <KpiCard
          label="Estados Monitorados"
          value="27"
          delta="100% do território"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            </svg>
          }
        />
        <KpiCard
          label="Maior Variação"
          value={`+${((maxP - avg) / avg * 100).toFixed(1)}%`}
          delta="Rio de Janeiro vs média"
          deltaUp={false}
          danger
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
            </svg>
          }
        />
        <KpiCard
          label="Abaixo da Média"
          value={`${belowCount} estados`}
          delta={`${((belowCount / 27) * 100).toFixed(0)}% apresentam economia`}
          positive
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
            </svg>
          }
        />
      </div>

      {/* ── Row 1: states + donut ── */}
      <div className={styles.row}>
        {/* States horizontal bar */}
        <div className={`${styles.card} ${styles.statesCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Preço por Estado</h2>
            <span className={styles.cardSub}>Referência: equipamentos esportivos · R$/unidade</span>
          </div>
          <div className={styles.statesChartWrap}>
            <ResponsiveContainer width="100%" height={statesData.length * 32 + 24}>
              <BarChart
                data={statesData}
                layout="vertical"
                margin={{ top: 0, right: 60, bottom: 0, left: 100 }}
              >
                <CartesianGrid horizontal={false} stroke={C.grid} />
                <XAxis
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={v => `R$${v}`}
                  tick={{ fill: C.tick, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: C.tick, fontSize: 11 }}
                  width={96}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(13,41,82,0.04)' }} />
                <ReferenceLine
                  x={avg}
                  stroke={C.gold}
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: 'Média', fill: C.gold, fontSize: 11, position: 'insideTopRight' }}
                />
                <Bar dataKey="preco" name="Preço" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {statesData.map(d => (
                    <Cell
                      key={d.uf}
                      fill={d.preco > avg ? C.red : C.green}
                      fillOpacity={0.82}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: donut + region bars */}
        <div className={styles.rightCol}>
          {/* Donut */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Distribuição</h2>
              <span className={styles.cardSub}>Acima / abaixo da média nacional</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.88} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v} estados`, '']}
                  contentStyle={{ background: C.blueDeep, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: C.tick, fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className={styles.donutCenter}>
              <span className={styles.donutVal}>27</span>
              <span className={styles.donutLabel}>estados</span>
            </div>
          </div>

          {/* Region averages */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Média por Região</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={regionData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="name" tick={{ fill: C.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tickFormatter={v => `${v}`} tick={{ fill: C.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(13,41,82,0.04)' }} />
                <ReferenceLine y={avg} stroke={C.gold} strokeDasharray="4 3" strokeWidth={1.5} />
                <Bar dataKey="media" name="Média" fill={C.blue} fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 2: time series ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Evolução Mensal de Preços</h2>
          <span className={styles.cardSub}>{period} · R$/unidade</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={MONTHLY} margin={{ top: 8, right: 24, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="gradMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.red}   stopOpacity={0.18} />
                <stop offset="95%" stopColor={C.red}   stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.gold}  stopOpacity={0.22} />
                <stop offset="95%" stopColor={C.gold}  stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green} stopOpacity={0.18} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="mes" tick={{ fill: C.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={fmtBRL}
              tick={{ fill: C.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: C.grid, strokeWidth: 1 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={v => <span style={{ color: C.tick, fontSize: 12 }}>{v}</span>}
            />
            <Area type="monotone" dataKey="maximo" name="Máximo"  stroke={C.red}   strokeWidth={2} fill="url(#gradMax)" dot={false} />
            <Area type="monotone" dataKey="media"  name="Média"   stroke={C.gold}  strokeWidth={2} fill="url(#gradMed)" dot={false} />
            <Area type="monotone" dataKey="minimo" name="Mínimo"  stroke={C.green} strokeWidth={2} fill="url(#gradMin)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 3: variation bar ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Maiores Variações em Relação à Média</h2>
          <span className={styles.cardSub}>% acima ou abaixo do preço médio nacional (R$ {avg.toFixed(2).replace('.', ',')})</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={varData} margin={{ top: 8, right: 24, bottom: 0, left: 100 }}>
            <CartesianGrid horizontal={false} stroke={C.grid} />
            <XAxis
              type="number"
              tickFormatter={fmtPct}
              tick={{ fill: C.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: C.tick, fontSize: 11 }}
              width={96}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<PctTooltip />} cursor={{ fill: 'rgba(13,41,82,0.04)' }} />
            <ReferenceLine x={0} stroke={C.blueMid} strokeWidth={1} strokeOpacity={0.4} />
            <Bar dataKey="var" name="Variação" layout="vertical" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {varData.map(d => (
                <Cell key={d.uf} fill={d.var > 0 ? C.red : C.green} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, delta, deltaUp, danger, positive, icon,
}: {
  label: string
  value: string
  delta?: string
  deltaUp?: boolean
  danger?: boolean
  positive?: boolean
  icon: React.ReactNode
}) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiBody}>
        <div className={styles.kpiLabel}>{label}</div>
        <div className={styles.kpiValue}>{value}</div>
        {delta && (
          <div className={`${styles.kpiDelta} ${danger ? styles.danger : positive ? styles.positive : ''}`}>
            {delta}
          </div>
        )}
      </div>
    </div>
  )
}
