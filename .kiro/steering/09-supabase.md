---
inclusion: always
description: Guia essencial do módulo @nuxtjs/supabase para Nuxt 4
---

# Guia Essencial – @nuxtjs/supabase (Nuxt 4)

Este arquivo é um **guia ESPECÍFICO para o módulo @nuxtjs/supabase** em projetos Nuxt 4.  
Sempre siga as decisões e instruções do desenvolvedor do projeto.

📚 **Para princípios universais de código**, consulte:

- [Clean Code](./03-clean-code.md) - Código limpo e legível
- [Princípios SOLID](./04-solid-principles.md) - Design orientado a objetos
- [Princípios de Design](./05-design-principles.md) - DRY, KISS, YAGNI, etc
- [Padrões de Arquitetura](./06-architecture-patterns.md) - Padrões arquiteturais

---

## 1) INSTALAÇÃO

Instale o módulo:

```bash
# Com npm
npx nuxi@latest module add supabase

# Com pnpm
pnpm dlx nuxi@latest module add supabase
```

Configure no `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
	modules: ["@nuxtjs/supabase"],
});
```

---

## 2) VARIÁVEIS DE AMBIENTE (V2+ / JWT SIGNING KEYS)

Crie ou ajuste o arquivo `.env`:

```bash
SUPABASE_URL="https://example.supabase.co"
```

**IMPORTANTE (v2+):**  
`SUPABASE_KEY` agora é a _publishable key_ (não mais a anon key no sentido antigo)

```bash
SUPABASE_KEY="<your_publishable_key>"
```

Para bypass de RLS no servidor (admin):

```bash
SUPABASE_SECRET_KEY="<your_secret_key>"
```

**Legado (DEPRECATED – não use em novos projetos):**

```bash
SUPABASE_SERVICE_KEY="<service_role_key>"
```

**Observação:**  
Você pode usar `NUXT_PUBLIC_` para trabalhar via runtimeConfig  
(ex: `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`)

---

## 3) CONFIGURAÇÃO RECOMENDADA DO MÓDULO

```typescript
export default defineNuxtConfig({
	modules: ["@nuxtjs/supabase"],

	supabase: {
		useSsrCookies: true,

		redirect: true,

		redirectOptions: {
			login: "/login",
			callback: "/confirm",

			include: undefined,
			exclude: [],

			saveRedirectToCookie: false,
		},

		cookieOptions: {
			maxAge: 60 * 60 * 8,
			sameSite: "lax",
			secure: true,
		},

		// cookiePrefix: 'sb-{project-id}-auth-token'
		// types: './app/types/database.types.ts'
		// clientOptions: {}
	},
});
```

**IMPORTANTE SOBRE useSsrCookies:**  
Quando `useSsrCookies = true`, NÃO é possível customizar:

- flowType
- autoRefreshToken
- detectSessionInUrl
- persistSession
- storage

Se precisar disso, use `useSsrCookies = false` (perde SSR automático).

---

## 4) BREAKING CHANGE (V2)

`useSupabaseUser()` NÃO retorna mais o User completo.  
Agora retorna JWT Claims (auth.getClaims).

Se precisar do User completo:  
use `supabase.auth.getUser()`

---

## 5) AUTENTICAÇÃO (PKCE – FLUXO PADRÃO)

O módulo exige duas páginas:

- `/login`
- `/confirm`

Configure no Supabase Dashboard:  
**Authentication > URL Configuration > Redirect URLs**  
Inclua a URL do `/confirm` (dev e produção).

### 5.1) PÁGINA /login (OTP POR EMAIL)

```vue
<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");

async function signInWithOtp() {
	await supabase.auth.signInWithOtp({
		email: email.value,
		options: {
			emailRedirectTo: "http://localhost:3000/confirm",
		},
	});
}
</script>
```

### 5.2) PÁGINA /confirm

```vue
<script setup lang="ts">
const user = useSupabaseUser();

watch(
	user,
	() => {
		if (user.value) {
			navigateTo("/");
		}
	},
	{ immediate: true },
);
</script>
```

### 5.3) REDIRECIONAR PARA ROTA ORIGINAL (COOKIE)

Ative no `nuxt.config.ts`:

```typescript
saveRedirectToCookie: true;
```

No `/confirm`:

```vue
<script setup lang="ts">
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();

watch(
	user,
	() => {
		if (user.value) {
			const path = redirectInfo.pluck();
			navigateTo(path || "/");
		}
	},
	{ immediate: true },
);
</script>
```

---

## 6) RESET DE SENHA

### ETAPA 1 – Solicitar reset:

```typescript
supabase.auth.resetPasswordForEmail(email, {
	redirectTo: "https://example.com/password/update",
});
```

### ETAPA 2 – Atualizar senha:

```typescript
supabase.auth.updateUser({
	password: newPassword,
});
```

**Opcional:**  
Escutar evento `PASSWORD_RECOVERY` via `onAuthStateChange`.

---

## 7) COMPOSABLES PRINCIPAIS (CLIENT)

| Composable                    | Descrição                      |
| ----------------------------- | ------------------------------ |
| `useSupabaseClient()`         | Cliente Supabase (supabase-js) |
| `useSupabaseSession()`        | Sessão reativa                 |
| `useSupabaseUser()`           | JWT claims (v2)                |
| `useSupabaseCookieRedirect()` | Controle manual de redirect    |

---

## 8) MIDDLEWARE DE AUTH (QUANDO redirect = false)

```typescript
export default defineNuxtRouteMiddleware(() => {
	const session = useSupabaseSession();
	if (!session.value) navigateTo("/login");
});
```

Em páginas protegidas:

```typescript
definePageMeta({ middleware: "auth" });
```

---

## 9) SERVER (NITRO) – USO NO BACKEND

**IMPORTANTE:**  
Em SSR com `useFetch`, sempre enviar cookies:

```typescript
headers: useRequestHeaders(["cookie"]);
```

### 9.1) serverSupabaseClient (RESPEITA RLS)

```typescript
const client = await serverSupabaseClient(event);
await client.from("table").select("*");
```

### 9.2) serverSupabaseServiceRole (BYPASS RLS – ADMIN)

Usa `SUPABASE_SECRET_KEY` (recomendado)

```typescript
const client = serverSupabaseServiceRole(event);
await client.from("protected_table").select("*");
```

### 9.3) serverSupabaseUser (USER NO SERVIDOR)

```typescript
const user = await serverSupabaseUser(event);
```

---

## 10) REALTIME (POSTGRES CHANGES)

- Ative Realtime na tabela no Supabase
- Use `client.channel(...).on('postgres_changes', ...)`

---

## 11) TYPESCRIPT – TIPOS DO BANCO

**Local padrão:**

```
app/types/database.types.ts
```

**Gerar tipos (remoto):**

```bash
supabase gen types --lang=typescript --project-id PROJECT_ID > app/types/database.types.ts
```

**Gerar tipos (local):**

```bash
supabase gen types --lang=typescript --local > app/types/database.types.ts
```

---

## 12) CHECKLIST FINAL

- ✅ `SUPABASE_KEY` = publishable key (v2+)
- ✅ `SUPABASE_SECRET_KEY` apenas no servidor
- ✅ Redirect URLs configuradas no dashboard
- ✅ `useSsrCookies` true para SSR
- ✅ `useSupabaseUser` retorna CLAIMS, não User

---

**FIM DO GUIA**
