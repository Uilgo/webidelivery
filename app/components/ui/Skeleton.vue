<script setup lang="ts">
/**
 * UiSkeleton — Componente de carregamento do design system WebiDelivery
 *
 * Exibe um espaço reservado animado para simular o layout enquanto os dados
 * estão sendo carregados.
 *
 * Props:
 *   - rounded:   formato do arredondamento (none, sm, md, lg, xl, full), padrão: "md"
 *   - animation: tipo de animação (pulse, none), padrão: "pulse"
 *
 * Uso:
 *   <!-- Quadrado/Retângulo -->
 *   <UiSkeleton class="w-full h-4" />
 *
 *   <!-- Círculo (Avatar) -->
 *   <UiSkeleton class="w-12 h-12" rounded="full" />
 */

const props = withDefaults(
	defineProps<{
		rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
		animation?: "pulse" | "none";
	}>(),
	{
		rounded: "md",
		animation: "pulse",
	},
);

const roundedClasses: Record<string, string> = {
	none: "rounded-none",
	sm: "rounded-sm",
	md: "rounded-md", // Padrão
	lg: "rounded-lg",
	xl: "rounded-xl",
	full: "rounded-full",
};
</script>

<template>
	<div
		:class="[
			'bg-muted',
			roundedClasses[props.rounded],
			props.animation === 'pulse' ? 'animate-pulse' : '',
		]"
		aria-busy="true"
		aria-live="polite"
	></div>
</template>
