---
inclusion: auto
description: Guia universal para criar e manter um Design System escalável e consistente
---

# 🎨 Design System - Guia Completo

Guia universal para criar e manter um Design System escalável e consistente.
Aplicável a qualquer projeto web moderno.

---

## 📋 ÍNDICE

1. [Fundamentos](#fundamentos)
2. [Design Tokens](#design-tokens)
3. [Sistema de Cores](#sistema-de-cores)
4. [Tipografia](#tipografia)
5. [Espaçamento](#espaçamento)
6. [Componentes](#componentes)
7. [Arquitetura CSS](#arquitetura-css)
8. [Boas Práticas](#boas-práticas)
9. [Checklist](#checklist)

---

## 1️⃣ FUNDAMENTOS

### O que é um Design System?

> "Coleção de componentes reutilizáveis, guiados por padrões claros, que podem ser montados para construir aplicações"

### Objetivos

- ✅ **Consistência** - Mesma aparência em toda aplicação
- ✅ **Escalabilidade** - Fácil adicionar novos componentes
- ✅ **Manutenibilidade** - Alterar 1 lugar → muda tudo
- ✅ **Produtividade** - Desenvolvedores trabalham mais rápido
- ✅ **Qualidade** - Menos bugs visuais

### Princípios

1. **DRY (Don't Repeat Yourself)** - Variáveis CSS para cores/espaçamentos
2. **KISS (Keep It Simple)** - Lógica de classes dentro dos componentes
3. **Separation of Concerns** - Tokens → Componentes → Aplicação
4. **Convention Over Configuration** - Padrões sensatos por padrão

---

## 2️⃣ DESIGN TOKENS

### O que são Design Tokens?

Valores primitivos que definem o visual do sistema (cores, espaçamentos, fontes, etc).

### Estrutura de Tokens

```
Design Tokens (Primitivos)
    ↓
Variáveis Semânticas (Contextuais)
    ↓
Componentes (Aplicação)
```

### Exemplo Prático

**Arquivo:** `tokens.css`

```css
@theme {
	/* Cores Primitivas (RGB Hexadecimal - suporte universal) */
	--color-brand-50: #fff5ed;
	--color-brand-500: #ff6b00;
	--color-brand-900: #732700;

	/* Espaçamentos */
	--spacing-xs: 0.5rem; /* 8px */
	--spacing-sm: 0.75rem; /* 12px */
	--spacing-md: 1rem; /* 16px */
	--spacing-lg: 1.5rem; /* 24px */
	--spacing-xl: 2rem; /* 32px */

	/* Raios de Borda */
	--radius-sm: 0.375rem; /* 6px */
	--radius-md: 0.5rem; /* 8px */
	--radius-lg: 0.75rem; /* 12px */
	--radius-full: 9999px;

	/* Sombras */
	--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
	--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

**Arquivo:** `variables.css`

```css
:root {
	/* Variáveis Semânticas (Light Mode) */
	--primary: var(--color-brand-500);
	--primary-hover: var(--color-brand-600);
	--primary-foreground: var(--color-neutral-50);

	--bg-page: var(--color-neutral-100);
	--bg-surface: var(--color-neutral-50);
	--text-primary: var(--color-neutral-900);
}

.dark {
	/* Dark Mode Overrides */
	--bg-page: var(--color-neutral-950);
	--bg-surface: var(--color-neutral-900);
	--text-primary: var(--color-neutral-100);
}
```

### Benefícios

- ✅ Alterar 1 token → muda em toda aplicação
- ✅ Dark mode automático
- ✅ Temas customizáveis
- ✅ Consistência garantida

---

## 3️⃣ SISTEMA DE CORES

### Paleta de Cores

**Recomendação:** 7 cores semânticas + 1 neutra

1. **Primary** - Ação principal, marca
2. **Secondary** - Ação secundária
3. **Success** - Sucesso, confirmação
4. **Warning** - Aviso, atenção
5. **Error** - Erro, perigo
6. **Info** - Informação
7. **Neutral** - Texto, bordas, fundos

### Escala de Cores

Cada cor deve ter **11 tons** (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950):

```css
/* ✅ RECOMENDADO - RGB Hexadecimal (Suporte Universal) */
:root {
	/* Primary (Brand) - 11 tons */
	--color-brand-50: #fff5ed; /* Muito claro */
	--color-brand-100: #ffe8d5;
	--color-brand-200: #ffd0aa;
	--color-brand-300: #ffb074;
	--color-brand-400: #ff8a3c;
	--color-brand-500: #ff6b00; /* Base */
	--color-brand-600: #e65100;
	--color-brand-700: #bf4100;
	--color-brand-800: #993400;
	--color-brand-900: #732700;
	--color-brand-950: #4d1a00; /* Muito escuro */
}
```

### Por que RGB Hexadecimal ao invés de OKLCH?

**OKLCH é o futuro**, mas ainda não é recomendado para produção:

#### ❌ Problemas do OKLCH

1. **Suporte Limitado de Navegadores**
   - Chrome 111+ (Mar 2023)
   - Safari 16.4+ (Mar 2023)
   - Firefox 113+ (Mai 2023)
   - Navegadores antigos ignoram completamente

2. **🚨 CRÍTICO: Problemas em Mobile**
   - Navegadores mobile (iOS Safari, Chrome Android) têm suporte inconsistente
   - Layouts quebram completamente em dispositivos mais antigos
   - Cores aparecem pretas/brancas (fallback padrão)
   - **Testado em produção: OKLCH causa erros de layout em mobile!**

3. **Performance**
   - Parsing mais lento que RGB
   - Conversão adicional no navegador

4. **Debugging Difícil**
   - DevTools não mostram preview visual
   - Difícil identificar cores rapidamente

#### ✅ Vantagens do RGB Hexadecimal

1. **Suporte Universal** - Funciona desde 1996 (100% dos navegadores)
2. **Mobile-First** - Funciona perfeitamente em todos os dispositivos mobile
3. **Performance** - Parsing instantâneo
4. **Ferramentas** - Todos os color pickers suportam
5. **Debugging** - Preview visual no DevTools
6. **Sem Surpresas** - Não depende de feature flags

#### 🎯 Quando Usar OKLCH?

Use OKLCH **apenas** quando:

- ✅ Projeto interno (controla versões de navegadores)
- ✅ Desktop-only (sem mobile)
- ✅ Aplicação moderna (Chrome/Edge/Safari/Firefox atualizados)
- ✅ Precisa de gamut P3 (cores vibrantes para displays modernos)
- ✅ Manipulação programática de cores (gerar tons automaticamente)

**Para SaaS público com mobile:** RGB Hexadecimal é a única escolha segura! 🎯

### Ferramentas

- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind CSS Color Generator](https://uicolors.app/create)

### Uso em Componentes

```vue
<script setup lang="ts">
const buttonClasses = computed(() => {
	const classes = [];

	// Usa variáveis CSS (não cores diretas!)
	if (props.color === "primary") {
		classes.push(
			"bg-[var(--primary)]",
			"text-[var(--primary-foreground)]",
			"hover:bg-[var(--primary-hover)]",
		);
	}

	return classes;
});
</script>
```

---

## 4️⃣ TIPOGRAFIA

### Escala Tipográfica

Use escala modular (1.25 - Major Third):

```css
@theme {
	/* Família de Fontes */
	--font-sans: "Inter", system-ui, -apple-system, sans-serif;
	--font-mono: "JetBrains Mono", "Fira Code", monospace;

	/* Tamanhos (escala 1.25) */
	--text-xs: 0.75rem; /* 12px */
	--text-sm: 0.875rem; /* 14px */
	--text-base: 1rem; /* 16px */
	--text-lg: 1.125rem; /* 18px */
	--text-xl: 1.25rem; /* 20px */
	--text-2xl: 1.5rem; /* 24px */
	--text-3xl: 1.875rem; /* 30px */
	--text-4xl: 2.25rem; /* 36px */
	--text-5xl: 3rem; /* 48px */

	/* Pesos */
	--font-light: 300;
	--font-normal: 400;
	--font-medium: 500;
	--font-semibold: 600;
	--font-bold: 700;

	/* Line Heights */
	--leading-tight: 1.25;
	--leading-normal: 1.5;
	--leading-relaxed: 1.75;
}
```

### Hierarquia Tipográfica

```
H1 - text-4xl (36px) - font-bold
H2 - text-3xl (30px) - font-bold
H3 - text-2xl (24px) - font-semibold
H4 - text-xl (20px) - font-semibold
H5 - text-lg (18px) - font-medium
H6 - text-base (16px) - font-medium
Body - text-base (16px) - font-normal
Small - text-sm (14px) - font-normal
Caption - text-xs (12px) - font-normal
```

### Boas Práticas

- ✅ Máximo 3 pesos de fonte (normal, medium, bold)
- ✅ Line-height maior para textos longos (1.75)
- ✅ Line-height menor para títulos (1.25)
- ✅ Contraste mínimo WCAG AA (4.5:1 para texto normal)

---

## 5️⃣ ESPAÇAMENTO

### Escala de Espaçamento

Use múltiplos de 4px (base 0.25rem):

```css
@theme {
	--spacing-0: 0;
	--spacing-px: 1px;
	--spacing-0-5: 0.125rem; /* 2px */
	--spacing-1: 0.25rem; /* 4px */
	--spacing-2: 0.5rem; /* 8px */
	--spacing-3: 0.75rem; /* 12px */
	--spacing-4: 1rem; /* 16px */
	--spacing-5: 1.25rem; /* 20px */
	--spacing-6: 1.5rem; /* 24px */
	--spacing-8: 2rem; /* 32px */
	--spacing-10: 2.5rem; /* 40px */
	--spacing-12: 3rem; /* 48px */
	--spacing-16: 4rem; /* 64px */
	--spacing-20: 5rem; /* 80px */
	--spacing-24: 6rem; /* 96px */
}
```

### Uso Semântico

```css
:root {
	/* Espaçamentos Semânticos */
	--space-component-xs: var(--spacing-2); /* 8px - padding interno pequeno */
	--space-component-sm: var(--spacing-3); /* 12px - padding interno médio */
	--space-component-md: var(--spacing-4); /* 16px - padding interno padrão */
	--space-component-lg: var(--spacing-6); /* 24px - padding interno grande */

	--space-section-sm: var(--spacing-8); /* 32px - espaço entre seções pequeno */
	--space-section-md: var(--spacing-12); /* 48px - espaço entre seções médio */
	--space-section-lg: var(--spacing-16); /* 64px - espaço entre seções grande */
}
```

### Regras de Espaçamento

1. **Consistência** - Use sempre a escala, nunca valores arbitrários
2. **Hierarquia** - Mais espaço = mais separação visual
3. **Respiração** - Componentes precisam de espaço para "respirar"
4. **Alinhamento** - Use grid de 4px para alinhar elementos

### Regra de Arredondamento de Bordas Aninhadas

Quando um componente está dentro de outro e ambos têm bordas arredondadas, o **interno deve ter raio MENOR** que o externo para manter consistência visual.

**Fórmula Matemática:**

```
Raio Externo = Raio Interno + Padding
```

**Exemplo Prático:**

```css
/* Container externo com padding de 24px (1.5rem) */
.card {
	border-radius: var(--radius-xl); /* 16px */
	padding: 1.5rem; /* 24px */
}

/* Elemento interno */
.card-inner {
	border-radius: var(--radius-md); /* 8px */
	/* 16px (externo) ≈ 8px (interno) + 8px (metade do padding) */
}
```

**Escala Recomendada:**

| Contexto               | Raio Externo | Padding | Raio Interno |
| ---------------------- | ------------ | ------- | ------------ |
| Card > Button          | 12px (lg)    | 24px    | 8px (md)     |
| Modal > Card           | 16px (xl)    | 24px    | 12px (lg)    |
| Drawer > Section       | 0px (sem)    | 24px    | 12px (lg)    |
| BottomSheet > Card     | 16px (xl)    | 16px    | 8px (md)     |
| Alert > Icon Container | 8px (md)     | 12px    | 6px (sm)     |

**Por que isso importa?**

- ✅ Mantém curvatura visual consistente
- ✅ Evita cantos "estranhos" ou desalinhados
- ✅ Cria hierarquia visual clara
- ❌ Usar mesmo raio = visual "achatado" e amador

**Ferramentas:**

- [Nested Border Radius Calculator](https://web-toolbox.dev/en/tools/nested-border-radius-calculator)
- [Alien Fusion Calculator](https://alienfusiongenerator.com/nested-border-radius-calculator/)

---

## 6️⃣ COMPONENTES

### Anatomia de um Componente

Todo componente deve ter:

1. **Variantes** - Diferentes estilos visuais (solid, outline, ghost)
2. **Cores** - Cores semânticas (primary, success, error)
3. **Tamanhos** - Diferentes dimensões (xs, sm, md, lg, xl)
4. **Estados** - Interações (hover, active, disabled, loading)

### Exemplo: Button Component

```vue
<script setup lang="ts">
type ButtonVariant = "solid" | "outline" | "soft" | "ghost" | "link";
type ButtonColor = "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface Props {
	variant?: ButtonVariant;
	color?: ButtonColor;
	size?: ButtonSize;
	disabled?: boolean;
	loading?: boolean;
	block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "solid",
	color: "primary",
	size: "md",
});

// Lógica de classes DENTRO do componente (KISS)
const buttonClasses = computed(() => {
	const classes = [];

	// Base (sempre aplicadas)
	classes.push(
		"inline-flex",
		"items-center",
		"justify-center",
		"font-medium",
		"transition-all",
		"duration-200",
	);

	// Tamanhos (Tailwind utilities)
	const sizeMap = {
		xs: ["px-3", "py-1.5", "text-xs", "rounded-md"],
		sm: ["px-4", "py-2", "text-sm", "rounded-md"],
		md: ["px-6", "py-2.5", "text-base", "rounded-lg"],
		lg: ["px-8", "py-3", "text-lg", "rounded-lg"],
		xl: ["px-10", "py-4", "text-xl", "rounded-xl"],
	};
	classes.push(...sizeMap[props.size]);

	// Variantes + Cores (Variáveis CSS)
	if (props.variant === "solid") {
		const colorMap = {
			primary: [
				"bg-[var(--primary)]",
				"text-[var(--primary-foreground)]",
				"hover:bg-[var(--primary-hover)]",
			],
			success: [
				"bg-[var(--success)]",
				"text-[var(--success-foreground)]",
				"hover:bg-[var(--success-hover)]",
			],
			error: [
				"bg-[var(--error)]",
				"text-[var(--error-foreground)]",
				"hover:bg-[var(--error-hover)]",
			],
			// ... outras cores
		};
		classes.push(...colorMap[props.color]);
	}

	if (props.variant === "outline") {
		const colorMap = {
			primary: [
				"bg-transparent",
				"text-[var(--primary)]",
				"border-2",
				"border-[var(--primary)]",
				"hover:bg-[var(--primary-light)]",
			],
			// ... outras cores
		};
		classes.push(...colorMap[props.color]);
	}

	// Estados
	if (props.disabled || props.loading) {
		classes.push("opacity-50", "cursor-not-allowed", "pointer-events-none");
	}

	if (props.block) {
		classes.push("w-full");
	}

	return classes;
});
</script>

<template>
	<button :class="buttonClasses" :disabled="disabled || loading">
		<Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
		<slot />
	</button>
</template>
```

### Componentes Essenciais

Lista mínima de componentes para um Design System:

#### Inputs & Forms

1. **Button** - 5 variantes × 7 cores × 5 tamanhos = 175 combinações
2. **Input** - Text, email, password, number, tel, url
3. **Textarea** - Texto multilinha
4. **Select** - Seleção de opções nativa
5. **SelectMenu** - Seleção customizada com busca
6. **Checkbox** - Seleção múltipla
7. **RadioGroup** - Seleção única
8. **Switch** - Toggle on/off
9. **Form** - Container de formulário
10. **FormField** - Campo de formulário com label/erro
11. **RangeSlider** - Seletor de intervalo numérico

#### Feedback

12. **Alert** - Mensagens de feedback (info, success, warning, error)
13. **Toast** - Notificações temporárias
14. **Toaster** - Container de toasts
15. **Badge** - Etiquetas e status
16. **Skeleton** - Loading states

#### Layout

17. **Card** - Container de conteúdo
18. **Divider** - Separador visual
19. **Modal** - Diálogo sobreposto
20. **Drawer** - Painel lateral
21. **BottomSheet** - Painel inferior (mobile)
22. **Collapse** - Conteúdo expansível

#### Navigation

23. **Tabs** - Navegação por abas
24. **Dropdown** - Menu suspenso
25. **Tooltip** - Dica contextual

#### Data Display

26. **Avatar** - Foto de perfil
27. **EmptyState** - Estado vazio
28. **ModeToggle** - Toggle dark/light mode

#### Pickers & Uploads

29. **DatePicker** - Seletor de data
30. **DateRangePicker** - Seletor de intervalo de datas
31. **ColorPicker** - Seletor de cores
32. **AvatarUpload** - Upload de avatar com crop
33. **PictureUpload** - Upload de imagens
34. **PeriodoSelector** - Seletor de período customizado

**Total:** 34 componentes organizados em 6 categorias

### Padrão de Nomenclatura

```
ComponentName.vue
├── Props: variant, color, size, disabled, loading
├── Emits: click, change, submit
├── Slots: default, leading, trailing
└── Classes: computed com lógica interna
```

---

## 7️⃣ ARQUITETURA CSS

### Estrutura de Arquivos

```
app/assets/css/
├── main.css              # Imports principais
├── base/
│   ├── tokens.css       # Design tokens (@theme)
│   ├── variables.css    # Variáveis semânticas (light/dark)
│   └── global.css       # Estilos globais (body, scrollbar)
└── themes/
    └── custom-theme.css # Temas customizáveis (opcional)
```

### main.css

```css
/* Importação do Tailwind CSS v4 */
@import "tailwindcss";

/* Dark Mode */
@variant dark (&:where(.dark, .dark *));

/* Base */
@import "./base/tokens.css";
@import "./base/variables.css";
@import "./base/global.css";

/* Themes (opcional) */
@import "./themes/custom-theme.css";
```

### Princípios da Arquitetura

1. **Sem CSS Customizado de Componentes** - Lógica dentro dos componentes Vue
2. **Variáveis CSS para Cores** - Centralização e dark mode automático
3. **Tailwind para Layout** - Utilities para spacing, sizing, flexbox
4. **Tokens Primitivos** - Valores base imutáveis
5. **Variáveis Semânticas** - Contexto e significado

### Quando Usar CSS Customizado

Use CSS customizado APENAS para:

- ✅ Estilos globais (body, scrollbar)
- ✅ Animações complexas (@keyframes)
- ✅ Resets específicos
- ❌ **NUNCA** para componentes (use Tailwind + variáveis)

---

## 8️⃣ BOAS PRÁTICAS

### Design

1. **Consistência Visual**
   - Use sempre a escala de cores/espaçamentos
   - Mantenha hierarquia tipográfica
   - Alinhamento em grid de 4px

2. **Acessibilidade (WCAG AA)**
   - Contraste mínimo 4.5:1 para texto
   - Contraste mínimo 3:1 para componentes
   - Navegação por teclado
   - Labels em inputs
   - Estados de foco visíveis

3. **Performance**
   - Lazy-load de componentes pesados
   - Otimização de imagens
   - CSS mínimo (~150 linhas vs ~1000)

### Desenvolvimento

1. **Lógica de Classes**
   - ✅ Dentro do componente (KISS)
   - ❌ Composables separados (YAGNI)
   - ✅ Computed properties para reatividade

2. **Variáveis CSS**
   - ✅ Sempre use variáveis para cores
   - ✅ Formato: `bg-[var(--primary)]`
   - ❌ Nunca cores diretas: `bg-blue-500`

3. **TypeScript**
   - ✅ Props tipadas
   - ✅ Enums para variantes/cores/tamanhos
   - ❌ Nunca `any`

4. **Documentação**
   - Documente props e emits
   - Exemplos de uso
   - Storybook (opcional)

### Manutenção

1. **Versionamento**
   - Semantic versioning (1.0.0)
   - Changelog de mudanças
   - Breaking changes documentadas

2. **Testes**
   - Testes visuais (Chromatic/Percy)
   - Testes de acessibilidade (axe)
   - Testes unitários de lógica

3. **Evolução**
   - Adicione componentes conforme necessidade (YAGNI)
   - Refatore quando tiver 3+ casos similares (DRY)
   - Mantenha simplicidade (KISS)

---

## 9️⃣ CHECKLIST

### Checklist de Criação

#### Fase 1: Fundamentos

- [ ] Definir paleta de cores (7 cores × 11 tons)
- [ ] Criar tokens.css com cores OKLCH
- [ ] Criar variables.css com variáveis semânticas
- [ ] Configurar dark mode
- [ ] Definir escala tipográfica
- [ ] Definir escala de espaçamento
- [ ] Criar global.css com estilos base
- [ ] Documentar regra de arredondamento de bordas aninhadas

#### Fase 2: Inputs & Forms (11 componentes)

- [ ] Button (5 variantes × 7 cores × 5 tamanhos)
- [ ] Input (text, email, password, number, tel, url)
- [ ] Textarea
- [ ] Select (nativo)
- [ ] SelectMenu (customizado com busca)
- [ ] Checkbox
- [ ] RadioGroup
- [ ] Switch
- [ ] Form (container)
- [ ] FormField (label + erro)
- [ ] RangeSlider

#### Fase 3: Feedback (5 componentes)

- [ ] Alert (4 variantes)
- [ ] Toast (5 cores)
- [ ] Toaster (container)
- [ ] Badge (3 variantes × 7 cores)
- [ ] Skeleton (3 variantes)

#### Fase 4: Layout (6 componentes)

- [ ] Card (3 variantes)
- [ ] Divider
- [ ] Modal
- [ ] Drawer
- [ ] BottomSheet
- [ ] Collapse

#### Fase 5: Navigation (3 componentes)

- [ ] Tabs
- [ ] Dropdown
- [ ] Tooltip

#### Fase 6: Data Display (3 componentes)

- [ ] Avatar
- [ ] EmptyState
- [ ] ModeToggle

#### Fase 7: Pickers & Uploads (5 componentes)

- [ ] DatePicker
- [ ] DateRangePicker
- [ ] ColorPicker
- [ ] AvatarUpload
- [ ] PictureUpload
- [ ] PeriodoSelector

#### Fase 8: Documentação

- [ ] Documentar cada componente
- [ ] Criar exemplos de uso
- [ ] Storybook (opcional)
- [ ] Guia de contribuição

### Checklist de Qualidade

#### Design

- [ ] Consistência visual em todos os componentes
- [ ] Hierarquia tipográfica clara
- [ ] Espaçamento consistente (grid 4px)
- [ ] Cores seguem escala definida
- [ ] Dark mode funciona em todos os componentes

#### Acessibilidade (WCAG AA)

- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Contraste mínimo 3:1 para componentes
- [ ] Navegação por teclado funciona
- [ ] Estados de foco visíveis
- [ ] Labels em todos os inputs
- [ ] ARIA attributes corretos

#### Código

- [ ] TypeScript rigoroso (sem `any`)
- [ ] Props tipadas
- [ ] Lógica de classes dentro dos componentes
- [ ] Variáveis CSS para cores
- [ ] Tailwind utilities para layout
- [ ] Computed properties para reatividade

#### Performance

- [ ] CSS mínimo (~150 linhas)
- [ ] Lazy-load de componentes pesados
- [ ] Imagens otimizadas
- [ ] Sem re-renders desnecessários

#### Testes

- [ ] Testes visuais (Chromatic/Percy)
- [ ] Testes de acessibilidade (axe)
- [ ] Testes unitários de lógica
- [ ] Testes de integração

---

## 🔟 EXEMPLOS PRÁTICOS

### Exemplo 1: Criando um Input Component

```vue
<script setup lang="ts">
type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "filled" | "flushed";

interface Props {
	modelValue?: string | number;
	type?: "text" | "email" | "password" | "number" | "tel" | "url";
	size?: InputSize;
	variant?: InputVariant;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	label?: string;
	required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	type: "text",
	size: "md",
	variant: "default",
});

const emit = defineEmits<{
	"update:modelValue": [value: string | number];
	blur: [event: FocusEvent];
	focus: [event: FocusEvent];
}>();

const inputId = useId();

// Lógica de classes DENTRO do componente
const inputClasses = computed(() => {
	const classes = ["w-full", "transition-all", "duration-200", "outline-none", "font-sans"];

	// Tamanhos
	const sizeMap = {
		sm: ["px-3", "py-1.5", "text-sm", "rounded-md"],
		md: ["px-4", "py-2.5", "text-base", "rounded-lg"],
		lg: ["px-5", "py-3", "text-lg", "rounded-lg"],
	};
	classes.push(...sizeMap[props.size]);

	// Variantes
	if (props.variant === "default") {
		classes.push(
			"bg-[var(--input-bg)]",
			"border",
			"border-[var(--input-border)]",
			"text-[var(--input-text)]",
			"placeholder:text-[var(--input-placeholder)]",
			"hover:border-[var(--input-border-hover)]",
			"focus:border-[var(--input-border-focus)]",
			"focus:ring-2",
			"focus:ring-[var(--ring)]",
			"focus:ring-offset-1",
		);
	}

	if (props.variant === "filled") {
		classes.push(
			"bg-[var(--bg-muted)]",
			"border-2",
			"border-transparent",
			"text-[var(--input-text)]",
			"placeholder:text-[var(--input-placeholder)]",
			"hover:bg-[var(--bg-hover)]",
			"focus:bg-[var(--input-bg)]",
			"focus:border-[var(--input-border-focus)]",
		);
	}

	if (props.variant === "flushed") {
		classes.push(
			"bg-transparent",
			"border-b-2",
			"border-[var(--input-border)]",
			"rounded-none",
			"px-0",
			"text-[var(--input-text)]",
			"placeholder:text-[var(--input-placeholder)]",
			"focus:border-[var(--input-border-focus)]",
		);
	}

	// Estados
	if (props.error) {
		classes.push("border-[var(--error)]", "focus:border-[var(--error)]");
	}

	if (props.disabled) {
		classes.push(
			"bg-[var(--input-disabled-bg)]",
			"text-[var(--input-disabled-text)]",
			"cursor-not-allowed",
			"opacity-60",
		);
	}

	return classes;
});

const labelClasses = computed(() => [
	"block",
	"mb-1.5",
	"text-sm",
	"font-medium",
	"text-[var(--text-primary)]",
]);

const errorClasses = ["mt-1.5", "text-sm", "text-[var(--error)]"];
</script>

<template>
	<div class="w-full">
		<label v-if="label" :for="inputId" :class="labelClasses">
			{{ label }}
			<span v-if="required" class="text-[var(--error)]">*</span>
		</label>

		<input
			:id="inputId"
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:required="required"
			:class="inputClasses"
			:aria-invalid="!!error"
			:aria-describedby="error ? `${inputId}-error` : undefined"
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			@blur="emit('blur', $event)"
			@focus="emit('focus', $event)"
		/>

		<p v-if="error" :id="`${inputId}-error`" :class="errorClasses" role="alert">
			{{ error }}
		</p>
	</div>
</template>
```

### Exemplo 2: Criando um Card Component

```vue
<script setup lang="ts">
type CardVariant = "elevated" | "outlined" | "filled";

interface Props {
	variant?: CardVariant;
	hoverable?: boolean;
	clickable?: boolean;
	padding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "elevated",
	hoverable: false,
	clickable: false,
	padding: true,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const cardClasses = computed(() => {
	const classes = ["rounded-lg", "transition-all", "duration-200"];

	// Padding
	if (props.padding) {
		classes.push("p-6");
	}

	// Variantes
	if (props.variant === "elevated") {
		classes.push("bg-[var(--card-bg)]", "shadow-[var(--card-shadow)]");

		if (props.hoverable) {
			classes.push("hover:shadow-[var(--card-shadow-hover)]");
		}
	}

	if (props.variant === "outlined") {
		classes.push("bg-[var(--card-bg)]", "border", "border-[var(--card-border)]");

		if (props.hoverable) {
			classes.push("hover:border-[var(--border-hover)]");
		}
	}

	if (props.variant === "filled") {
		classes.push("bg-[var(--bg-muted)]");

		if (props.hoverable) {
			classes.push("hover:bg-[var(--bg-hover)]");
		}
	}

	// Clickable
	if (props.clickable) {
		classes.push("cursor-pointer", "active:scale-[0.98]");
	}

	return classes;
});
</script>

<template>
	<div :class="cardClasses" @click="clickable && emit('click', $event)">
		<slot />
	</div>
</template>
```

### Exemplo 3: Usando Variáveis CSS para Tema Customizado

```typescript
// composables/useStoreTheme.ts
export const useStoreTheme = (storeId: string) => {
	const applyTheme = (colors: {
		primary: string;
		secondary: string;
		background: string;
		text: string;
	}) => {
		// Aplicar cores customizadas via CSS variables
		const root = document.documentElement;

		root.style.setProperty("--primary", colors.primary);
		root.style.setProperty("--accent", colors.secondary);
		root.style.setProperty("--bg-page", colors.background);
		root.style.setProperty("--text-primary", colors.text);

		// Calcular cores derivadas automaticamente
		// (hover, light, etc) usando manipulação OKLCH
	};

	return { applyTheme };
};
```

---

## 1️⃣1️⃣ FAQ

### Perguntas Gerais

**P: Por que RGB Hexadecimal ao invés de OKLCH?**
R: Embora OKLCH seja perceptualmente uniforme e tenha gamut maior, ele ainda não tem suporte universal. **CRÍTICO:** OKLCH causa erros de layout em dispositivos mobile (iOS Safari, Chrome Android). Para SaaS público com mobile, RGB Hexadecimal é a única escolha segura. Use OKLCH apenas em projetos internos desktop-only com navegadores controlados.

**P: Preciso criar todos os 34 componentes de uma vez?**
R: Não! Siga o princípio YAGNI (You Aren't Gonna Need It). Comece com os essenciais (Button, Input, Card) e adicione conforme necessidade.

**P: Posso usar Sass/SCSS?**
R: Não é recomendado. Tailwind CSS v4 + variáveis CSS nativas são suficientes e mais performáticos. Sass adiciona complexidade desnecessária.

**P: Como lidar com 175 combinações de Button (5 variantes × 7 cores × 5 tamanhos)?**
R: Use computed properties com lógica de classes dentro do componente. Variáveis CSS garantem que alterar 1 cor muda todas as variantes automaticamente.

**P: Devo criar composables separados para lógica de classes?**
R: Não. Siga o princípio KISS (Keep It Simple). Lógica de classes deve ficar DENTRO do componente. Composables separados adicionam complexidade desnecessária.

### Perguntas Técnicas

**P: Como garantir dark mode automático?**
R: Use variáveis CSS semânticas (ex: `--primary`, `--bg-page`) que são redefinidas na classe `.dark`. Componentes usam as variáveis, não cores diretas.

**P: Como testar acessibilidade?**
R: Use ferramentas como axe DevTools, Lighthouse, e testes manuais com leitores de tela (NVDA, JAWS, VoiceOver).

**P: Como versionar o Design System?**
R: Use Semantic Versioning (1.0.0). Breaking changes incrementam major (2.0.0), novas features incrementam minor (1.1.0), bugfixes incrementam patch (1.0.1).

**P: Como documentar componentes?**
R: Use JSDoc para props/emits, crie exemplos de uso, e considere Storybook para documentação visual interativa.

**P: Como lidar com componentes legados?**
R: Marque como deprecated, forneça caminho de migração, e remova em próxima major version. Mantenha changelog detalhado.

### Perguntas de Design

**P: Quantas cores devo ter?**
R: Recomendamos 7 cores semânticas (primary, secondary, success, warning, error, info, neutral). Mais que isso pode causar confusão.

**P: Como escolher a escala de espaçamento?**
R: Use múltiplos de 4px (0.25rem). É o padrão da indústria e facilita alinhamento em grid.

**P: Devo ter variantes ilimitadas de componentes?**
R: Não. Limite a 3-5 variantes por componente. Muitas opções causam paralisia de decisão e inconsistência.

**P: Como garantir consistência visual?**
R: Use sempre a escala de tokens (cores, espaçamentos, tipografia). Nunca use valores arbitrários.

**P: Quando criar um novo componente vs usar composição?**
R: Crie novo componente quando houver lógica/estado específico. Use composição (slots) quando for apenas layout diferente.

---

## 1️⃣2️⃣ RECURSOS E FERRAMENTAS

### Ferramentas de Design

1. **Figma** - Design de interfaces e protótipos
   - Plugin: Figma Tokens (sincronizar design tokens)
   - Plugin: A11y - Annotation Kit (acessibilidade)

2. **OKLCH Color Picker** - https://oklch.com/
   - Escolher cores em OKLCH
   - Visualizar gamut

3. **UI Colors** - https://uicolors.app/create
   - Gerar paletas de 11 tons
   - Exportar para Tailwind

4. **Contrast Checker** - https://webaim.org/resources/contrastchecker/
   - Verificar contraste WCAG

### Ferramentas de Desenvolvimento

1. **Tailwind CSS v4** - https://tailwindcss.com/
   - Framework CSS utility-first
   - Customização via CSS nativo

2. **Nuxt UI** - https://ui.nuxt.com/
   - Biblioteca de componentes Vue/Nuxt
   - Referência de boas práticas

3. **Headless UI** - https://headlessui.com/
   - Componentes acessíveis sem estilo
   - Base para componentes customizados

4. **Radix UI** - https://www.radix-ui.com/
   - Primitivos acessíveis
   - Referência de acessibilidade

### Ferramentas de Teste

1. **Chromatic** - https://www.chromatic.com/
   - Testes visuais automatizados
   - Integração com Storybook

2. **axe DevTools** - https://www.deque.com/axe/devtools/
   - Testes de acessibilidade
   - Extensão de navegador

3. **Lighthouse** - https://developers.google.com/web/tools/lighthouse
   - Auditoria de performance e acessibilidade
   - Integrado no Chrome DevTools

4. **Percy** - https://percy.io/
   - Testes visuais de regressão
   - Integração CI/CD

### Documentação e Referências

1. **Material Design 3** - https://m3.material.io/
   - Referência de Design System
   - Princípios e padrões

2. **Apple Human Interface Guidelines** - https://developer.apple.com/design/
   - Padrões de UI/UX
   - Acessibilidade

3. **WCAG 2.1** - https://www.w3.org/WAI/WCAG21/quickref/
   - Diretrizes de acessibilidade
   - Critérios de sucesso

4. **Design Systems Repo** - https://designsystemsrepo.com/
   - Exemplos de Design Systems
   - Inspiração e referências

### Comunidades

1. **Design Systems Slack** - https://design.systems/slack/
2. **Tailwind CSS Discord** - https://tailwindcss.com/discord
3. **Vue.js Discord** - https://discord.com/invite/vue
4. **Nuxt Discord** - https://discord.com/invite/nuxt

---

## 1️⃣3️⃣ GLOSSÁRIO

**Design Tokens** - Valores primitivos que definem o visual do sistema (cores, espaçamentos, fontes).

**Variáveis Semânticas** - Variáveis CSS com significado contextual (ex: `--primary`, `--bg-page`).

**OKLCH** - Espaço de cor moderno e perceptualmente uniforme (Lightness, Chroma, Hue).

**Utility-First CSS** - Abordagem CSS com classes atômicas (ex: `flex`, `p-4`, `text-lg`).

**Composition API** - API moderna do Vue 3 baseada em funções (vs Options API).

**Computed Property** - Propriedade reativa calculada automaticamente quando dependências mudam.

**Props** - Propriedades passadas de componente pai para filho.

**Emits** - Eventos emitidos de componente filho para pai.

**Slots** - Espaços para injetar conteúdo customizado em componentes.

**WCAG** - Web Content Accessibility Guidelines (diretrizes de acessibilidade).

**ARIA** - Accessible Rich Internet Applications (atributos de acessibilidade).

**Semantic Versioning** - Sistema de versionamento (major.minor.patch).

**Breaking Change** - Mudança que quebra compatibilidade com versão anterior.

**DRY** - Don't Repeat Yourself (não repita código).

**KISS** - Keep It Simple, Stupid (mantenha simples).

**YAGNI** - You Aren't Gonna Need It (não adicione antes de precisar).

**SoC** - Separation of Concerns (separação de responsabilidades).

---

## 🎓 CONCLUSÃO

Um Design System bem construído é a base para criar aplicações consistentes, escaláveis e de alta qualidade.

### Princípios Fundamentais

1. **Consistência** - Use sempre a escala de tokens
2. **Simplicidade** - Lógica dentro dos componentes (KISS)
3. **Escalabilidade** - Adicione conforme necessidade (YAGNI)
4. **Manutenibilidade** - Alterar 1 variável → muda tudo (DRY)
5. **Acessibilidade** - WCAG AA mínimo, sempre

### Próximos Passos

1. **Fase 1:** Crie tokens e variáveis CSS (1-2 dias)
2. **Fase 2:** Implemente componentes básicos (3-5 dias)
3. **Fase 3:** Adicione componentes conforme necessidade
4. **Fase 4:** Documente e teste
5. **Fase 5:** Itere e melhore continuamente

### Lembre-se

> "Um Design System não é um projeto, é um produto. Ele evolui com o tempo e requer manutenção contínua."

**Boa sorte na construção do seu Design System! 🚀**

---

**Última atualização:** Fevereiro 2026

**Versão:** 1.0.0

**Licença:** MIT (use livremente em seus projetos!)
