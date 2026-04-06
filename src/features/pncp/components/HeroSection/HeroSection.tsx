import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './HeroSection.module.css'

gsap.registerPlugin(ScrollTrigger)

interface HeroStat {
  value: string
  target: number
  suffix: string
  label: string
}

const STATS: HeroStat[] = [
  { value: 'R$ 0', target: 2.4, suffix: 'bi', label: 'Volume monitorado' },
  { value: '0',   target: 847, suffix: 'k',  label: 'Itens catalogados' },
  { value: '0%',  target: 98,  suffix: '%',  label: 'Precisão de preços' },
]

function animateCounter(el: HTMLElement, target: number, suffix: string) {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration: 1.8,
    ease: 'power2.out',
    delay: 1,
    onUpdate: () => {
      el.textContent = Math.floor(obj.val).toLocaleString('pt-BR') + suffix
    },
  })
}

export function HeroSection() {
  const bgRef    = useRef<HTMLDivElement>(null)
  const tagRef   = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef   = useRef<HTMLParagraphElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const statValRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(bgRef.current, { scale: 1.12, duration: 1.8, ease: 'power2.out' })
        .from(tagRef.current, { opacity: 0, y: 20, duration: 0.5 }, '-=1.2')
        .from(titleRef.current, { opacity: 0, y: 32, duration: 0.7 }, '-=0.4')
        .from(subRef.current, { opacity: 0, y: 20, duration: 0.5 }, '-=0.5')
        .from(statsRef.current?.children ?? [], { opacity: 0, y: 20, stagger: 0.12, duration: 0.5 }, '-=0.3')

      // Parallax
      const mainEl = document.getElementById('mainScroll')
      if (mainEl && bgRef.current) {
        ScrollTrigger.create({
          trigger: mainEl,
          scroller: mainEl,
          start: 'top top',
          end: '380px top',
          scrub: true,
          onUpdate: self => {
            gsap.set(bgRef.current, { y: self.progress * 120 })
          },
        })
      }

      // Counters
      STATS.forEach((stat, i) => {
        const el = statValRefs.current[i]
        if (el) animateCounter(el, stat.target, stat.suffix)
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} ref={bgRef} />
      <div className={styles.heroOverlay} />
      <div className={styles.heroPattern} />
      <div className={styles.heroAccent} />
      <div className={styles.heroAccent2} />

      <div className={styles.heroContent}>
        <div className={styles.heroTag} ref={tagRef}>
          <div className={styles.tagDot} />
          Dados em tempo real · PNCP
        </div>

        <h1 className={styles.heroTitle} ref={titleRef}>
          Compras públicas com <em>precisão</em> e <em>transparência</em>
        </h1>

        <p className={styles.heroSub} ref={subRef}>
          O hub de referência nacional para consulta, validação e justificativa de preços
          em compras governamentais.
        </p>
      </div>

      <div className={styles.heroStats} ref={statsRef}>
        {STATS.map((stat, i) => (
          <div key={stat.label} className={styles.stat}>
            <div
              className={styles.statVal}
              ref={el => { statValRefs.current[i] = el }}
            >
              {stat.value}
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
