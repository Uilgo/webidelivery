---
applyTo: "**"
---

# Regras de Desenvolvimento — WebiDelivery MVP

⚠️ **Atenção**  
Este documento é específico para o projeto **WebiDelivery** e deve ser seguido rigorosamente.  
Base: Next.js 15 + TypeScript + Tailwind CSS

---

## 0) Instruções para IA/Assistentes

🤖 **Instruções Específicas para IA:**

- **SEMPRE responda em Português Brasileiro** em todas as interações
- **Aplique o princípio DRY (Don't Repeat Yourself)** - nunca duplique código
- **Reutilize componentes, hooks e funções** existentes antes de criar novos
- **Refatore código duplicado** em funções/hooks compartilhados
- **Sugira melhorias** de performance e arquitetura quando apropriado
- **Valide consistência** com as regras estabelecidas neste guia
- **Priorize legibilidade** e manutenibilidade do código
- **Sugira nomes descritivos** para funções, hooks e componentes
- **Documente código simples e complexos** SEMPRE adicione comentários explicativos em português brasileiro no código gerado e documente a função/propósito de cada bloco de código importante, utilize comentários claros e objetivos resumidos, para não poluir o código com excessos, mas garantir que a lógica seja compreensível
- **Use sempre TypeScript** com tipagem rigorosa, evitando `any` e preferindo `unknown` com type guards
- **SEMPRE use apenas Tailwind CSS** - é PROIBIDO usar Sass, SCSS, CSS modules ou qualquer outro preprocessador CSS. Use apenas classes do Tailwind e CSS nativo quando absolutamente necessário
- **OBRIGATÓRIO: Use APENAS React Server Components e Client Components** seguindo as convenções do Next.js 15 App Router
- **Nunca criar nada sem permissão** nunca crie ou edite algo sem antes confirmar com o desenvolvedor responsável pelo projeto
- **Nunca execute um novo servidor (`npm run dev` ou `pnpm run dev`) para fazer testes** - isso deve ser feito manualmente pelo usuário
- **Sempre seguir as regras específicas do projeto** adaptando este guia às necessidades do contexto atual

---

# 🚀 Stack Frontend (Next.js 15)

### **Core**

- **pnpm** → gerenciador de pacotes rápido e confiável.
- **Next.js 15 (App Router)**
- **TypeScript**
- **Tailwind CSS nativo** (`tailwind.config.ts`)

### **UI / Design System**

- **shadcn/ui** → componentes acessíveis
- **lucide-react** → ícones padrão do shadcn
- **sonner** → toasts padrão do shadcn
- **tailwind-variants** → variantes de componentes com tipagem

### **Formulários / Validação**

- **react-hook-form** → formulários leves
- **zod** → schemas de validação + tipagem
- **@hookform/resolvers** → integração RHF + Zod

### **Estado / Data Fetching**

- **zustand** → estado global simples
- **@tanstack/react-query** → cache e sincronização de dados (ótimo até em front-only)

### **UX / Acessibilidade**

- **next-themes** → dark/light mode persistente
- **framer-motion** → animações
- **react-aria** → acessibilidade e interações prontas

### **Qualidade e Produtividade**

- **Biome** → lint + formatter
- **husky + lint-staged** → hooks antes do commit
- **commitlint + cz-conventional-changelog** (opcional) → padronizar commits

## 🔒 Back-end & Autenticação

- **Supabase** → autenticação, banco, storage, realtime.
- **Middleware** → proteção de rotas no Frontend com base no estado de autenticação.

---

## 1) Estrutura de Rotas — WebiDelivery

### Estrutura obrigatória do App Router:

```
src/
├── app/
│   ├── (public)/                    # Route Group - páginas públicas
│   │   ├── [slug]/                  # /{slug} - cardápio dinâmico
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (auth)/                      # Route Group - autenticação
│   │   ├── auth/
│   │   │   └── page.tsx             # /auth (com query params)
│   │   └── layout.tsx
│   │
│   ├── (onboarding)/                # Route Group - configuração inicial
│   │   ├── onboarding/
│   │   │   └── page.tsx             # /onboarding
│   │   └── layout.tsx
│   │
│   ├── (admin)/                     # Route Group - painel administrativo
│   │   ├── admin/
│   │   │   ├── cardapio/
│   │   │   │   └── page.tsx         # /admin/cardapio
│   │   │   ├── marketing/
│   │   │   │   └── page.tsx         # /admin/marketing
│   │   │   ├── configuracoes/
│   │   │   │   └── page.tsx         # /admin/configuracoes
│   │   │   └── perfil/
│   │   │       └── page.tsx         # /admin/perfil
│   │   └── layout.tsx               # Layout com sidebar + header
│   │
│   ├── api/                         # API Routes
│   │   ├── auth/
│   │   ├── empresas/
│   │   ├── cardapio/
│   │   ├── marketing/
│   │   ├── slugs/
│   │   └── uploads/
│   │
│   ├── globals.css
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Rota raiz (/)
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
```

---

## 2) Regras de Roteamento e Redirecionamento

### Middleware obrigatório (`src/middleware.ts`):

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession(req);

  // Rota raiz (/)
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/admin/cardapio", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  // Rotas de autenticação
  if (pathname.startsWith("/auth")) {
    // Se não tem query param, adiciona ?mode=login
    if (!req.nextUrl.searchParams.has("mode")) {
      const url = new URL("/auth?mode=login", req.url);
      return NextResponse.redirect(url);
    }

    // Se já está logado, redireciona para admin
    if (session) {
      return NextResponse.redirect(new URL("/admin/cardapio", req.url));
    }
  }

  // Rotas protegidas (admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    // Se onboarding não foi concluído
    if (!session.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // Onboarding
  if (pathname === "/onboarding") {
    if (!session) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    if (session.onboardingCompleted) {
      return NextResponse.redirect(new URL("/admin/cardapio", req.url));
    }
  }

  return NextResponse.next();
}
```

### Regras de navegação por modo de autenticação:

- `/auth` sem parâmetros → redireciona para `/auth?mode=login`
- `/auth?mode=signup` → página de cadastro
- `/auth?mode=forgot-password` → recuperação de senha

---

## 3) Estrutura de Features — WebiDelivery

```
src/features/
├── auth/                           # Autenticação
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── AuthLayout.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLogin.ts
│   │   ├── useSignup.ts
│   │   └── useForgotPassword.ts
│   └── types/
│       └── auth.ts
│
├── onboarding/                     # Configuração inicial da empresa
│   ├── components/
│   │   ├── OnboardingForm.tsx
│   │   ├── CompanyDetailsStep.tsx
│   │   ├── AddressStep.tsx
│   │   └── SlugStep.tsx
│   ├── hooks/
│   │   ├── useOnboarding.ts
│   │   └── useSlugValidation.ts
│   └── types/
│       └── onboarding.ts
│
├── cardapio/                       # Gerenciamento do cardápio
│   ├── components/
│   │   ├── CategoriasTab.tsx
│   │   ├── ProdutosTab.tsx
│   │   ├── AdicionaisTab.tsx
│   │   ├── CombosTab.tsx
│   │   ├── CategoriaCard.tsx
│   │   ├── ProdutoCard.tsx
│   │   └── CardapioTabs.tsx
│   ├── hooks/
│   │   ├── useCategorias.ts
│   │   ├── useProdutos.ts
│   │   ├── useAdicionais.ts
│   │   └── useCombos.ts
│   └── types/
│       ├── categoria.ts
│       ├── produto.ts
│       ├── adicional.ts
│       └── combo.ts
│
├── marketing/                      # Promoções, cupons e banners
│   ├── components/
│   │   ├── CuponsTab.tsx
│   │   ├── BannersTab.tsx
│   │   ├── PromocoesTab.tsx
│   │   ├── CupomForm.tsx
│   │   ├── BannerForm.tsx
│   │   ├── PromocaoForm.tsx
│   │   └── MarketingTabs.tsx
│   ├── hooks/
│   │   ├── useCupons.ts
│   │   ├── useBanners.ts
│   │   └── usePromocoes.ts
│   └── types/
│       ├── cupom.ts
│       ├── banner.ts
│       └── promocao.ts
│
├── configuracoes/                  # Configurações do estabelecimento
│   ├── components/
│   │   ├── ConfiguracoesGerais.tsx
│   │   ├── HorariosFuncionamento.tsx
│   │   ├── MetodosPagamento.tsx
│   │   ├── FreteEntrega.tsx
│   │   ├── PersonalizarCardapio.tsx
│   │   └── Seguranca.tsx
│   ├── hooks/
│   │   ├── useConfiguracoes.ts
│   │   ├── useHorarios.ts
│   │   ├── usePagamentos.ts
│   │   └── useEntrega.ts
│   └── types/
│       ├── configuracao.ts
│       ├── horario.ts
│       ├── pagamento.ts
│       └── entrega.ts
│
├── perfil/                         # Perfil do usuário
│   ├── components/
│   │   ├── DadosPessoais.tsx
│   │   ├── AlterarSenha.tsx
│   │   └── Preferencias.tsx
│   ├── hooks/
│   │   ├── usePerfil.ts
│   │   └── useAlterarSenha.ts
│   └── types/
│       └── perfil.ts
│
└── cardapio-publico/               # Cardápio público ({slug})
    ├── components/
    │   ├── HeaderCardapio.tsx
    │   ├── CarrosselBanners.tsx
    │   ├── MenuCategorias.tsx
    │   ├── ListaProdutos.tsx
    │   ├── CarrinhoFlutante.tsx
    │   └── ModalProduto.tsx
    ├── hooks/
    │   ├── useCardapioPublico.ts
    │   ├── useCarrinho.ts
    │   └── usePedido.ts
    └── types/
        ├── cardapio-publico.ts
        ├── carrinho.ts
        └── pedido.ts
```

---

## 4) Validações Obrigatórias — WebiDelivery

### Email único (case-insensitive):

```typescript
// src/lib/validation/authValidation.ts
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) return "E-mail é obrigatório";
  if (!emailRegex.test(email)) return "Formato de e-mail inválido";

  return null;
};

// Verificação de unicidade via API
export const checkEmailUnique = async (email: string): Promise<boolean> => {
  const response = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.toLowerCase() }),
  });

  const { exists } = await response.json();
  return !exists;
};
```

### Senha com regras específicas:

```typescript
export const validatePassword = (password: string): string | null => {
  if (!password) return "Senha é obrigatória";
  if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
  if (!/[a-zA-Z]/.test(password)) return "Senha deve conter pelo menos 1 letra";
  if (!/\d/.test(password)) return "Senha deve conter pelo menos 1 número";
  if (!/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Senha deve conter pelo menos 1 caractere especial";
  }

  return null;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): string | null => {
  if (password !== confirmation) return "As senhas não coincidem";
  return null;
};
```

### Validação de Slug (URL personalizada):

```typescript
// src/hooks/form/useSlugValidation.ts
export function useSlugValidation() {
  const [slug, setSlug] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSlugFormat = (value: string): string | null => {
    // Conversão automática: espaço vira hífen
    const cleanSlug = value.toLowerCase().replace(/\s+/g, "-");

    if (cleanSlug.length < 3) return "URL deve ter pelo menos 3 caracteres";
    if (cleanSlug.length > 40) return "URL deve ter no máximo 40 caracteres";
    if (!/^[a-z][a-z0-9-]*$/.test(cleanSlug)) {
      return "URL deve iniciar com letra e conter apenas letras minúsculas, números e hífens";
    }
    if (cleanSlug.endsWith("-") || cleanSlug.includes("--")) {
      return "URL não pode terminar com hífen ou ter hífens duplos";
    }

    // Slugs reservados
    const reserved = ["admin", "api", "auth", "onboarding", "www", "app"];
    if (reserved.includes(cleanSlug)) {
      return "Esta URL é reservada pelo sistema";
    }

    return null;
  };

  const handleSlugChange = (value: string) => {
    // Conversão automática de espaço para hífen
    const cleanValue = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    setSlug(cleanValue);
  };

  return {
    slug,
    isValid,
    isAvailable,
    error,
    handleSlugChange,
    validateSlugFormat,
  };
}
```

### Validação de telefone WhatsApp:

```typescript
export const validateWhatsApp = (phone: string): string | null => {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, "");

  if (!numbers) return "WhatsApp é obrigatório";
  if (numbers.length < 10) return "Número de WhatsApp inválido";
  if (numbers.length > 15) return "Número de WhatsApp muito longo";

  // Validação básica para números brasileiros
  if (numbers.startsWith("55") && numbers.length !== 13) {
    return "Número brasileiro deve ter 13 dígitos (55 + DDD + 9 dígitos)";
  }

  return null;
};
```

---

## 5) Layout do Painel Administrativo

### Layout obrigatório (`src/app/(admin)/layout.tsx`):

```tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar fixa - 100vh, sem scroll */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header fixo */}
        <Header />

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Sidebar obrigatória (`src/components/layout/Sidebar.tsx`):

```tsx
"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Cabeçalho: Logo + Nome da Empresa */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Logo da empresa */}
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>

          {/* Nome da empresa */}
          <div>
            <h2 className="font-semibold text-gray-900 truncate">
              {company?.name || "Minha Empresa"}
            </h2>
            <p className="text-xs text-gray-500">WebiDelivery</p>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4 space-y-2">
        <MenuItem href="/admin/cardapio" icon={MenuIcon} label="Cardápio" />
        <MenuItem href="/admin/marketing" icon={TagIcon} label="Marketing" />
        <MenuItem
          href="/admin/configuracoes"
          icon={CogIcon}
          label="Configurações"
        />
      </nav>

      {/* Card do usuário no rodapé */}
      <UserCard />
    </aside>
  );
}
```

### Header obrigatório (`src/components/layout/Header.tsx`):

```tsx
export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Título da página atual */}
      <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>

      {/* Ações do header */}
      <div className="flex items-center gap-4">
        {/* Toggle Dark/Light Mode */}
        <ThemeToggle />

        {/* Botão Acessar Cardápio */}
        <Button
          variant="outline"
          onClick={() => window.open(`/${company.slug}`, "_blank")}
        >
          Acessar Cardápio
        </Button>
      </div>
    </header>
  );
}
```

---

## 6) Sistema de Tabs para Cardápio

### Implementação obrigatória de tabs:

```tsx
// src/features/cardapio/components/CardapioTabs.tsx
"use client";

import { useState } from "react";

type TabType = "categorias" | "produtos" | "adicionais" | "combos";

export function CardapioTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("categorias");

  return (
    <div className="space-y-6">
      {/* Navegação das tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <TabButton
            active={activeTab === "categorias"}
            onClick={() => setActiveTab("categorias")}
          >
            Categorias
          </TabButton>

          <TabButton
            active={activeTab === "produtos"}
            onClick={() => setActiveTab("produtos")}
          >
            Produtos
          </TabButton>

          <TabButton
            active={activeTab === "adicionais"}
            onClick={() => setActiveTab("adicionais")}
          >
            Adicionais
          </TabButton>

          <TabButton
            active={activeTab === "combos"}
            onClick={() => setActiveTab("combos")}
          >
            Combos
          </TabButton>
        </nav>
      </div>

      {/* Conteúdo das tabs */}
      <div className="min-h-[500px]">
        {activeTab === "categorias" && <CategoriasTab />}
        {activeTab === "produtos" && <ProdutosTab />}
        {activeTab === "adicionais" && <AdicionaisTab />}
        {activeTab === "combos" && <CombosTab />}
      </div>
    </div>
  );
}
```

### Fluxo de integração entre tabs:

```tsx
// src/features/cardapio/components/CategoriasTab.tsx
export function CategoriasTab() {
  const { categorias } = useCategorias();
  const { changeTab } = useCardapioTabs(); // Context para mudança de tab

  const handleAddProduto = (categoriaId: string) => {
    // Muda para tab produtos com categoria pré-selecionada
    changeTab("produtos", { preSelectedCategory: categoriaId });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categorias.map((categoria) => (
        <CategoriaCard
          key={categoria.id}
          categoria={categoria}
          onAddProduto={() => handleAddProduto(categoria.id)}
        />
      ))}
    </div>
  );
}
```

---

## 7) Mensagens do Sistema (pt-BR)

### Constantes obrigatórias (`src/lib/constants/messages.ts`):

```typescript
export const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS:
      "Já existe uma conta criada com este e-mail. Faça login para continuar.",
    PASSWORD_MISMATCH: "As senhas não coincidem",
    LOGIN_SUCCESS: "Login realizado com sucesso!",
    REGISTER_SUCCESS: "Conta criada! Vamos configurar sua empresa.",
    INVALID_CREDENTIALS: "E-mail ou senha incorretos",
    FORGOT_PASSWORD_SENT:
      "Enviamos um e-mail com instruções para redefinir sua senha.",
  },

  ONBOARDING: {
    WELCOME: "Bem-vindo! Vamos configurar sua empresa.",
    SLUG_AVAILABLE: "Disponível ✅",
    SLUG_UNAVAILABLE: "Indisponível ❌",
    COMPANY_CREATED: "Empresa criada com sucesso!",
    SPACE_TO_HYPHEN: "Espaços serão convertidos automaticamente em hífens",
  },

  CARDAPIO: {
    CATEGORIA_CREATED: "Categoria criada com sucesso",
    PRODUTO_CREATED: "Produto adicionado com sucesso",
    PRODUTO_UPDATED: "Produto atualizado com sucesso",
    CATEGORIA_EMPTY: "Nenhum produto nesta categoria",
    ADD_FIRST_PRODUCT: "Adicionar Primeiro Produto",
  },

  MARKETING: {
    CUPOM_CREATED: "Cupom criado com sucesso",
    BANNER_CREATED: "Banner criado com sucesso",
    PROMOCAO_CREATED: "Promoção criada com sucesso",
    CUPOM_APPLIED: "Cupom aplicado com desconto de R$ {valor}",
    CUPOM_INVALID: "Cupom inválido ou expirado",
    PROMOCAO_ACTIVE: "Promoção ativa",
    PROMOCAO_EXPIRED: "Promoção expirada",
  },

  PUBLIC_MENU: {
    OPEN_NOW: "Aberto agora",
    CLOSED_NOW: "Fechado no momento",
    CLOSES_AT: "Fecha às {hora}",
    ADD_TO_CART: "Adicionar ao carrinho",
    FINISH_ORDER: "Finalizar pedido",
    UNAVAILABLE: "Indisponível",
  },

  FORM: {
    REQUIRED_FIELD: "Este campo é obrigatório",
    SAVE: "Salvar",
    CANCEL: "Cancelar",
    EDIT: "Editar",
    DELETE: "Excluir",
    CONFIRM_DELETE: "Tem certeza que deseja excluir?",
    LOADING: "Carregando...",
    SAVING: "Salvando...",
  },
} as const;
```

---

## 8) Tratamento de Estados de Loading e Erro

### Padrões obrigatórios:

```tsx
// Loading states consistentes
export function ProductCard({ product }: { product: Product }) {
  const { updateProduct, isUpdating } = useProdutos();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {isUpdating ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <ProductContent product={product} />
      )}
    </div>
  );
}

// Estados vazios consistentes
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <PackageIcon className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>

      {action}
    </div>
  );
}

// Tratamento de erros
export function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // Implementar error boundary para componentes
  return (
    <div>
      {/* Error boundary logic */}
      {children}
    </div>
  );
}
```

---

## 9) Performance e Otimização

### Regras obrigatórias:

1. **Imagens otimizadas:**

```tsx
import Image from "next/image";

// Sempre usar Next.js Image para otimização
<Image
  src={product.image_url}
  alt={product.name}
  width={300}
  height={200}
  className="rounded-lg object-cover"
  priority={isAboveFold} // apenas para imagens visíveis imediatamente
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // placeholder base64
/>;
```

2. **Server Components por padrão:**

```tsx
// Server Component (padrão)
export default async function CardapioPage() {
  const categorias = await getCategorias(); // busca no servidor

  return (
    <div>
      <CardapioContent initialCategorias={categorias} />
    </div>
  );
}

// Client Component apenas quando necessário
("use client");
export function CardapioContent({ initialCategorias }) {
  const [categorias, setCategorias] = useState(initialCategorias);
  // ... lógica de interação
}
```

3. **Lazy loading para componentes pesados:**

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // se não precisar de SSR
});
```

---

## 10) Critérios de Aceitação — MVP WebiDelivery

### Autenticação ✅

- [ ] Login, cadastro e recuperação de senha funcionando
- [ ] Redirecionamentos corretos baseados no status do usuário
- [ ] Validação de e-mail único (case-insensitive)
- [ ] Validação de senha com regras específicas
- [ ] Navegação entre modos de auth via query params

### Onboarding ✅

- [ ] Formulário de criação de empresa completo
- [ ] Validação de slug em tempo real (disponível/indisponível)
- [ ] Conversão automática de espaço para hífen no slug
- [ ] Validação de telefone WhatsApp
- [ ] CEP opcional com validação quando informado
- [ ] Redirect para /admin/cardapio após conclusão

### Painel Administrativo ✅

- [ ] Sidebar fixa com 100vh sem scroll
- [ ] Header fixo com título dinâmico e ações
- [ ] Card do usuário com dropdown (Perfil/Sair)
- [ ] Toggle dark/light mode persistente
- [ ] Botão "Acessar Cardápio" abrindo /{slug} em nova aba

### Cardápio (4 tabs) ✅

- [ ] Tab Categorias com cards expansíveis
- [ ] Tab Produtos com filtro por categoria
- [ ] Tab Adicionais para grupos de extras
- [ ] Tab Combos para produtos agrupados
- [ ] Integração entre tabs (adicionar produto da categoria)
- [ ] Drag & drop para reordenação
- [ ] Estados de loading, vazio e erro

### Marketing ✅

- [ ] Tab Cupons com descontos fixos/percentuais
- [ ] Tab Banners para carrossel promocional
- [ ] Tab Promoções para ofertas especiais
- [ ] Validação de regras de cupom e promoções
- [ ] Preview de banners e promoções
- [ ] Contadores de uso básicos

### Configurações ✅

- [ ] Configurações Gerais (dados da empresa)
- [ ] Horários de Funcionamento (inclusive especiais)
- [ ] Métodos de Pagamento configuráveis
- [ ] Frete e Entrega (taxas por região/bairro)
- [ ] Personalização do Cardápio (cores, layout)
- [ ] Alterar Slug com validações
- [ ] Configurações de Segurança

### Perfil ✅

- [ ] Edição de dados pessoais
- [ ] Upload/alteração de foto de perfil
- [ ] Alteração de senha com validação
- [ ] Configurações de tema (dark/light)

### Cardápio Público (/{slug}) ✅

- [ ] Header com status de funcionamento
- [ ] Carrossel de banners promocionais
- [ ] Menu horizontal de categorias
- [ ] Busca e filtros de produtos
- [ ] Modal de produto com adicionais
- [ ] Carrinho flutuante com resumo
- [ ] Checkout básico via WhatsApp
- [ ] Aplicação de cupons
- [ ] Responsividade mobile-first

### Performance ✅

- [ ] Lighthouse Score > 90
- [ ] LCP < 2.5s
- [ ] Imagens otimizadas com Next.js Image
- [ ] Server Components por padrão
- [ ] Client Components apenas quando necessário
- [ ] Lazy loading implementado

### Responsividade ✅

- [ ] Mobile-first design
- [ ] Breakpoints: 320px, 768px, 1024px, 1280px
- [ ] Menu colapsável no mobile
- [ ] Touch gestures funcionando
- [ ] Testes em dispositivos reais

---

## 11) Variáveis de Ambiente (.env.example)

```bash
# Application
NEXT_PUBLIC_APP_NAME="WebiDelivery"
NEXT_PUBLIC_APP_URL="https://webidelivery.com.br"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Opcional para operações administrativas

# Upload/Storage
UPLOAD_MAX_SIZE=5242880 # 5MB
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"

# WhatsApp Integration
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_BUSINESS_ID="your-business-id"

# Analytics (opcional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Environment
NODE_ENV=development
```

---

## 12) Observações Finais

### Prioridades do MVP:

1. **Core funcional:** Autenticação → Onboarding → Cardápio → Cardápio Público
2. **Features secundárias:** Marketing → Configurações → Perfil
3. **Otimizações:** Performance → SEO → Analytics

### Não incluir no MVP:

- Dashboard com métricas/KPIs
- Sistema completo de pedidos com status
- Relatórios detalhados
- Sistema de notificações avançado
- Integração com gateways de pagamento
- Sistema de entrega com tracking

### Stack obrigatória:

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript (rigoroso, sem `any`)
- **Estilização:** Tailwind CSS nativo + shadcn/ui
- **Backend:** Supabase (auth + database + storage + realtime)
- **Estado:** Zustand + TanStack Query
- **Formulários:** React Hook Form + Zod + @hookform/resolvers
- **UI:** shadcn/ui + lucide-react + tailwind-variants
- **UX:** next-themes + framer-motion + react-aria
- **Qualidade:** Biome + husky + lint-staged
- **Gerenciador:** pnpm
- **Imagens:** Next.js Image

### Regras de qualidade:

- Código 100% em português brasileiro
- Comentários explicativos obrigatórios
- Tipagem TypeScript rigorosa
- Tratamento de erros consistente
- Estados de loading e vazio implementados
- Validação no frontend e backend
- Responsividade mobile-first obrigatória

---

**Este documento deve ser seguido rigorosamente para garantir a consistência e qualidade do projeto WebiDelivery MVP.**
