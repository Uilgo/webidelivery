<script lang="ts">
/**
 * UiToaster — Container global + API de toasts do design system WebiDelivery
 *
 * Este arquivo contém TUDO do sistema de toasts:
 *   1. O estado reativo singleton (toasts[])
 *   2. A API exportada (toast.success, toast.error, etc.)
 *   3. O componente visual que renderiza os toasts
 *
 * Incluir no app.vue:
 *   <ClientOnly><UiToaster /></ClientOnly>
 *
 * Disparar toast de qualquer componente:
 *   import { toast } from '~/components/ui/Toaster.vue'
 *   toast.success('Salvo com sucesso!')
 *   toast.error('Falha ao salvar', { description: 'Tente novamente.' })
 *   toast.add({ title: 'Olá!', color: 'warning', icon: 'lucide:bell' })
 */

import { ref } from "vue";

// ── Tipos ────────────────────────────────────────────────
export type ToastColor =
	| "primary"
	| "secondary"
	| "neutral"
	| "success"
	| "info"
	| "warning"
	| "error";

export interface ToastOptions {
	id?: string;
	title: string;
	description?: string;
	icon?: string;
	color?: ToastColor;
	timeout?: number;
	click?: () => void;
	onClose?: () => void;
}

export interface ToastItem extends Required<Pick<ToastOptions, "id" | "title" | "color">> {
	description?: string;
	icon?: string;
	timeout: number;
	click?: () => void;
	onClose?: () => void;
}

// ── Estado reativo singleton ─────────────────────────────
const toasts = ref<ToastItem[]>([]);
let counter = 0;

// Ícones padrão por cor semântica
const defaultIcons: Record<ToastColor, string> = {
	primary: "lucide:info",
	secondary: "lucide:info",
	neutral: "lucide:info",
	success: "lucide:circle-check",
	info: "lucide:info",
	warning: "lucide:triangle-alert",
	error: "lucide:circle-x",
};

/** Remove um toast pelo ID */
function remove(id: string) {
	const i = toasts.value.findIndex((t) => t.id === id);
	if (i !== -1) {
		const removed = toasts.value.splice(i, 1)[0];
		removed?.onClose?.();
	}
}

/** Adiciona um toast e retorna o ID */
function add(options: ToastOptions): string {
	const id = options.id ?? `toast-${++counter}`;
	const color = options.color ?? "neutral";

	// Se já existe com mesmo ID, não duplica
	if (toasts.value.some((t) => t.id === id)) return id;

	toasts.value.push({
		id,
		title: options.title,
		description: options.description,
		icon: options.icon ?? defaultIcons[color],
		color,
		timeout: options.timeout ?? 5000,
		click: options.click,
		onClose: options.onClose,
	});

	// Limita a 5 toasts visíveis
	while (toasts.value.length > 5) {
		const old = toasts.value.shift();
		old?.onClose?.();
	}

	return id;
}

// Atalhos por cor
function success(title: string, opts?: Partial<Omit<ToastOptions, "title" | "color">>) {
	return add({ ...opts, title, color: "success" });
}
function error(title: string, opts?: Partial<Omit<ToastOptions, "title" | "color">>) {
	return add({ ...opts, title, color: "error" });
}
function warning(title: string, opts?: Partial<Omit<ToastOptions, "title" | "color">>) {
	return add({ ...opts, title, color: "warning" });
}
function info(title: string, opts?: Partial<Omit<ToastOptions, "title" | "color">>) {
	return add({ ...opts, title, color: "info" });
}
function clear() {
	toasts.value.forEach((t) => t.onClose?.());
	toasts.value = [];
}

// ── API pública exportada ────────────────────────────────
export const toast = { add, remove, clear, success, error, warning, info };
</script>

<script setup lang="ts">
/**
 * Componente visual — apenas lê o estado singleton e renderiza os toasts.
 */
</script>

<template>
	<Teleport to="body">
		<div
			class="pointer-events-none fixed right-4 bottom-4 z-100 flex w-full max-w-[400px] flex-col gap-3"
			aria-live="assertive"
		>
			<TransitionGroup
				enter-active-class="transition-all duration-300 ease-out"
				enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
				enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
				leave-active-class="transition-all duration-200 ease-in"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
				move-class="transition-all duration-300 ease-in-out"
			>
				<div v-for="t in toasts" :key="t.id" class="pointer-events-auto">
					<UiToast v-bind="t" />
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>
