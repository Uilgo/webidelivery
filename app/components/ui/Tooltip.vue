<script setup lang="ts">
/**
 * UiTooltip — Dica flutuante do design system WebiDelivery
 *
 * Exibe um texto explicativo ao passar o mouse ou focar em um elemento.
 * Posicionamento automático com 4 direções, aparição animada.
 *
 * Props:
 *   - text:      texto do tooltip (obrigatório)
 *   - position:  posição do tooltip (top | bottom | left | right), padrão: "top"
 *   - delay:     atraso em ms antes de exibir (padrão: 200)
 *   - disabled:  desabilita o tooltip (padrão: false)
 *   - maxWidth:  largura máxima em px (padrão: 250)
 *
 * Slots:
 *   - default: elemento gatilho (o que recebe hover/focus)
 *
 * Uso:
 *   <UiTooltip text="Clique para salvar">
 *     <UiButton icon="lucide:save" size="icon" variant="ghost" />
 *   </UiTooltip>
 *
 *   <UiTooltip text="Este campo é obrigatório" position="right">
 *     <Icon name="lucide:info" class="text-muted-foreground" />
 *   </UiTooltip>
 */

type Position = "top" | "bottom" | "left" | "right";

const props = withDefaults(
	defineProps<{
		text: string;
		position?: Position;
		delay?: number;
		disabled?: boolean;
		maxWidth?: number;
	}>(),
	{
		position: "top",
		delay: 200,
		disabled: false,
		maxWidth: 250,
	},
);

// Controle de visibilidade
const visible = ref(false);
let showTimeout: ReturnType<typeof setTimeout> | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

// Exibe o tooltip com delay
function show() {
	if (props.disabled) return;
	if (hideTimeout) {
		clearTimeout(hideTimeout);
		hideTimeout = null;
	}
	showTimeout = setTimeout(() => {
		visible.value = true;
	}, props.delay);
}

// Oculta o tooltip
function hide() {
	if (showTimeout) {
		clearTimeout(showTimeout);
		showTimeout = null;
	}
	hideTimeout = setTimeout(() => {
		visible.value = false;
	}, 100);
}

// Limpa timeouts ao desmontar
onBeforeUnmount(() => {
	if (showTimeout) clearTimeout(showTimeout);
	if (hideTimeout) clearTimeout(hideTimeout);
});

// ID estável para aria-describedby
const tooltipId = useId();

// Mapa de posicionamento CSS
const positionClasses: Record<Position, string> = {
	top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
	bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
	left: "right-full top-1/2 -translate-y-1/2 mr-2",
	right: "left-full top-1/2 -translate-y-1/2 ml-2",
};
</script>

<template>
	<div
		class="relative inline-flex"
		@mouseenter="show"
		@mouseleave="hide"
		@focusin="show"
		@focusout="hide"
	>
		<!-- Elemento gatilho -->
		<slot></slot>

		<!-- Tooltip flutuante -->
		<Transition
			enter-active-class="transition-all duration-150 ease-out"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition-all duration-100 ease-in"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div
				v-if="visible && !disabled"
				:id="tooltipId"
				role="tooltip"
				:class="[
					'pointer-events-none absolute z-50 rounded px-3 py-1.5 text-xs font-medium whitespace-normal shadow-lg',
					'bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900',
					positionClasses[position],
				]"
				:style="{ maxWidth: `${maxWidth}px` }"
			>
				{{ text }}

				<!-- Seta Triângulo Rotacionado -->
				<div
					:class="[
						'pointer-events-none absolute h-2 w-2 rotate-45 bg-neutral-900 dark:bg-neutral-50',
						position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' : '',
						position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' : '',
						position === 'left' ? 'top-1/2 -right-1 -translate-y-1/2' : '',
						position === 'right' ? 'top-1/2 -left-1 -translate-y-1/2' : '',
					]"
				></div>
			</div>
		</Transition>
	</div>
</template>
