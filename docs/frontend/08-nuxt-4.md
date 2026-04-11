---
inclusion: always
description: Guia de estrutura de pastas e padrões específicos do projeto Nuxt 4
---

# Guia de Projeto — Nuxt 4

⚠️ **Atenção**  
Este documento contém **configurações ESPECÍFICAS do projeto Nuxt 4**: estrutura de pastas, nomenclatura de arquivos e configurações técnicas.

📚 **Para princípios de código**, consulte os guias universais:

- [Clean Code](./03-clean-code.md) - Nomenclatura, funções, comentários, TypeScript
- [Princípios SOLID](./04-solid-principles.md) - SRP, OCP, LSP, ISP, DIP
- [Princípios de Design](./05-design-principles.md) - DRY, KISS, YAGNI, SoC
- [Padrões de Arquitetura](./06-architecture-patterns.md) - Layered, Repository, Service Layer

---

## 🤖 Instruções para IA/Assistentes

**Regras Obrigatórias:**

- ✅ **SEMPRE responda em Português Brasileiro**
- ✅ **Aplique DRY** - reutilize composables/componentes existentes antes de criar novos
- ✅ **Use TypeScript rigoroso** - NUNCA use `any`, prefira `unknown` + type guards
- ✅ **Use APENAS Tailwind CSS** - PROIBIDO Sass, SCSS, CSS modules
- ✅ **Use APENAS Composition API** - Options API está PROIBIDA
- ✅ **NUNCA crie arquivos `index.ts`** para re-exportações - exporte diretamente
- ✅ **Documente código** - comentários em português explicando "por quê"
- ✅ **Nunca execute servidores** (`npm run dev`) - usuário faz manualmente
- ✅ **Sempre confirme antes de criar/editar** - nunca faça sem permissão

---

## 📁 Estrutura de Pastas (Nuxt 4)

```
my-nuxt-app/
├── app/
│   ├── assets/              # Fontes, ícones, imagens, CSS global
│   │   ├── css/             # Estilos globais
│   │   ├── images/          # Imagens processadas
│   │   ├── icons/           # Ícones SVG
│   │   └── fonts/           # Fontes customizadas
│   │
│   ├── components/
│   │   ├── ui/              # Componentes base reutilizáveis (Button, Input, Modal)
│   │   ├── layout/          # Componentes de layout (Header, Sidebar, Footer)
│   │   ├── shared/          # Componentes compartilhados (DataTable, Pagination)
│   │   └── providers/       # Providers de contexto (ThemeProvider, AuthProvider)
│   │
│   ├── composables/
│   │   ├── core/            # Composables fundamentais (useAuth, useApi)
│   │   ├── ui/              # Composables de UI (useModal, useToast, useTheme)
│   │   ├── data/            # Composables de dados (useQuery, useMutation)
│   │   ├── form/            # Composables de formulários (useForm, useValidation)
│   │   ├── async/           # Composables assíncronos (useDebounce, useThrottle)
│   │   ├── dom/             # Composables DOM (useClickOutside, useMediaQuery)
│   │   └── utils/           # Composables utilitários (useLocalStorage, useCopyToClipboard)
│   │
│   ├── features/            # 🎯 NÚCLEO - Arquitetura por Features
│   │   ├── auth/            # Feature de autenticação
│   │   │   ├── components/  # Componentes da feature
│   │   │   ├── composables/ # Composables da feature
│   │   │   ├── stores/      # Stores específicas (opcional)
│   │   │   ├── types/       # Tipos específicos
│   │   │   ├── utils/       # Utilitários específicos
│   │   │   └── *.vue        # Páginas da feature
│   │   │
│   │   ├── user-management/
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── profile/
│   │
│   ├── layouts/             # Layouts de páginas (default, admin, auth)
│   ├── middleware/          # Middlewares de rota (auth, guest, admin)
│   ├── pages/               # APENAS importações das features
│   ├── plugins/             # Plugins do Nuxt (api.client, auth.client)
│   ├── stores/              # Estado global Pinia (auth, user, ui)
│   ├── app.vue              # Componente raiz
│   ├── app.config.ts        # Configurações da aplicação
│   └── error.vue            # Página de erro global
│
├── shared/                  # ✅ Código compartilhado (client + server)
│   ├── types/               # Tipos TypeScript (auto-import)
│   │   ├── entities/        # Entidades principais (user, auth, common)
│   │   ├── api/             # Tipos de API (requests, responses, errors)
│   │   ├── forms/           # Tipos de formulários
│   │   ├── ui/              # Tipos de componentes UI
│   │   ├── store/           # Tipos de stores
│   │   └── common/          # Tipos comuns (enums, unions, utilities)
│   │
│   ├── utils/               # ✅ Utilitários compartilhados (auto-import)
│   │   ├── formatters/      # Formatadores (date, currency, text, phone, etc)
│   │   └── validators/      # Validadores (email, phone, document, etc)
│   │
│   ├── constants/           # Constantes globais
│   │   ├── api.ts           # URLs e configurações de API
│   │   ├── ui.ts            # Constantes de UI
│   │   ├── app.ts           # Constantes da aplicação
│   │   ├── time.ts          # Constantes de tempo
│   │   └── validation.ts    # Mensagens e regras de validação
│   │
│   └── schemas/             # Schemas de validação (Zod, Yup, etc)
│
├── server/                  # API server-side (Nitro)
│   ├── api/                 # Endpoints da API
│   ├── middleware/          # Middlewares server-side
│   ├── plugins/             # Plugins server-side
│   └── utils/               # Utilitários server-side
│
├── tests/                   # Testes automatizados
│   ├── features/            # Testes por features
│   ├── components/          # Testes de componentes
│   ├── composables/         # Testes de composables
│   └── e2e/                 # Testes end-to-end
│
├── docs/                    # Documentação do projeto
├── public/                  # Arquivos estáticos
├── nuxt.config.ts           # Configuração Nuxt
└── package.json
```

---

## 📝 Nomenclatura de Arquivos

### Componentes Vue (`/app/components`)

- **Formato:** PascalCase
- ✅ `UserCard.vue`, `AuthButton.vue`, `ProductModal.vue`
- ❌ `userCard.vue`, `auth-button.vue`

### Páginas (`/app/pages`)

- **Formato:** kebab-case (URLs amigáveis)
- ✅ `login.vue`, `user-profile.vue`, `forgot-password.vue`
- ❌ `Login.vue`, `userProfile.vue`

### Layouts (`/app/layouts`)

- **Formato:** PascalCase
- ✅ `DefaultLayout.vue`, `AdminLayout.vue`, `AuthLayout.vue`

### Composables (`/app/composables`)

- **Formato:** prefixo `use` + PascalCase
- ✅ `useAuth.ts`, `useCartItems.ts`, `useApiClient.ts`
- ❌ `auth.ts`, `cartItems.ts`

### Middlewares (`/app/middleware`)

- **Formato:** camelCase
- ✅ `authGuard.ts`, `adminOnly.ts`, `guestOnly.ts`

### Utilitários Compartilhados (`/shared/utils`)

- **Formato:** camelCase
- ✅ `formatCurrency.ts`, `validateEmail.ts`, `formatPhone.ts`
- ⚠️ **IMPORTANTE:** Subpastas não são auto-importadas por padrão
- 📝 **Configuração necessária** (veja seção "Pasta shared/")

### Tipos (`/shared/types`)

- **Formato:** PascalCase
- ✅ `UserDTO.ts`, `ApiResponse.ts`, `ProductEntity.ts`

### Stores (`/app/stores`)

- **Formato:** camelCase
- ✅ `userStore.ts`, `cartStore.ts`, `appSettings.ts`

---

## ⚙️ Configuração Nuxt

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
	// TypeScript rigoroso
	typescript: {
		strict: true,
		typeCheck: true,
	},

	// ESLint para prevenir 'any'
	eslint: {
		config: {
			rules: {
				"@typescript-eslint/no-explicit-any": "error",
				"@typescript-eslint/no-unsafe-argument": "error",
				"@typescript-eslint/no-unsafe-assignment": "error",
				"@typescript-eslint/no-unsafe-call": "error",
				"@typescript-eslint/no-unsafe-member-access": "error",
				"@typescript-eslint/no-unsafe-return": "error",
			},
		},
	},

	// Modules essenciais
	modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/eslint-module"],

	// Runtime config
	runtimeConfig: {
		// Privadas (server-only)
		apiSecret: "",

		// Públicas (client + server)
		public: {
			apiBase: "/api",
		},
	},

	// ✅ Auto-import para subpastas de shared/utils
	imports: {
		dirs: ["shared/utils/formatters", "shared/utils/validators"],
	},

	// ✅ Auto-import para Nitro (server-side)
	nitro: {
		imports: {
			dirs: ["shared/utils/formatters", "shared/utils/validators"],
		},
	},
});
```

---

## 📂 Pasta `shared/` - Código Compartilhado

### 🎯 Propósito

A pasta `shared/` é usada para **código que funciona tanto no cliente (Vue) quanto no servidor (Nitro)**.

**Disponível desde:** Nuxt v3.14+

### ✅ O que pode ir em `shared/`

- ✅ Funções puras (sem side effects)
- ✅ Formatadores (date, currency, phone, etc)
- ✅ Validadores (email, CPF, CNPJ, etc)
- ✅ Tipos TypeScript
- ✅ Constantes
- ✅ Utilitários matemáticos
- ✅ Helpers de string/array/object

### ❌ O que NÃO pode ir em `shared/`

- ❌ Código Vue (ref, computed, watch, etc)
- ❌ Código Nitro (defineEventHandler, etc)
- ❌ Composables (use `app/composables/`)
- ❌ Componentes Vue (use `app/components/`)
- ❌ Código com dependências de framework

### 📁 Estrutura de Auto-Import

**Apenas estas pastas são auto-importadas:**

```
shared/
  ├── types/           ✅ Auto-importado
  │   └── *.ts
  └── utils/           ✅ Auto-importado
      └── *.ts
```

**Subpastas NÃO são auto-importadas por padrão:**

```
shared/
  └── utils/
      ├── formatters/  ❌ NÃO auto-importado (precisa configurar)
      └── validators/  ❌ NÃO auto-importado (precisa configurar)
```

### ⚙️ Configuração para Subpastas

**Adicione ao `nuxt.config.ts`:**

```typescript
export default defineNuxtConfig({
	// Auto-import para cliente (Vue)
	imports: {
		dirs: ["shared/utils/formatters", "shared/utils/validators"],
	},

	// Auto-import para servidor (Nitro)
	nitro: {
		imports: {
			dirs: ["shared/utils/formatters", "shared/utils/validators"],
		},
	},
});
```

### 💡 Uso Prático

**Sem configuração (import manual):**

```typescript
// ❌ Precisa importar manualmente
import { formatCEP } from "#shared/utils/formatters/cep";
import { isValidCPF } from "#shared/utils/validators/document";
```

**Com configuração (auto-import):**

```typescript
// ✅ Funciona automaticamente (sem import)
const formatted = formatCEP("01001000");
const isValid = isValidCPF("123.456.789-00");
```

### 🔄 Cliente + Servidor

**Componente Vue (cliente):**

```vue
<script setup lang="ts">
// ✅ Funciona no cliente
const formatted = formatCurrency(1234.56);
</script>
```

**API Route (servidor):**

```typescript
// ✅ Funciona no servidor
export default defineEventHandler(() => {
	return {
		price: formatCurrency(1234.56),
	};
});
```

### 📚 Documentação Oficial

- [Nuxt 4 - shared/ Directory](https://nuxt.com/docs/4.x/directory-structure/shared)
- [Nuxt 4 - Auto Imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)

---

## 🎨 Tailwind CSS v4

### ✅ PERMITIDO

- **Tailwind CSS v4** com classes utilitárias
- CSS nativo básico (somente quando absolutamente necessário)
- Customizações via **CSS nativo** em `app/assets/css/` (não há mais `tailwind.config.ts`)

### ❌ PROIBIDO

- Sass, SCSS, Less ou qualquer preprocessador
- CSS Modules
- CSS-in-JS
- `lang="scss"` ou `lang="sass"` nos componentes

### Configuração Tailwind v4

**Arquivo:** `app/assets/css/tailwind.css`

```css
@import "tailwindcss";

/* Customizações de tema (substitui tailwind.config.ts) */
@theme {
	/* ⚠️ Use RGB Hexadecimal, não OKLCH (problemas em mobile) */
	--color-primary: #3b82f6;
	--color-secondary: #60a5fa;
	--font-sans: "Inter", system-ui, sans-serif;
	--breakpoint-3xl: 1920px;
}

/* Utilitários customizados */
@utility tab-rounded {
	border-radius: theme(--radius-lg) theme(--radius-lg) 0 0;
}
```

### Exemplo de Componente

```vue
<template>
	<div
		class="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
	>
		<!-- Conteúdo -->
	</div>
</template>

<style scoped>
/* Apenas CSS nativo básico se necessário */
</style>
```

---

## 🔗 Aliases de Importação

### Aliases Oficiais (Configurados Automaticamente)

O Nuxt 4 configura automaticamente aliases para facilitar imports:

| Alias     | Aponta Para | Uso                                    |
| --------- | ----------- | -------------------------------------- |
| `~`       | `/app`      | Arquivos dentro de `app/`              |
| `@`       | `/app`      | Alternativa ao `~`                     |
| `~~`      | `/` (raiz)  | Arquivos na raiz do projeto            |
| `@@`      | `/` (raiz)  | Alternativa ao `~~`                    |
| `#shared` | `/shared`   | Código compartilhado (client + server) |
| `#server` | `/server`   | Código server-side (Nitro)             |

### Quando Usar Cada Alias

**`~` ou `@` - Arquivos em `app/`**

```typescript
// ✅ Correto
import { useAuth } from "~/composables/core/useAuth";
import Button from "~/components/ui/Button.vue";
import { useUserStore } from "~/stores/userStore";

// ✅ Também correto (@ é equivalente)
import Button from "@/components/ui/Button.vue";
```

**`~~` - Arquivos em `shared/` e raiz**

```typescript
// ✅ Correto - shared/
import { formatCEP } from "~~/shared/utils/formatters/cep";
import type { Endereco } from "~~/shared/types/api/cep";
import { API_BASE_URL } from "~~/shared/constants/api";

// ✅ Correto - raiz
import config from "~~/nuxt.config";
import pkg from "~~/package.json";
```

**`#server` - Arquivos em `server/`**

```typescript
// ✅ Correto
import { formatUser } from "#server/utils/formatUser";

// ❌ ERRADO - não use ~~ para server
import { formatUser } from "~~/server/utils/formatUser";
```

### Regras Importantes

- ✅ Use `~` para `app/` (mais comum na comunidade)
- ✅ Use `~~` para `shared/` e arquivos na raiz
- ✅ Use `#server` para `server/` (apenas server-side)
- ❌ Evite caminhos relativos longos (`../../../`)
- ✅ TypeScript e Vite já reconhecem automaticamente

---

## 🧩 Padrão de Componentes Vue

```vue
<template>
	<div class="user-card">
		<UserAvatar :src="user.avatar" :alt="`${user.name} avatar`" />
		<div class="user-info">
			<h3>{{ user.name }}</h3>
			<p>{{ user.email }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { User } from "~/shared/types/entities/User";

/**
 * Props do componente UserCard
 * Exibe informações básicas do usuário com avatar
 */
interface Props {
	user: User;
	showEmail?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showEmail: true,
});

/**
 * Eventos emitidos pelo componente
 */
interface Emits {
	click: [user: User];
	hover: [event: MouseEvent];
}

const emit = defineEmits<Emits>();

// Usar composables para lógica
const { formatUserName } = useUserFormatting();
</script>

<style scoped>
/* Apenas Tailwind CSS */
</style>
```

---

## 🔧 Padrão de Composables

````typescript
/**
 * 📌 useAuth - Composable de Autenticação
 *
 * Fornece funções de autenticação e acesso ao estado do usuário.
 * Usa Supabase Auth internamente.
 *
 * @example
 * ```typescript
 * const { login, logout, user, isAuthenticated } = useAuth()
 * await login({ email: 'user@example.com', password: '123456' })
 * ```
 */
export const useAuth = () => {
	// Estado reativo
	const user = useState<User | null>("auth.user", () => null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Computed
	const isAuthenticated = computed(() => !!user.value);

	// Métodos
	const login = async (credentials: LoginCredentials): Promise<void> => {
		isLoading.value = true;
		error.value = null;

		try {
			// Lógica de login
		} catch (err) {
			error.value = "Erro ao fazer login";
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const logout = async (): Promise<void> => {
		user.value = null;
		await navigateTo("/login");
	};

	// Retorno
	return {
		// Estados (readonly se não devem ser modificados externamente)
		user: readonly(user),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Computed
		isAuthenticated,

		// Métodos
		login,
		logout,
	};
};
````

---

## 📦 Padrão de Stores (Pinia)

```typescript
/**
 * 📌 Store de Usuário
 *
 * Gerencia estado global do usuário autenticado
 */
export const useUserStore = defineStore("user", () => {
	// Estado
	const profile = ref<UserProfile | null>(null);
	const preferences = ref<UserPreferences>({});
	const isLoading = ref(false);

	// Getters (computed)
	const fullName = computed(() => {
		if (!profile.value) return "";
		return `${profile.value.firstName} ${profile.value.lastName}`;
	});

	const hasPermission = computed(() => (permission: string) => {
		return profile.value?.permissions.includes(permission) ?? false;
	});

	// Actions
	const fetchProfile = async () => {
		isLoading.value = true;
		try {
			// Buscar perfil
		} finally {
			isLoading.value = false;
		}
	};

	const updateProfile = async (data: Partial<UserProfile>) => {
		// Atualizar perfil
	};

	const clearProfile = () => {
		profile.value = null;
		preferences.value = {};
	};

	// Retorno
	return {
		// Estado
		profile,
		preferences,
		isLoading,

		// Getters
		fullName,
		hasPermission,

		// Actions
		fetchProfile,
		updateProfile,
		clearProfile,
	};
});
```

---

## 🎯 Convenções de Commit

Use **Conventional Commits**:

```
feat(auth): adicionar login com Google
fix(cart): corrigir cálculo de desconto
docs(readme): atualizar instruções
refactor(user): extrair lógica para composable
style(button): ajustar espaçamento
test(auth): adicionar testes de login
chore(deps): atualizar dependências
```

---

## ✅ Checklist Rápido

Antes de commitar:

- [ ] Código segue estrutura de pastas do projeto?
- [ ] Nomenclatura de arquivos está correta?
- [ ] Usando apenas Tailwind CSS (sem Sass/SCSS)?
- [ ] Usando apenas Composition API (sem Options API)?
- [ ] Props e emits estão tipados?
- [ ] Composables têm prefixo `use`?
- [ ] Sem arquivos `index.ts` para re-exportações?
- [ ] Comentários em português explicando "por quê"?
- [ ] Sem `any` no TypeScript?
- [ ] Utilitários compartilhados estão em `shared/utils/`?
- [ ] Auto-import configurado para subpastas de `shared/utils/`?

---

**Última atualização:** Fevereiro 2026
