<script setup lang="ts">
/**
 * UiButton — Botão base do design system WebiDelivery
 *
 * Variantes visuais:
 *   - solid:   fundo cheio com a cor, máximo contraste — ação principal
 *   - outline: borda colorida, fundo transparente — ação secundária
 *   - soft:    fundo com baixa opacidade da cor, texto colorido — ação leve/discreta
 *   - ghost:   sem borda nem fundo, apenas hover sutil — ação terciária
 *   - link:    aparência de link com underline no hover — navegação inline
 *
 * Cores disponíveis:
 *   - primary:   laranja — identidade da marca
 *   - secondary: roxo — complementar
 *   - neutral:   cinza — ações genéricas
 *   - success:   verde — confirmação, sucesso
 *   - info:      azul — informação
 *   - warning:   amarelo — atenção
 *   - error:     vermelho — erro, ação destrutiva
 *
 * Tamanhos:
 *   - sm:   32px de altura
 *   - md:   40px de altura (padrão)
 *   - lg:   48px de altura
 *   - icon: quadrado 40px, para botões com apenas ícone
 *
 * Props:
 *   - variant:    estilo visual (padrão: "solid")
 *   - color:      cor semântica (padrão: "primary")
 *   - size:       tamanho (padrão: "md" = 40px)
 *   - as:         tag ou componente renderizado (padrão: "button")
 *   - loading:    exibe spinner e bloqueia interação
 *   - disabled:   desabilita o botão
 *   - iconLeft:   nome do ícone à esquerda do label (ex: "lucide:plus")
 *   - iconRight:  nome do ícone à direita do label (ex: "lucide:arrow-right")
 *   - icon:       ícone centralizado sozinho — use junto com size="icon" e sem label
 *
 * Slots:
 *   - default: label/conteúdo do botão (omitir quando usar prop icon)
 *
 * Uso:
 *   <UiButton icon-left="lucide:plus">Adicionar</UiButton>
 *   <UiButton icon-right="lucide:arrow-right" color="secondary">Próximo</UiButton>
 *   <UiButton icon="lucide:trash" size="icon" variant="ghost" color="error" />
 *   <UiButton variant="soft" color="success">Salvo</UiButton>
 */

type Variant = "solid" | "outline" | "soft" | "ghost" | "link";
type Color = "primary" | "secondary" | "neutral" | "success" | "info" | "warning" | "error";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		variant?: Variant;
		color?: Color;
		size?: Size;
		as?: string;
		loading?: boolean;
		disabled?: boolean;
		iconLeft?: string;
		iconRight?: string;
		icon?: string;
	}>(),
	{
		variant: "solid",
		color: "primary",
		size: "md",
		as: "button",
		loading: false,
		disabled: false,
		iconLeft: undefined,
		iconRight: undefined,
		icon: undefined,
	},
);

// Classes base aplicadas em todas as combinações
const base =
	"ui-button inline-flex items-center justify-center gap-2 font-medium rounded transition-colors duration-150 disabled:opacity-50 select-none whitespace-nowrap";

// Mapa de tamanhos — botão só com ícone vira quadrado automaticamente via computed
const sizes: Record<Size, string> = {
	sm: "h-8 text-xs",
	md: "h-10 text-sm", // 40px — padrão
	lg: "h-12 text-base",
};

// Padding lateral: quadrado quando só ícone, normal quando tem label
const paddingMap: Record<Size, { icon: string; label: string }> = {
	sm: { icon: "w-8 px-0", label: "px-3" },
	md: { icon: "w-10 px-0", label: "px-4" },
	lg: { icon: "w-12 px-0", label: "px-6" },
};

// Mapa de variante + cor → classes Tailwind
// Usa os tokens do design system definidos no main.css
const variantColorMap: Record<Variant, Record<Color, string>> = {
	solid: {
		primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
		secondary:
			"bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
		neutral: "bg-neutral text-neutral-foreground hover:bg-neutral/90 active:bg-neutral/80",
		success: "bg-success text-success-foreground hover:bg-success/90 active:bg-success/80",
		info: "bg-info text-info-foreground hover:bg-info/90 active:bg-info/80",
		warning: "bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/80",
		error: "bg-error text-error-foreground hover:bg-error/90 active:bg-error/80",
	},
	outline: {
		primary: "border border-primary text-primary bg-transparent hover:bg-primary/10",
		secondary: "border border-secondary text-secondary bg-transparent hover:bg-secondary/10",
		neutral: "border border-neutral text-neutral bg-transparent hover:bg-neutral/10",
		success: "border border-success text-success bg-transparent hover:bg-success/10",
		info: "border border-info text-info bg-transparent hover:bg-info/10",
		warning: "border border-warning text-warning bg-transparent hover:bg-warning/10",
		error: "border border-error text-error bg-transparent hover:bg-error/10",
	},
	soft: {
		primary: "bg-primary/10 text-primary hover:bg-primary/20",
		secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
		neutral: "bg-neutral/10 text-neutral hover:bg-neutral/20",
		success: "bg-success/10 text-success hover:bg-success/20",
		info: "bg-info/10 text-info hover:bg-info/20",
		warning: "bg-warning/10 text-warning hover:bg-warning/20",
		error: "bg-error/10 text-error hover:bg-error/20",
	},
	ghost: {
		primary: "bg-transparent text-primary hover:bg-primary/10",
		secondary: "bg-transparent text-secondary hover:bg-secondary/10",
		neutral: "bg-transparent text-neutral hover:bg-neutral/10",
		success: "bg-transparent text-success hover:bg-success/10",
		info: "bg-transparent text-info hover:bg-info/10",
		warning: "bg-transparent text-warning hover:bg-warning/10",
		error: "bg-transparent text-error hover:bg-error/10",
	},
	link: {
		primary: "bg-transparent text-primary underline-offset-4 hover:underline h-auto p-0",
		secondary: "bg-transparent text-secondary underline-offset-4 hover:underline h-auto p-0",
		neutral: "bg-transparent text-neutral underline-offset-4 hover:underline h-auto p-0",
		success: "bg-transparent text-success underline-offset-4 hover:underline h-auto p-0",
		info: "bg-transparent text-info underline-offset-4 hover:underline h-auto p-0",
		warning: "bg-transparent text-warning underline-offset-4 hover:underline h-auto p-0",
		error: "bg-transparent text-error underline-offset-4 hover:underline h-auto p-0",
	},
};

// Classe final computada combinando base + tamanho + variante/cor
const classes = computed(() => [
	base,
	sizes[props.size],
	// quadrado se só ícone, padding normal se tiver label
	props.icon ? paddingMap[props.size].icon : paddingMap[props.size].label,
	// link não usa altura/padding fixos
	props.variant === "link" ? "h-auto p-0" : "",
	variantColorMap[props.variant][props.color],
]);

// Botão inativo se desabilitado ou carregando
const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
	<component
		:is="as"
		:class="classes"
		:disabled="isDisabled"
		:aria-disabled="isDisabled"
		:aria-busy="loading"
	>
		<!-- Spinner exibido durante loading (substitui todos os ícones) -->
		<Icon
			v-if="loading"
			name="lucide:loader-circle"
			class="size-4 shrink-0 animate-spin"
			aria-hidden="true"
		/>

		<!-- Modo ícone centralizado (prop icon, sem label) -->
		<template v-else-if="icon">
			<Icon :name="icon" class="size-4 shrink-0" aria-hidden="true" />
		</template>

		<!-- Modo normal: ícone esquerdo + label + ícone direito -->
		<template v-else>
			<Icon v-if="iconLeft" :name="iconLeft" class="size-4 shrink-0" aria-hidden="true" />
			<slot></slot>
			<Icon v-if="iconRight" :name="iconRight" class="size-4 shrink-0" aria-hidden="true" />
		</template>
	</component>
</template>
