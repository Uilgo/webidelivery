---
inclusion: auto
description: Guia de Clean Code para desenvolvimento de software com padrões de código limpo
---

# 🧹 Guia de Clean Code

Este guia estabelece padrões de código limpo para desenvolvimento de software.
Aplicável a qualquer projeto TypeScript/JavaScript/Vue/React/Angular.

---

## 📋 ÍNDICE

1. [Nomenclatura](#nomenclatura)
2. [Funções](#funções)
3. [Comentários](#comentários)
4. [Formatação](#formatação)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Constantes e Magic Numbers](#constantes-e-magic-numbers)
7. [TypeScript](#typescript)
8. [Vue/Nuxt Específico](#vuenuxt-específico)
9. [Composables](#composables)
10. [Stores (Pinia)](#stores-pinia)

---

## 1. NOMENCLATURA

### 1.1 Variáveis e Funções

```typescript
// ✅ BOM - camelCase, descritivo
const userProfile = ref<User | null>(null);
const isAuthenticated = computed(() => !!user.value);
const fetchUserData = async () => {
	/* ... */
};

// ❌ RUIM - abreviações, nomes genéricos
const usr = ref(null);
const flag = computed(() => !!user.value);
const getData = async () => {
	/* ... */
};
```

### 1.2 Constantes

```typescript
// ✅ BOM - SCREAMING_SNAKE_CASE, contexto claro
const MAX_LOGIN_ATTEMPTS = 5;
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 horas
const API_BASE_URL = "https://api.example.com";

// ❌ RUIM - camelCase, sem contexto
const maxAttempts = 5;
const timeout = 86400000; // O que é isso?
const url = "https://api.example.com";
```

### 1.3 Tipos e Interfaces

```typescript
// ✅ BOM - PascalCase, sufixo descritivo
interface UserProfile {
	/* ... */
}
type AuthResponse = {
	/* ... */
};
enum UserStatus {
	/* ... */
}

// ❌ RUIM - camelCase, nomes genéricos
interface user {
	/* ... */
}
type response = {
	/* ... */
};
enum status {
	/* ... */
}
```

### 1.4 Componentes Vue

```typescript
// ✅ BOM - PascalCase, nomes compostos
UserProfileCard.vue;
DateRangePicker.vue;
AdminDashboard.vue;

// ❌ RUIM - kebab-case, nomes genéricos
user - card.vue;
picker.vue;
dashboard.vue;
```

### 1.5 Arquivos

```typescript
// ✅ BOM - kebab-case para arquivos, PascalCase para componentes
composables / core / useAuth.ts;
lib / utils / formatCurrency.ts;
components / ui / Button.vue;

// ❌ RUIM - PascalCase para arquivos não-componentes
composables / core / UseAuth.ts;
lib / utils / FormatCurrency.ts;
```

---

## 2. FUNÇÕES

### 2.1 Arrow Functions vs Function Declarations

#### Use Arrow Functions:

```typescript
// ✅ Composables
export const useAuth = () => {
	const login = async (credentials: LoginCredentials) => {
		/* ... */
	};
	return { login };
};

// ✅ Callbacks e event handlers
const handleClick = () => {
	/* ... */
};
const handleSubmit = async (event: Event) => {
	/* ... */
};

// ✅ Métodos de array
const activeUsers = users.filter((user) => user.isActive);
const userNames = users.map((user) => user.name);

// ✅ Computed e watch
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
watch(user, (newUser) => {
	/* ... */
});
```

#### Use Function Declarations:

```typescript
// ✅ Funções top-level exportadas (utilitários)
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

// ✅ Funções que precisam de hoisting
function validateEmail(email: string): boolean {
	// Pode ser chamada antes da declaração
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 2.2 Tamanho de Funções

**REGRA: Máximo 20-30 linhas por função**

```typescript
// ❌ RUIM - Função muito longa (100+ linhas)
const processUserData = async (userId: string) => {
	// Validação (10 linhas)
	// Busca de dados (20 linhas)
	// Transformação (30 linhas)
	// Validação de negócio (20 linhas)
	// Salvamento (20 linhas)
	// Notificações (10 linhas)
};

// ✅ BOM - Funções pequenas e focadas
const validateUserId = (userId: string): boolean => {
	return userId.length > 0 && /^[a-f0-9-]+$/.test(userId);
};

const fetchUserData = async (userId: string): Promise<UserData> => {
	const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

	if (error) throw new Error(error.message);
	return data;
};

const transformUserData = (rawData: RawUserData): UserData => {
	return {
		id: rawData.id,
		name: `${rawData.first_name} ${rawData.last_name}`,
		email: rawData.email.toLowerCase(),
	};
};

const processUserData = async (userId: string): Promise<void> => {
	if (!validateUserId(userId)) {
		throw new Error("ID de usuário inválido");
	}

	const rawData = await fetchUserData(userId);
	const userData = transformUserData(rawData);
	await saveUserData(userData);
	await sendNotification(userData);
};
```

### 2.3 Parâmetros de Funções

**REGRA: Máximo 3 parâmetros. Use objeto para mais.**

```typescript
// ❌ RUIM - Muitos parâmetros
const createUser = (
	name: string,
	email: string,
	password: string,
	role: string,
	isActive: boolean,
	avatar: string,
) => {
	/* ... */
};

// ✅ BOM - Objeto de parâmetros
interface CreateUserParams {
	name: string;
	email: string;
	password: string;
	role: string;
	isActive?: boolean;
	avatar?: string;
}

const createUser = (params: CreateUserParams) => {
	/* ... */
};

// Uso
createUser({
	name: "João",
	email: "joao@example.com",
	password: "senha123",
	role: "admin",
});
```

### 2.4 Retorno de Funções

```typescript
// ✅ BOM - Retorno explícito e tipado
const calculateTotal = (items: CartItem[]): number => {
	return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ BOM - Early return para validações
const processPayment = async (payment: Payment): Promise<PaymentResult> => {
	if (!payment.amount || payment.amount <= 0) {
		return { success: false, error: "Valor inválido" };
	}

	if (!payment.method) {
		return { success: false, error: "Método de pagamento não informado" };
	}

	// Lógica principal
	const result = await chargePayment(payment);
	return { success: true, data: result };
};

// ❌ RUIM - Múltiplos níveis de if/else
const processPayment = async (payment: Payment) => {
	if (payment.amount && payment.amount > 0) {
		if (payment.method) {
			const result = await chargePayment(payment);
			return { success: true, data: result };
		} else {
			return { success: false, error: "Método não informado" };
		}
	} else {
		return { success: false, error: "Valor inválido" };
	}
};
```

---

## 3. COMENTÁRIOS

### 3.1 Quando Comentar

**COMENTE:**

- Por quê (não o quê)
- Decisões de design
- Workarounds temporários
- Avisos importantes
- Documentação de API pública

**NÃO COMENTE:**

- Código óbvio
- Código que pode ser melhorado
- Código comentado (delete!)

```typescript
// ❌ RUIM - Comenta o óbvio
// Incrementa o contador
counter++;

// Verifica se o usuário está ativo
if (user.isActive) {
	/* ... */
}

// ✅ BOM - Explica o "por quê"
// Aguarda 100ms para evitar race condition com o Supabase Realtime
await new Promise((resolve) => setTimeout(resolve, 100));

// Usa COALESCE para atualizar apenas campos modificados (padrão do projeto)
const { error } = await supabase.rpc("fn_rpc_atualizar_produto", {
	p_nome: nome || null, // null = não atualizar
});

// HACK: Supabase v2 não retorna User completo, apenas JWT Claims
// TODO: Remover quando Supabase v3 for lançado
const userId = user.value.sub;
```

### 3.2 Documentação de Funções

````typescript
/**
 * 📌 useAuth - Composable de Autenticação
 *
 * Fornece funções de autenticação e acesso ao estado do perfil.
 * Usa o store de perfil internamente para gerenciar o estado.
 *
 * @example
 * ```typescript
 * const { login, logout, isAuthenticated } = useAuth();
 *
 * await login({ email: 'user@example.com', password: '123456' });
 * ```
 *
 * @returns Objeto com funções e estados de autenticação
 *
 * IMPORTANTE: Todo CUD é feito via RPC (SECURITY DEFINER)
 */
export const useAuth = () => {
	// ...
};

/**
 * Valida se um email está no formato correto
 *
 * @param email - Email a ser validado
 * @returns true se válido, false caso contrário
 *
 * @example
 * ```typescript
 * validateEmail('user@example.com') // true
 * validateEmail('invalid-email') // false
 * ```
 */
export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
````

---

## 4. FORMATAÇÃO

### 4.1 Indentação

- **2 espaços** (padrão Nuxt/Vue)
- Sem tabs

### 4.2 Linhas em Branco

```typescript
// ✅ BOM - Linhas em branco separam blocos lógicos
const fetchUserData = async (userId: string) => {
	// Validação
	if (!userId) {
		throw new Error("ID obrigatório");
	}

	// Busca de dados
	const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

	// Tratamento de erro
	if (error) {
		console.error("Erro ao buscar usuário:", error);
		throw new Error(error.message);
	}

	return data;
};

// ❌ RUIM - Sem separação visual
const fetchUserData = async (userId: string) => {
	if (!userId) {
		throw new Error("ID obrigatório");
	}
	const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
	if (error) {
		console.error("Erro ao buscar usuário:", error);
		throw new Error(error.message);
	}
	return data;
};
```

### 4.3 Comprimento de Linha

**REGRA: Máximo 100 caracteres**

```typescript
// ✅ BOM - Quebra de linha em 100 caracteres
const result = await supabase
	.from("produtos")
	.select("id, nome, preco, categoria_id, loja_id")
	.eq("loja_id", lojaId)
	.is("deleted_at", null)
	.order("nome");

// ❌ RUIM - Linha muito longa
const result = await supabase
	.from("produtos")
	.select("id, nome, preco, categoria_id, loja_id")
	.eq("loja_id", lojaId)
	.is("deleted_at", null)
	.order("nome");
```

---

## 5. TRATAMENTO DE ERROS

### 5.1 Try/Catch

```typescript
// ✅ BOM - Try/catch com mensagens claras
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
	try {
		const { error } = await supabase.auth.signInWithPassword({
			email: credentials.email,
			password: credentials.password,
		});

		if (error) {
			console.error("Erro no login:", error);
			return {
				success: false,
				error: error.message || "Erro ao fazer login",
			};
		}

		return { success: true };
	} catch (err) {
		console.error("Erro inesperado no login:", err);
		return {
			success: false,
			error: "Erro inesperado ao fazer login",
		};
	}
};

// ❌ RUIM - Engole erro silenciosamente
const login = async (credentials: LoginCredentials) => {
	try {
		await supabase.auth.signInWithPassword(credentials);
	} catch (err) {
		// Nada aqui - erro perdido!
	}
};
```

### 5.2 Validação de Entrada

```typescript
// ✅ BOM - Validação explícita com early return
const updateUser = async (userId: string, data: UpdateUserData) => {
	if (!userId) {
		throw new Error("ID do usuário é obrigatório");
	}

	if (!data.name && !data.email) {
		throw new Error("Pelo menos um campo deve ser atualizado");
	}

	// Lógica principal
	return await supabase.from("users").update(data).eq("id", userId);
};

// ❌ RUIM - Validação aninhada
const updateUser = async (userId: string, data: UpdateUserData) => {
	if (userId) {
		if (data.name || data.email) {
			return await supabase.from("users").update(data).eq("id", userId);
		} else {
			throw new Error("Pelo menos um campo deve ser atualizado");
		}
	} else {
		throw new Error("ID do usuário é obrigatório");
	}
};
```

---

## 6. CONSTANTES E MAGIC NUMBERS

### 6.1 Extrair Magic Numbers

```typescript
// ❌ RUIM - Magic numbers
const sessionExpiresCookie = useCookie("session_expires_at", {
	maxAge: 172800, // O que é isso?
});

const maxAttempts = 50; // Por que 50?
await new Promise((resolve) => setTimeout(resolve, 100)); // Por que 100?

// ✅ BOM - Constantes com nomes descritivos
const SESSION_COOKIE_MAX_AGE_SECONDS = 2 * 24 * 60 * 60; // 2 dias
const MAX_PROFILE_LOAD_ATTEMPTS = 50;
const PROFILE_LOAD_RETRY_DELAY_MS = 100;

const sessionExpiresCookie = useCookie("session_expires_at", {
	maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
});

let attempts = 0;
while (attempts < MAX_PROFILE_LOAD_ATTEMPTS) {
	await new Promise((resolve) => setTimeout(resolve, PROFILE_LOAD_RETRY_DELAY_MS));
	attempts++;
}
```

### 6.2 Arquivo de Constantes

```typescript
// ✅ shared/constants/time.ts
export const TIME = {
	ONE_SECOND_MS: 1000,
	ONE_MINUTE_MS: 60 * 1000,
	ONE_HOUR_MS: 60 * 60 * 1000,
	ONE_DAY_MS: 24 * 60 * 60 * 1000,
	ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

export const SESSION = {
	DEFAULT_DURATION_MS: TIME.ONE_DAY_MS,
	REMEMBER_ME_DURATION_MS: 365 * TIME.ONE_DAY_MS,
	COOKIE_MAX_AGE_SECONDS: 2 * 24 * 60 * 60,
} as const;

// ✅ Uso
import { SESSION } from "~/shared/constants/time";

const expiresAt = Date.now() + SESSION.DEFAULT_DURATION_MS;
```

---

## 7. TYPESCRIPT

### 7.1 Tipagem Explícita

```typescript
// ✅ BOM - Tipos explícitos
const user = ref<User | null>(null);
const isLoading = ref<boolean>(false);
const items = ref<Product[]>([]);

const fetchUser = async (id: string): Promise<User> => {
	// ...
};

// ⚠️ ACEITÁVEL - Inferência óbvia
const count = ref(0); // TypeScript infere number
const name = ref("João"); // TypeScript infere string

// ❌ RUIM - any
const data: any = await fetchData(); // NUNCA use any!
```

### 7.2 Type Guards

```typescript
// ✅ BOM - Type guard para validação
const isUser = (value: unknown): value is User => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"name" in value &&
		"email" in value
	);
};

// Uso
const processData = (data: unknown) => {
	if (!isUser(data)) {
		throw new Error("Dados inválidos");
	}

	// TypeScript sabe que data é User aqui
	console.log(data.name);
};
```

### 7.3 Evitar Type Assertions

```typescript
// ❌ RUIM - Type assertion sem validação
const user = data as User; // Perigoso!

// ✅ BOM - Validação antes de usar
if (!isUser(data)) {
	throw new Error("Dados inválidos");
}
const user = data; // TypeScript infere User
```

---

## 8. VUE/NUXT ESPECÍFICO

### 8.1 Composition API

**OBRIGATÓRIO: Usar apenas Composition API**

```typescript
// ✅ BOM - Composition API
<script setup lang="ts">
const count = ref(0);
const doubled = computed(() => count.value * 2);

const increment = () => {
  count.value++;
};
</script>

// ❌ PROIBIDO - Options API
<script lang="ts">
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  }
}
</script>
```

### 8.2 Props e Emits

```typescript
// ✅ BOM - Props e emits tipados
<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Digite aqui',
  disabled: false,
});

interface Emits {
  'update:modelValue': [value: string];
  submit: [data: FormData];
}

const emit = defineEmits<Emits>();
</script>

// ❌ RUIM - Props sem tipos
<script setup>
const props = defineProps(['modelValue', 'placeholder', 'disabled']);
const emit = defineEmits(['update:modelValue', 'submit']);
</script>
```

### 8.3 Computed vs Methods

```typescript
// ✅ BOM - Computed para valores derivados (cache automático)
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
const isValid = computed(() => email.value.includes("@"));

// ✅ BOM - Methods para ações
const handleSubmit = () => {
	emit("submit", formData.value);
};

// ❌ RUIM - Method para valor derivado (sem cache)
const getFullName = () => `${firstName.value} ${lastName.value}`;
```

---

## 9. COMPOSABLES

### 9.1 Estrutura

```typescript
/**
 * 📌 useFeatureName - Descrição breve
 *
 * Descrição detalhada do que o composable faz.
 *
 * @param param1 - Descrição do parâmetro
 * @returns Objeto com estados e funções
 */
export const useFeatureName = (param1: Type) => {
	// 1. Estados reativos
	const state = ref<Type>(initialValue);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// 2. Computed properties
	const derivedValue = computed(() => {
		return state.value.transform();
	});

	// 3. Funções
	const fetchData = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			// Lógica
		} catch (err) {
			error.value = "Erro ao buscar dados";
		} finally {
			isLoading.value = false;
		}
	};

	// 4. Lifecycle (se necessário)
	onMounted(() => {
		fetchData();
	});

	// 5. Retorno
	return {
		// Estados (readonly se não devem ser modificados externamente)
		state: readonly(state),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Computed
		derivedValue,

		// Funções
		fetchData,
	};
};
```

### 9.2 Nomenclatura

```typescript
// ✅ BOM - Prefixo "use" + PascalCase
useAuth.ts;
useWhitelabelFilters.ts;
usePeriodoSelector.ts;

// ❌ RUIM - Sem prefixo ou kebab-case
auth.ts;
whitelabel - filters.ts;
periodo.ts;
```

---

## 10. STORES (PINIA)

### 10.1 Estrutura

```typescript
/**
 * 📌 Store de Feature
 *
 * Descrição do que o store gerencia.
 */
export const useFeatureStore = defineStore("feature", () => {
	// 1. Estado
	const items = ref<Item[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// 2. Getters (computed)
	const activeItems = computed(() => {
		return items.value.filter((item) => item.isActive);
	});

	const itemCount = computed(() => items.value.length);

	// 3. Actions
	const fetchItems = async () => {
		isLoading.value = true;
		error.value = null;

		try {
			const { data, error: fetchError } = await supabase.from("items").select("*");

			if (fetchError) throw fetchError;

			items.value = data;
		} catch (err) {
			console.error("Erro ao buscar items:", err);
			error.value = "Erro ao carregar dados";
		} finally {
			isLoading.value = false;
		}
	};

	const addItem = async (item: CreateItemData) => {
		// Lógica
	};

	const clearItems = () => {
		items.value = [];
		error.value = null;
	};

	// 4. Retorno
	return {
		// Estado
		items,
		isLoading,
		error,

		// Getters
		activeItems,
		itemCount,

		// Actions
		fetchItems,
		addItem,
		clearItems,
	};
});
```

---

## 📊 CHECKLIST DE REVISÃO

Antes de fazer commit, verifique:

- [ ] Nomes descritivos (variáveis, funções, tipos)
- [ ] Funções pequenas (máximo 20-30 linhas)
- [ ] Máximo 3 parâmetros por função
- [ ] Comentários explicam "por quê", não "o quê"
- [ ] Sem magic numbers (use constantes)
- [ ] Tipagem explícita (sem `any`)
- [ ] Try/catch com logs claros
- [ ] Early return para validações
- [ ] Composition API (não Options API)
- [ ] Props e emits tipados
- [ ] Composables com prefixo "use"
- [ ] Linhas com máximo 100 caracteres

---

## 🎯 PRIORIDADES

### P0 (Crítico - Sempre aplicar)

- ✅ Sem `any` (use `unknown` + type guards)
- ✅ Tipagem explícita em funções públicas
- ✅ Try/catch com logs
- ✅ Composition API (não Options API)

### P1 (Importante - Aplicar sempre que possível)

- ✅ Funções pequenas (20-30 linhas)
- ✅ Constantes para magic numbers
- ✅ Comentários úteis
- ✅ Early return

### P2 (Desejável - Aplicar quando fizer sentido)

- ✅ Extrair validações
- ✅ Extrair transformações
- ✅ Documentação JSDoc completa

---

**Última atualização:** Fevereiro 2026
