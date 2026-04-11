<script setup lang="ts">
/**
 * UiToast — Notificação individual do design system WebiDelivery
 *
 * Card de notificação temporário com ícone colorido, progress bar animada
 * e pausa automática no hover. Estilo inspirado no Nuxt UI Toast.
 *
 * Props:
 *   - id:          identificador único
 *   - title:       título principal
 *   - description: texto complementar (opcional)
 *   - color:       cor semântica (primary | secondary | neutral | success | info | warning | error)
 *   - icon:        ícone (ex: "lucide:circle-check")
 *   - timeout:     duração em ms (padrão: 5000)
 *   - click:       callback ao clicar no toast (opcional)
 *   - onClose:     callback executado ao remover o toast
 *
 * Usado internamente pelo UiToaster — não usar diretamente.
 */

import { toast } from "~/components/ui/Toaster.vue";

type Color = "primary" | "secondary" | "neutral" | "success" | "info" | "warning" | "error";

const props = withDefaults(
	defineProps<{
		id: string;
		title: string;
		description?: string;
		color?: Color;
		icon?: string;
		timeout?: number;
		click?: () => void;
		onClose?: () => void;
	}>(),
	{
		color: "neutral",
		timeout: 5000,
		description: undefined,
		icon: undefined,
		click: undefined,
		onClose: undefined,
	},
);

// ── Timer com pausa no hover ─────────────────────────────
const isHovered = ref(false);
const remaining = ref(props.timeout);
let interval: ReturnType<typeof setInterval> | null = null;

// Largura da progress bar (100% → 0%)
const progressWidth = computed(() => {
	if (!props.timeout || props.timeout <= 0) return 0;
	return Math.max(0, (remaining.value / props.timeout) * 100);
});

// Handlers de hover — pausa e resume do timer
function handleMouseEnter() {
	isHovered.value = true;
}

function handleMouseLeave() {
	isHovered.value = false;
}

// Callback ao clicar no toast
function handleClick() {
	if (props.click) props.click();
}

// Inicia o interval que decrementa o remaining
onMounted(() => {
	if (props.timeout > 0) {
		const step = 10; // Atualiza a cada 10ms para animação suave
		interval = setInterval(() => {
			if (!isHovered.value) {
				remaining.value -= step;
				if (remaining.value <= 0) {
					if (interval) clearInterval(interval);
					toast.remove(props.id);
				}
			}
		}, step);
	}
});

onBeforeUnmount(() => {
	if (interval) clearInterval(interval);
});

// ── Cores do ícone ───────────────────────────────────────
const iconColorMap: Record<Color, string> = {
	primary: "text-primary",
	secondary: "text-secondary",
	neutral: "text-foreground",
	success: "text-success",
	info: "text-info",
	warning: "text-warning",
	error: "text-error",
};

// ── Cores da progress bar ────────────────────────────────
const progressColorMap: Record<Color, string> = {
	primary: "bg-primary",
	secondary: "bg-secondary",
	neutral: "bg-neutral",
	success: "bg-success",
	info: "bg-info",
	warning: "bg-warning",
	error: "bg-error",
};
</script>

<template>
	<div
		class="border-border bg-card w-full cursor-pointer overflow-hidden rounded-lg border shadow-lg transition-shadow duration-200 hover:shadow-xl"
		role="alert"
		@click="handleClick"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
	>
		<!-- Conteúdo principal -->
		<div class="flex items-start gap-3 p-4">
			<!-- Ícone colorido -->
			<div
				v-if="icon"
				:class="['mt-0.5 flex shrink-0 items-center justify-center', iconColorMap[color]]"
			>
				<Icon :name="icon" class="size-5" aria-hidden="true" />
			</div>

			<!-- Textos -->
			<div class="min-w-0 flex-1">
				<p class="text-card-foreground text-sm leading-snug font-semibold">
					{{ title }}
				</p>
				<p v-if="description" class="text-muted-foreground mt-1 text-sm leading-snug">
					{{ description }}
				</p>
			</div>

			<!-- Botão fechar -->
			<button
				type="button"
				aria-label="Fechar"
				class="text-muted-foreground hover:text-card-foreground hover:bg-accent shrink-0 rounded p-1 transition-colors"
				@click.stop="toast.remove(id)"
			>
				<Icon name="lucide:x" class="size-4" aria-hidden="true" />
			</button>
		</div>

		<!-- Progress bar (timer visual) -->
		<div
			v-if="timeout && timeout > 0"
			class="h-1 transition-all duration-100 ease-linear"
			:class="progressColorMap[color]"
			:style="{ width: `${progressWidth}%` }"
		></div>
	</div>
</template>
