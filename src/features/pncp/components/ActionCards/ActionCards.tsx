import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './ActionCards.module.css'

interface Card {
  id: string
  accent: 'accentGold' | 'accentBlue' | 'accentGreen' | 'accentTeal'
  iconColor: 'gold' | 'blue' | 'green' | 'teal'
  badge?: { label: string; type: 'new' | 'count' }
  title: string
  desc: string
  icon: React.ReactNode
}

const CARDS: Card[] = [
  {
    id: 'nova-solicitacao',
    accent: 'accentGold',
    iconColor: 'gold',
    badge: { label: 'Novo', type: 'new' },
    title: 'Nova Solicitação',
    desc: 'Criar nova demanda de compra com justificativa automática',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    id: 'consultar-precos',
    accent: 'accentBlue',
    iconColor: 'blue',
    title: 'Consultar Preços',
    desc: 'Pesquisar valores de mercado com base em dados reais do PNCP',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'gerenciar-contratos',
    accent: 'accentGreen',
    iconColor: 'green',
    badge: { label: '3 novos', type: 'count' },
    title: 'Gerenciar Contratos',
    desc: 'Acompanhar, editar e monitorar vencimentos de contratos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" /><polyline points="9 15 12 18 15 15" />
      </svg>
    ),
  },
  {
    id: 'meus-pedidos',
    accent: 'accentTeal',
    iconColor: 'teal',
    title: 'Meus Pedidos',
    desc: 'Verificar e acompanhar minhas requisições em andamento',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
]

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

export function ActionCards() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.card-item', {
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.4)',
        delay: 0.6,
      })
    }, gridRef)

    // 3D tilt
    const cards = gridRef.current?.querySelectorAll<HTMLDivElement>('[data-tilt]') ?? []
    const cleanup: (() => void)[] = []

    cards.forEach(card => {
      let bounds: DOMRect

      function rotate(e: MouseEvent) {
        const x = e.clientX - bounds.left
        const y = e.clientY - bounds.top
        const rotateX = ((y / bounds.height) - 0.5) * -12
        const rotateY = ((x / bounds.width) - 0.5) * 12
        gsap.to(card, { rotateX, rotateY, transformPerspective: 900, transformOrigin: 'center', duration: 0.4, ease: 'power2.out' })
      }

      function enter() { bounds = card.getBoundingClientRect() }
      function leave() { gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }) }

      card.addEventListener('mouseenter', enter)
      card.addEventListener('mousemove', rotate)
      card.addEventListener('mouseleave', leave)
      cleanup.push(() => {
        card.removeEventListener('mouseenter', enter)
        card.removeEventListener('mousemove', rotate)
        card.removeEventListener('mouseleave', leave)
      })
    })

    return () => { ctx.revert(); cleanup.forEach(fn => fn()) }
  }, [])

  return (
    <div className={styles.grid} ref={gridRef}>
      {CARDS.map(card => (
        <div
          key={card.id}
          className={`${styles.card} ${styles[card.accent]} card-item`}
          data-tilt
        >
          <div className={`${styles.iconWrap} ${styles[card.iconColor]}`}>
            {card.icon}
          </div>

          {card.badge && (
            <span className={`${styles.badge} ${styles[card.badge.type]}`}>
              {card.badge.label}
            </span>
          )}

          <div className={styles.title}>{card.title}</div>
          <div className={styles.desc}>{card.desc}</div>

          <div className={styles.arrow}>
            <ArrowIcon />
          </div>
        </div>
      ))}
    </div>
  )
}
