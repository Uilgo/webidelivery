<script setup lang="ts">
/**
 * UiBadge — Etiqueta/rótulo visual inline do design system WebiDelivery
 *
 * Exibe um pequeno rótulo colorido para status, contadores ou categorias.
 * Segue as mesmas cores semânticas do UiButton.
 *
 * Props:
 *   - color:    cor semântica (primary | secondary | neutral | success | info | warning | error), padrão: "neutral"
 *   - variant:  estilo visual (solid | soft | outline), padrão: "soft"
 *   - size:     tamanho (sm | md | lg), padrão: "md"
 *   - icon:     ícone opcional antes do texto
 *   - dot:      exibe um indicador circular antes do texto (padrão: false)
 *   - rounded:  arredondamento total tipo pílula (padrão: false)
 *
 * Slots:
 *   - default: texto do badge
 *
 * Uso:
 *   <UiBadge color="success">Ativo</UiBadge>
 *   <UiBadge color="error" variant="solid" icon="lucide:alert-circle">Erro</UiBadge>
 *   <UiBadge color="info" dot>Pendente</UiBadge>
 */

type Color = "primary" | "secondary" | "neutral" | "success" | "info" | "warning" | "error";
type Variant = "solid" | "soft" | "outline";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		color?: Color;
		variant?: Variant;
		size?: Size;
		icon?: string;
		dot?: boolean;
		rounded?: boolean;
	}>(),
	{
		color: "neutral",
		variant: "soft",
		size: "md",
		icon: undefined,
		dot: false,
		rounded: false,
	},
);

// Mapa de tamanhos
const sizeClasses: Record<Size, string> = {
	sm: "px-2.5 py-0.5 text-[10px] gap-1",
	md: "px-3 py-1 text-xs gap-1.5", // Padrão
	lg: "px-4 py-1.5 text-sm gap-2",
};

// Mapa de variante + cor → classes Tailwind
const variantColorMap: Record<Variant, Record<Color, string>> = {
	solid: {
		primary: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		neutral: "bg-neutral text-neutral-foreground",
		success: "bg-success text-success-foreground",
		info: "bg-info text-info-foreground",
		warning: "bg-warning text-warning-foreground",
		error: "bg-error text-error-foreground",
	},
	soft: {
		primary: "bg-primary/10 text-primary",
		secondary: "bg-secondary/10 text-secondary",
		neutral: "bg-neutral/10 text-neutral",
		success: "bg-success/10 text-success",
		info: "bg-info/10 text-info",
		warning: "bg-warning/10 text-warning",
		error: "bg-error/10 text-error",
	},
	outline: {
		primary: "border border-primary text-primary bg-transparent",
		secondary: "border border-secondary text-secondary bg-transparent",
		neutral: "border border-neutral text-neutral bg-transparent",
		success: "border border-success text-success bg-transparent",
		info: "border border-info text-info bg-transparent",
		warning: "border border-warning text-warning bg-transparent",
		error: "border border-error text-error bg-transparent",
	},
};

// Cores para o dot circular
const dotColorMap: Record<Color, string> = {
	primary: "bg-primary",
	secondary: "bg-secondary",
	neutral: "bg-neutral",
	success: "bg-success",
	info: "bg-info",
	warning: "bg-warning",
	error: "bg-error",
};

// Classes finais computadas
const classes = computed(() => [
	"inline-flex items-center font-medium whitespace-nowrap select-none",
	sizeClasses[props.size],
	variantColorMap[props.variant][props.color],
	props.rounded ? "rounded-full" : "rounded",
]);
</script>

<template>
	<span :class="classes">
		<!-- Indicador dot -->
		<span v-if="dot" :class="['size-1.5 shrink-0 rounded-full', dotColorMap[color]]"></span>

		<!-- Ícone opcional -->
		<Icon v-if="icon" :name="icon" class="size-3 shrink-0" aria-hidden="true" />

		<!-- Conteúdo do badge -->
		<slot></slot>
	</span>
</template>
