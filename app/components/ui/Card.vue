<script setup lang="ts">
/**
 * UiCard — Container visual base do design system WebiDelivery
 *
 * Usado para agrupar conteúdo relacionado com borda, fundo e sombra opcionais.
 * Segue os tokens semânticos do design system (bg-card, border-border).
 *
 * Props:
 *   - as:       tag HTML renderizada (padrão: "div")
 *   - padding:  controla o padding interno (none | sm | md | lg), padrão: "md"
 *   - shadow:   aplica sombra (none | sm | md | lg), padrão: "sm"
 *   - border:   exibe borda (padrão: true)
 *   - hover:    aplica efeito de hover elevado (padrão: false)
 *
 * Slots:
 *   - header:  conteúdo do cabeçalho do card (opcional)
 *   - default: conteúdo principal do card
 *   - footer:  conteúdo do rodapé do card (opcional)
 *
 * Uso:
 *   <UiCard>
 *     <template #header><h3>Título</h3></template>
 *     <p>Conteúdo do card aqui.</p>
 *     <template #footer><UiButton>Ação</UiButton></template>
 *   </UiCard>
 */

type Padding = "none" | "sm" | "md" | "lg";
type Shadow = "none" | "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		as?: string;
		padding?: Padding;
		shadow?: Shadow;
		border?: boolean;
		hover?: boolean;
	}>(),
	{
		as: "div",
		padding: "md",
		shadow: "sm",
		border: true,
		hover: false,
	},
);

// Mapa de padding interno
const paddingClasses: Record<Padding, string> = {
	none: "",
	sm: "p-3",
	md: "p-5",
	lg: "p-8",
};

// Mapa de sombras
const shadowClasses: Record<Shadow, string> = {
	none: "",
	sm: "shadow-sm",
	md: "shadow-md",
	lg: "shadow-lg",
};

// Classes finais computadas
const classes = computed(() => [
	"bg-card text-card-foreground rounded transition-all duration-300",
	paddingClasses[props.padding],
	shadowClasses[props.shadow],
	props.border ? "border border-border" : "",
	props.hover
		? "hover:shadow-lg hover:-translate-y-1 hover:border-neutral-300 dark:hover:border-neutral-700"
		: "",
]);
</script>

<template>
	<component :is="as" :class="classes">
		<!-- Header do card (opcional) -->
		<div v-if="$slots.header" class="border-border mb-4 border-b pb-4">
			<slot name="header"></slot>
		</div>

		<!-- Conteúdo principal -->
		<slot></slot>

		<!-- Footer do card (opcional) -->
		<div v-if="$slots.footer" class="border-border mt-4 border-t pt-4">
			<slot name="footer"></slot>
		</div>
	</component>
</template>
