<script setup lang="ts">
/**
 * UiModal — Pop-up centralizado do design system WebiDelivery
 */
import { computed, watch } from "vue";

const model = defineModel<boolean>({ required: true });

const props = withDefaults(
	defineProps<{
		title?: string;
		description?: string;
		isEdicao?: boolean;
	}>(),
	{
		title: "",
		description: "",
		isEdicao: false,
	},
);

const emit = defineEmits<{
	confirm: [];
	close: [];
}>();

// Bloqueia o scroll do body quando o modal está aberto
const isLocked = useScrollLock(typeof window !== "undefined" ? document.body : null);
watch(model, (val) => {
	isLocked.value = val;
	if (val) {
		window.addEventListener("keydown", handleEscape);
	} else {
		window.removeEventListener("keydown", handleEscape);
	}
});

function handleEscape(e: KeyboardEvent) {
	if (e.key === "Escape" && model.value) {
		model.value = false;
	}
}

onUnmounted(() => {
	window.removeEventListener("keydown", handleEscape);
});

const defaultTitle = computed(() =>
	props.title ? props.title : props.isEdicao ? "Editar Registro" : "Novo Registro",
);

const defaultConfirmText = computed(() =>
	props.isEdicao ? "Salvar Alterações" : "Criar Registro",
);
</script>

<template>
	<Teleport to="body">
		<!-- Container Principal com v-show para não interromper a animação de saída -->
		<div v-show="model" class="fixed inset-0 z-50 hidden items-center justify-center p-4 md:flex">
			<!-- Transição do Backdrop (Fade Suave) -->
			<Transition
				enter-active-class="transition-opacity duration-300 ease-out"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="transition-opacity duration-300 ease-in"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<div
					v-if="model"
					class="bg-background/80 absolute inset-0 backdrop-blur-sm"
					@click="model = false"
				></div>
			</Transition>

			<!-- Transição do Modal (Suave Scale + Fade) -->
			<Transition
				enter-active-class="transition-all duration-300 ease-out"
				enter-from-class="opacity-0 scale-95 translate-y-4"
				enter-to-class="opacity-100 scale-100 translate-y-0"
				leave-active-class="transition-all duration-300 ease-in"
				leave-from-class="opacity-100 scale-100 translate-y-0"
				leave-to-class="opacity-0 scale-95 translate-y-4"
			>
				<div
					v-if="model"
					role="dialog"
					aria-modal="true"
					class="border-border bg-card relative z-10 w-full max-w-lg rounded-xl border p-6 shadow-xl"
				>
					<!-- Botão fechar (X) -->
					<button
						type="button"
						class="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-primary/50 absolute top-4 right-4 rounded-full p-1.5 transition-colors outline-none focus-visible:ring-2"
						aria-label="Fechar modal"
						@click="model = false"
					>
						<Icon name="lucide:x" class="size-5" />
					</button>

					<!-- Cabeçalho -->
					<div class="mb-6 space-y-1 pr-6">
						<h2 class="text-card-foreground text-xl font-semibold tracking-tight">
							<slot name="title">{{ defaultTitle }}</slot>
						</h2>
						<p v-if="description || $slots.description" class="text-muted-foreground text-sm">
							<slot name="description">{{ description }}</slot>
						</p>
					</div>

					<!-- Corpo Principal -->
					<div class="max-h-[60vh] space-y-4 overflow-y-auto">
						<slot></slot>
					</div>

					<!-- Rodapé com botões -->
					<div class="mt-8 flex justify-end gap-3">
						<slot name="footer">
							<button
								type="button"
								class="bg-neutral/10 text-neutral hover:bg-neutral/20 inline-flex h-10 items-center justify-center rounded px-4 text-sm font-medium whitespace-nowrap transition-colors select-none"
								@click="model = false"
							>
								Cancelar
							</button>
							<button
								type="button"
								:class="[
									'inline-flex h-10 items-center justify-center rounded px-4 text-sm font-medium whitespace-nowrap shadow-sm transition-colors select-none',
									isEdicao
										? 'bg-info text-info-foreground hover:bg-info/90'
										: 'bg-success text-success-foreground hover:bg-success/90',
								]"
								@click="emit('confirm')"
							>
								{{ defaultConfirmText }}
							</button>
						</slot>
					</div>
				</div>
			</Transition>
		</div>
	</Teleport>
</template>
