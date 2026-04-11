<script setup lang="ts">
/**
 * UiTimePicker — Componente PERSONALIZADO de seleção de horas
 *
 * Este componente não se utiliza do time picker nativo do navegador,
 * criando um dropdown totalmente estilizado com colunas para horas e minutos.
 */
import { ref, computed, watch, nextTick } from "vue";
import { onClickOutside, useElementBounding, useWindowSize } from "@vueuse/core";

const props = withDefaults(
	defineProps<{
		modelValue?: string; // Formato "HH:mm"
		disabled?: boolean;
		error?: boolean;
		size?: "sm" | "md" | "lg";
	}>(),
	{
		modelValue: "00:00",
		disabled: false,
		error: false,
		size: "sm",
	},
);

const emit = defineEmits<{
	"update:modelValue": [val: string];
}>();

// Estado do valor
const hour = ref("00");
const minute = ref("00");

watch(
	() => props.modelValue,
	(val) => {
		if (val && val.includes(":")) {
			const partes = val.split(":");
			const h = partes[0] || "00";
			const m = partes[1] || "00";
			hour.value = h.padStart(2, "0");
			minute.value = m.padStart(2, "0");
		}
	},
	{ immediate: true },
);

function updateValue() {
	emit("update:modelValue", `${hour.value}:${minute.value}`);
}

// Controle do Painel Customizado
const open = ref(false);
const placement = ref<"top" | "bottom">("bottom");
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

const {
	bottom: triggerBottom,
	top: triggerTop,
	left: triggerLeft,
} = useElementBounding(triggerRef);
const { height: windowHeight } = useWindowSize();

const panelStyle = computed(() => {
	if (placement.value === "bottom") {
		return {
			top: `${triggerBottom.value + 4}px`,
			left: `${triggerLeft.value}px`,
		};
	}
	return {
		bottom: `${windowHeight.value - triggerTop.value + 4}px`,
		left: `${triggerLeft.value}px`,
	};
});

const panelRef = ref<HTMLElement | null>(null);

onClickOutside(
	containerRef,
	() => {
		open.value = false;
	},
	{ ignore: [panelRef] },
);

watch(open, async (val) => {
	if (val) {
		await nextTick();
		const spaceBelow = windowHeight.value - triggerBottom.value;
		placement.value = spaceBelow < 250 ? "top" : "bottom";
	}
});

// Estilos do trigger
const sizeClasses: Record<"sm" | "md" | "lg", string> = {
	sm: "h-8 px-3 text-sm",
	md: "h-10 px-3 text-sm",
	lg: "h-12 px-4 text-base",
};

const triggerClasses = computed(() => [
	"flex items-center w-full rounded border bg-input transition-colors group focus-within:ring-2 focus-within:ring-primary/20 select-none cursor-pointer",
	sizeClasses[props.size],
	props.error ? "border-error" : "border-border",
	props.disabled
		? "opacity-50 cursor-not-allowed"
		: "hover:border-neutral-400 dark:hover:border-neutral-500",
]);

// Listas para horas e minutos
const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function selectHour(h: string) {
	hour.value = h;
	updateValue();
}

function selectMinute(m: string) {
	minute.value = m;
	updateValue();
}

function toggleOpen() {
	if (!props.disabled) open.value = !open.value;
}
</script>

<template>
	<div ref="containerRef" class="relative inline-flex w-full">
		<!-- Botão Trigger Visual (Substitui o <input>) -->
		<div
			ref="triggerRef"
			:class="triggerClasses"
			tabindex="0"
			role="button"
			@click="toggleOpen"
			@keydown.enter.prevent="toggleOpen"
			@keydown.space.prevent="toggleOpen"
		>
			<span class="text-foreground flex-1 font-medium tabular-nums">{{ hour }}:{{ minute }}</span>

			<Icon
				name="lucide:clock"
				class="text-muted-foreground group-hover:text-foreground ml-2 size-4 shrink-0 transition-colors"
				aria-hidden="true"
			/>
		</div>

		<!-- Painel Customizado Teleportado -->
		<Teleport to="body">
			<Transition
				enter-active-class="transition-all duration-150 ease-out"
				:enter-from-class="
					placement === 'bottom'
						? 'opacity-0 scale-95 -translate-y-1'
						: 'opacity-0 scale-95 translate-y-1'
				"
				enter-to-class="opacity-100 scale-100 translate-y-0"
				leave-active-class="transition-all duration-100 ease-in"
				leave-from-class="opacity-100 scale-100 translate-y-0"
				:leave-to-class="
					placement === 'bottom'
						? 'opacity-0 scale-95 -translate-y-1'
						: 'opacity-0 scale-95 translate-y-1'
				"
			>
				<div
					v-if="open"
					ref="panelRef"
					:style="panelStyle"
					class="border-border bg-popover fixed z-9999 flex h-56 w-40 overflow-hidden rounded-lg border shadow-lg"
				>
					<!-- Coluna de Horas -->
					<div class="no-scrollbar border-border bg-card flex-1 overflow-y-auto border-r">
						<div
							class="bg-muted/80 border-border text-muted-foreground sticky top-0 z-10 border-b py-1 text-center text-[10px] font-bold uppercase backdrop-blur-sm"
						>
							Hora
						</div>
						<div class="p-1">
							<button
								v-for="h in hoursList"
								:key="`h-${h}`"
								type="button"
								:class="[
									'block w-full rounded py-1.5 text-center text-sm transition-colors',
									h === hour
										? 'bg-primary text-primary-foreground font-semibold'
										: 'text-foreground hover:bg-muted font-medium',
								]"
								@click="selectHour(h)"
							>
								{{ h }}
							</button>
						</div>
					</div>

					<!-- Coluna de Minutos -->
					<div class="no-scrollbar bg-card flex-1 overflow-y-auto">
						<div
							class="bg-muted/80 border-border text-muted-foreground sticky top-0 z-10 border-b py-1 text-center text-[10px] font-bold uppercase backdrop-blur-sm"
						>
							Minuto
						</div>
						<div class="p-1">
							<button
								v-for="m in minutesList"
								:key="`m-${m}`"
								type="button"
								:class="[
									'block w-full rounded py-1.5 text-center text-sm transition-colors',
									m === minute
										? 'bg-primary text-primary-foreground font-semibold'
										: 'text-foreground hover:bg-muted font-medium',
								]"
								@click="selectMinute(m)"
							>
								{{ m }}
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<style scoped>
/* Utilitário para ocultar barra de rolagem mas manter funcionalidade */
.no-scrollbar::-webkit-scrollbar {
	display: none;
}
.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
