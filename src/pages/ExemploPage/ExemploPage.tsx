import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowLeft, Search } from 'react-bootstrap-icons'
import { Input } from '@/components/Input'
import { ExemploCard } from '@/features/exemplo/components/ExemploCard'
import { useExemploPosts } from '@/features/exemplo/hooks/useExemplo'
import styles from './ExemploPage.module.css'

export function ExemploPage() {
  const [search, setSearch] = useState('')

  const { data: posts, isLoading, isError, error } = useExemploPosts({ search })

  return (
    <div className={`${styles.page} container`}>
      <NavLink to="/" className={styles.back}>
        <ArrowLeft size={14} />
        Voltar para o início
      </NavLink>

      <header className={styles.header}>
        <h1 className={styles.title}>Feature de Exemplo</h1>
        <p className={styles.subtitle}>
          Demonstração de feature completa: componente, hook, service e tipagem.
          <br />
          Dados consumidos de{' '}
          <strong>JSONPlaceholder</strong> via React Query.
        </p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder="Buscar posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            iconLeft={<Search size={14} />}
          />
        </div>
        {posts && (
          <span className={styles.count}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        )}
      </div>

      {isLoading && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {isError && (
        <div className={styles.error}>
          <strong>Erro ao carregar posts:</strong>{' '}
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </div>
      )}

      {!isLoading && !isError && posts?.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nenhum resultado encontrado</p>
          <p>Tente buscar por outro termo.</p>
        </div>
      )}

      {!isLoading && !isError && posts && posts.length > 0 && (
        <div className={styles.grid}>
          {posts.map(post => (
            <ExemploCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
