<script setup lang="ts">
/**
 * UiDrawer — Painel lateral do design system WebiDelivery
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

// Bloqueia o scroll do body quando o drawer está aberto
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
		<!-- Container que coordena a exibição global — Fica lá enquanto houver conteúdo ou transição -->
		<div v-show="model" class="fixed inset-0 z-100 hidden md:block">
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

			<!-- Transição do Painel lateral (Slide Suave da Direita) -->
			<Transition
				enter-active-class="transition-transform duration-300 ease-out"
				enter-from-class="translate-x-full"
				enter-to-class="translate-x-0"
				leave-active-class="transition-transform duration-300 ease-in"
				leave-from-class="translate-x-0"
				leave-to-class="translate-x-full"
			>
				<div
					v-if="model"
					role="dialog"
					aria-modal="true"
					class="border-border bg-card absolute inset-y-0 right-0 z-10 flex h-full w-full max-w-md flex-col border-l shadow-2xl"
				>
					<!-- Cabeçalho -->
					<div class="border-border flex items-start justify-between border-b p-6">
						<div class="space-y-1 pr-4">
							<h2 class="text-card-foreground text-xl font-semibold tracking-tight">
								<slot name="title">{{ defaultTitle }}</slot>
							</h2>
							<p v-if="description || $slots.description" class="text-muted-foreground text-sm">
								<slot name="description">{{ description }}</slot>
							</p>
						</div>
						<button
							type="button"
							class="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-primary/50 rounded-full p-1.5 transition-colors outline-none focus-visible:ring-2"
							aria-label="Fechar painel"
							@click="model = false"
						>
							<Icon name="lucide:x" class="size-5" />
						</button>
					</div>

					<!-- Corpo Principal -->
					<div class="flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-6">
						<slot></slot>
					</div>

					<!-- Rodapé com botões -->
					<div class="border-border bg-card flex justify-end gap-3 border-t p-6">
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
