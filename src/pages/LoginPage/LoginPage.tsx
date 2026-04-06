import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email,     setEmail]     = useState('demo@exemplo.com')
  const [password,  setPassword]  = useState('123456')
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Painel esquerdo ── */}
      <div className={styles.brand}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <div className={styles.brandTitle}>
            Hub Nacional<br />de <span>Preços</span>
          </div>

          <div className={styles.brandDivider} />

          <p className={styles.brandSub}>
            Plataforma de inteligência de preços para compras públicas
            do Ministério do Esporte. Transparência e eficiência
            em cada aquisição.
          </p>

          <div className={styles.brandTag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Ministério do Esporte · Gov.br
          </div>
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Bem-vindo de volta</h1>
            <p className={styles.cardSub}>Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.hint}>
              <strong>Acesso de demonstração</strong>
              demo@exemplo.com · senha: 123456
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2F6FB2')}
                onBlur={e  => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#2F6FB2')}
                onBlur={e  => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
