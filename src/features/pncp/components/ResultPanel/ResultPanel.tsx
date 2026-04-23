import { useEffect, useState, lazy, Suspense } from 'react'
import type { PncpIndexItem } from '../../types'
import { useItemDetail } from '../../hooks/useItemDetail'
import styles from './ResultPanel.module.css'

const MunicipalityMap = lazy(() =>
  import('./MunicipalityMap').then(m => ({ default: m.MunicipalityMap })),
)

type ExpandMode = 'purchases' | 'municipalities' | null

interface ResultPanelProps {
  item: PncpIndexItem | null
  onClose: () => void
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtMes(mes: string) {
  const [y, m] = mes.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[parseInt(m) - 1]}/${y}`
}

export function ResultPanel({ item, onClose }: ResultPanelProps) {
  const [expandMode, setExpandMode] = useState<ExpandMode>(null)
  const { detail, isLoading, error } = useItemDetail(item?.id ?? null)

  useEffect(() => { setExpandMode(null) }, [item?.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = item ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [item])

  if (!item) return null

  const tipoLabel  = item.tipo === 'M' ? 'Material' : 'Serviço'
  const tipoClass  = item.tipo === 'M' ? styles.tipoMaterial : styles.tipoServico
  const isExpanded = expandMode !== null
  const mediana    = detail?.preco.mediana ?? item.vu_mediana

  function toggleExpand(mode: ExpandMode) {
    setExpandMode(prev => prev === mode ? null : mode)
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <div
        className={`${styles.panel} ${isExpanded ? styles.expanded : ''}`}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${tipoClass}`}>{tipoLabel}</span>
            <span className={styles.badge}>{item.categoria}</span>
            {item.sneaelis && <span className={`${styles.badge} ${styles.sneaelisBadge}`}>SNEAELIS</span>}
          </div>
          <div className={styles.headerRight}>
            {isExpanded && (
              <button className={styles.collapseBtn} onClick={() => setExpandMode(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Recolher
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} title="Fechar (Esc)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className={styles.mainArea}>

          {/* ── Expanded section ── */}
          {isExpanded && (
            <div className={styles.expandSection}>
              <div className={styles.expandHeader}>
                <button
                  className={`${styles.expandTab} ${expandMode === 'purchases' ? styles.activeTab : ''}`}
                  onClick={() => setExpandMode('purchases')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  Compras ({detail?.ocorrencias.length ?? '…'})
                </button>
                <button
                  className={`${styles.expandTab} ${expandMode === 'municipalities' ? styles.activeTab : ''}`}
                  onClick={() => setExpandMode('municipalities')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Municípios ({detail?.por_municipio.length ?? '…'})
                </button>
              </div>

              <div className={styles.expandBody}>
                {isLoading && (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    Carregando dados…
                  </div>
                )}

                {error && !isLoading && (
                  <div className={styles.errorState}>{error}</div>
                )}

                {/* ── Timeline de compras ── */}
                {!isLoading && !error && expandMode === 'purchases' && detail && (
                  <div className={styles.timeline}>
                    {detail.ocorrencias.map((oc, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <div className={styles.tlIconWrap}>
                          <div className={styles.tlIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                          </div>
                          {i < detail.ocorrencias.length - 1 && <div className={styles.tlLine} />}
                        </div>
                        <div className={styles.tlContent}>
                          <div className={styles.tlHeader}>
                            <span className={styles.tlDate}>{fmtMes(oc.mes)}</span>
                            {oc.srp && <span className={styles.tlSrp}>SRP</span>}
                          </div>
                          <div className={styles.tlOrgan}>{oc.municipio}</div>
                          <div className={styles.tlFooter}>
                            <span className={styles.tlPrice}>{fmtBRL(oc.valor_unitario)}/{oc.unidade}</span>
                            <span className={styles.tlQty}>Qtd: {oc.quantidade}</span>
                          </div>
                          <div className={styles.tlModal}>{oc.modalidade_nome}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Mapa de municípios ── */}
                {!isLoading && !error && expandMode === 'municipalities' && detail && (
                  <div className={styles.muniWrap}>
                    <Suspense fallback={<div className={styles.mapLoading}>Carregando mapa…</div>}>
                      <MunicipalityMap
                        municipios={detail.por_municipio}
                        medianaNacional={mediana}
                      />
                    </Suspense>

                    <div className={styles.muniList}>
                      {[...detail.por_municipio]
                        .sort((a, b) => b.mediana - a.mediana)
                        .map(m => (
                          <div key={m.municipio} className={styles.muniItem}>
                            <div className={styles.muniLeft}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <div>
                                <div className={styles.muniName}>{m.municipio}</div>
                                <div className={styles.muniOcorr}>{m.n} ocorrência{m.n !== 1 ? 's' : ''} · {fmtBRL(m.min)}–{fmtBRL(m.max)}</div>
                              </div>
                            </div>
                            <div className={styles.muniRight}>
                              <span className={styles.muniPrice}>{fmtBRL(m.mediana)}</span>
                              <span
                                className={styles.muniDelta}
                                style={{ color: m.mediana > mediana ? '#DC2626' : '#27AE60' }}
                              >
                                {m.mediana > mediana ? '▲' : '▼'}
                                {Math.abs((m.mediana - mediana) / mediana * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Body original ── */}
          <div className={styles.body}>
            <h2 className={styles.name}>{item.nome}</h2>
            <p className={styles.meta}>Unidade: <strong>{item.unidade}</strong></p>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <span className={styles.kpiLabel}>Mediana</span>
                <span className={styles.kpiValue}>{fmtBRL(mediana)}</span>
                <span className={styles.kpiSub}>por {item.unidade}</span>
              </div>

              <button
                className={`${styles.kpiCard} ${styles.kpiClickable} ${expandMode === 'purchases' ? styles.kpiActive : ''}`}
                onClick={() => toggleExpand('purchases')}
              >
                <span className={styles.kpiLabel}>Ocorrências</span>
                <span className={styles.kpiValue}>{item.ocorrencias.toLocaleString('pt-BR')}</span>
                <span className={styles.kpiSub}>compras · <span className={styles.kpiCta}>ver timeline →</span></span>
              </button>

              <button
                className={`${styles.kpiCard} ${styles.kpiClickable} ${expandMode === 'municipalities' ? styles.kpiActive : ''}`}
                onClick={() => toggleExpand('municipalities')}
              >
                <span className={styles.kpiLabel}>Municípios</span>
                <span className={styles.kpiValue}>{item.municipios_n.toLocaleString('pt-BR')}</span>
                <span className={styles.kpiSub}>com registro · <span className={styles.kpiCta}>ver mapa →</span></span>
              </button>
            </div>

            {/* Estatísticas de preço — carregadas do detalhe */}
            {detail && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Distribuição de preços</h3>
                <div className={styles.priceStats}>
                  {[
                    ['Mínimo',  detail.preco.min],
                    ['P25',     detail.preco.p25],
                    ['Mediana', detail.preco.mediana],
                    ['Média',   detail.preco.media],
                    ['P75',     detail.preco.p75],
                    ['Máximo',  detail.preco.max],
                  ].map(([label, val]) => (
                    <div key={label as string} className={styles.statRow}>
                      <span className={styles.statLabel}>{label as string}</span>
                      <div className={styles.statBar}>
                        <div
                          className={styles.statFill}
                          style={{
                            width: `${((val as number) / detail.preco.max) * 100}%`,
                            background: (val as number) > detail.preco.mediana ? 'rgba(220,38,38,0.55)' : 'rgba(39,174,96,0.55)',
                          }}
                        />
                      </div>
                      <span className={styles.statVal}>{fmtBRL(val as number)}</span>
                    </div>
                  ))}
                </div>
                {detail.preco.n > 0 && (
                  <p className={styles.disclaimer}>
                    Baseado em {detail.preco.n} registro{detail.preco.n !== 1 ? 's' : ''} · Desvio padrão: {fmtBRL(detail.preco.desvio)}
                  </p>
                )}
              </section>
            )}

            {isLoading && !detail && (
              <div className={styles.loadingInline}>
                <div className={styles.spinner} /> Carregando estatísticas…
              </div>
            )}

            {/* Detalhes */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Detalhes do item</h3>
              <div className={styles.detailList}>
                {([
                  ['Categoria', item.categoria],
                  ['Tipo',      tipoLabel],
                  ['Unidade',   item.unidade],
                  ['SNEAELIS',  item.sneaelis ? 'Sim' : 'Não'],
                  ...(detail ? [['SRP', `${detail.srp_pct.toFixed(1)}% das compras`]] : []),
                  ['ID',        item.id],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className={styles.detailRow}>
                    <span className={styles.detailKey}>{k}</span>
                    <span className={`${styles.detailVal} ${k === 'ID' ? styles.detailId : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <a
            href={`https://pncp.gov.br/app/editais?q=${encodeURIComponent(item.nome)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.pncpBtn}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Buscar no PNCP
          </a>
          <button className={styles.closeFooterBtn} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </>
  )
}
