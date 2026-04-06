# react-template

Template base para projetos React. Clone, instale e construa.

## Stack

| Ferramenta | Versão | Papel |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Bundler / dev server |
| React Router | 7 | Roteamento |
| TanStack Query | 5 | Server state / cache |
| CSS Modules | — | Estilos por componente |
| react-bootstrap-icons | 1.11 | Ícones SVG |
| ESLint + Prettier | — | Lint e formatação |

---

## Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Subir dev server
npm run dev
```

**Credenciais de demo:** `demo@exemplo.com` / `123456`

---

## Estrutura de pastas

```
src/
├── assets/
│   └── styles/
│       └── global.css        # Design tokens + reset CSS
│
├── components/               # Componentes genéricos reutilizáveis
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── ProtectedRoute/
│
├── contexts/                 # Contextos React globais
│   └── AuthContext.tsx
│
├── features/                 # Domínios de negócio (Feature-Sliced)
│   └── exemplo/
│       ├── components/       # Componentes exclusivos da feature
│       ├── hooks/            # Hooks (useQuery, lógica local)
│       ├── services/         # Chamadas HTTP da feature
│       └── types.ts          # Tipos/interfaces da feature
│
├── hooks/                    # Hooks globais reutilizáveis
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── lib/
│   └── queryClient.ts        # Configuração do QueryClient
│
├── pages/                    # Só composição, sem lógica de negócio
│   ├── HomePage/
│   ├── LoginPage/
│   └── ExemploPage/
│
├── services/
│   └── api.ts                # Wrapper fetch global (token, erros)
│
└── types/
    └── index.ts              # Tipos globais compartilhados
```

---

## Convenções

### Nomenclatura de arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente | PascalCase | `Button.tsx` |
| Hook | camelCase com prefixo `use` | `useDebounce.ts` |
| Service | camelCase com sufixo `Service` | `exemploService.ts` |
| Tipos | camelCase ou PascalCase | `types.ts` / `User` |
| CSS Module | mesmo nome do componente | `Button.module.css` |
| Barrel | sempre `index.ts` | `index.ts` |

### Estrutura de componente

Cada componente vive em sua própria pasta com três arquivos:

```
Button/
├── Button.tsx          # Implementação
├── Button.module.css   # Estilos (CSS Modules)
└── index.ts            # Re-export: export { Button } from './Button'
```

### Importações

Use o alias `@/` para importações absolutas a partir de `src/`:

```ts
// Correto
import { Button } from '@/components/Button'
import { useAuth } from '@/contexts'

// Evitar
import { Button } from '../../components/Button'
```

### Estilos

Nunca escreva estilos inline ou classes globais em componentes. Use sempre CSS Modules:

```tsx
import styles from './MeuComponente.module.css'

// Múltiplas classes
const classes = [styles.base, isActive ? styles.active : ''].filter(Boolean).join(' ')
```

---

## Design Tokens

Todos os tokens vivem em `src/assets/styles/global.css` como CSS custom properties. Para mudar o tema, altere os valores em `:root`.

### Grupos de tokens

| Grupo | Prefixo | Exemplos |
|---|---|---|
| Cores da marca | `--color-primary-*` | `--color-primary-600` |
| Semântica | `--color-brand`, `--bg-*`, `--text-*` | `--text-default` |
| Tipografia | `--font-*` | `--font-size-md`, `--font-weight-bold` |
| Espaçamento | `--space-*` | `--space-4` (= 16px) |
| Bordas | `--border-*`, `--radius-*` | `--radius-md` |
| Sombras | `--shadow-*` | `--shadow-lg` |
| Transições | `--transition-*` | `--transition-base` |
| Z-index | `--z-*` | `--z-modal` |

**Regra:** nunca use valores literais de cor/espaçamento nos CSS Modules. Sempre referencie um token.

```css
/* Correto */
color: var(--text-default);
padding: var(--space-4);

/* Errado */
color: #0f172a;
padding: 16px;
```

---

## Autenticação

O `AuthContext` expõe:

```ts
const { user, isAuthenticated, isLoading, login, logout } = useAuth()
```

Para conectar com uma API real, edite apenas a função `mockLogin` em `src/contexts/AuthContext.tsx`:

```ts
// Substituir por:
async function realLogin(credentials: LoginCredentials): Promise<User> {
  const response = await api.post<{ user: User; token: string }>('/auth/login', credentials)
  localStorage.setItem('auth_token', response.token)
  return response.user
}
```

### Rotas protegidas

O `ProtectedRoute` redireciona para `/login` quando o usuário não está autenticado. A rota original é preservada via `location.state.from` e o usuário é redirecionado de volta após o login.

```tsx
// Em App.tsx — adicionar novas rotas protegidas dentro do grupo:
{
  element: <ProtectedRoute />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/minha-rota', element: <MinhaPage /> },  // <-- aqui
  ],
}
```

---

## React Query

### Query keys

Cada feature define suas keys em um objeto centralizado:

```ts
export const exemploKeys = {
  all: ['exemplo'] as const,
  posts: () => [...exemploKeys.all, 'posts'] as const,
  post: (id: number) => [...exemploKeys.all, 'post', id] as const,
}
```

Isso permite invalidações precisas:

```ts
// Invalida todos os dados da feature
queryClient.invalidateQueries({ queryKey: exemploKeys.all })

// Invalida só a lista
queryClient.invalidateQueries({ queryKey: exemploKeys.posts() })
```

### Defaults globais (`src/lib/queryClient.ts`)

| Config | Valor | Motivo |
|---|---|---|
| `staleTime` | 5 min | Evita refetch desnecessário |
| `gcTime` | 10 min | Mantém cache em background |
| `retry` | Até 2x (não em 4xx) | Não retenta erros do cliente |
| `refetchOnWindowFocus` | false | Comportamento menos invasivo |

---

## Criando uma nova feature

1. Criar pasta em `src/features/minha-feature/`
2. Adicionar `types.ts` com as interfaces
3. Criar `services/minhaFeatureService.ts` usando `api.*`
4. Criar `hooks/useMinhaFeature.ts` com as queries/mutations
5. Criar componentes em `components/`
6. Criar a page em `src/pages/MinhaFeaturePage/`
7. Adicionar a rota em `src/App.tsx`

---

## Scripts disponíveis

```bash
npm run dev       # Dev server com HMR
npm run build     # Build de produção (tsc + vite build)
npm run preview   # Preview do build local
npm run lint      # ESLint (zero warnings)
npm run format    # Prettier em src/**
```

---

## Variáveis de ambiente

| Variável | Default | Uso |
|---|---|---|
| `VITE_API_URL` | `""` | URL base da API. Vazio = URLs absolutas nos services |

Todas as variáveis expostas ao browser devem começar com `VITE_`.
