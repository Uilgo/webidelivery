<script setup lang="ts">
/**
 * UiBottomSheet — Painel inferior do design system WebiDelivery
 *
 * Exclusivo para telas mobile (flex md:hidden), com um mínimo de 320px.
 * Desliza de baixo para cima.
 *
 * Props:
 *   - modelValue: boolean (v-model) - controla a abertura.
 *   - title:      string - Título do bottom sheet.
 *   - description:string - Subtítulo / descrição.
 *   - isEdicao:   boolean - Muda visual/textos para criação (false) ou edição (true).
 *
 * Slots:
 *   - default:     conteúdo principal.
 *   - title:       para substituir o título todo.
 *   - description: para substituir a descrição.
 *   - footer:      para substituir a área de botões.
 *
 * Emits:
 *   - confirm: disparado ao clicar no botão de ação principal.
 */
import { computed, watch, ref } from "vue";

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

// Bloqueia o scroll do body quando está aberto
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

// Textos dinâmicos baseados na prop isEdicao
const defaultTitle = computed(() =>
	props.title ? props.title : props.isEdicao ? "Editar Registro" : "Novo Registro",
);

const defaultConfirmText = computed(() => (props.isEdicao ? "Salvar Alterações" : "Criar"));

// Lógica de deslizar para baixo (Swipe) para fechar
const sheetRef = ref<HTMLElement | null>(null);
const { distanceY, isSwiping, direction } = usePointerSwipe(sheetRef, {
	disableTextSelect: true,
	onSwipeEnd: (_e: Event, direction: string) => {
		// Se o usuário arrastou mais de 50px para baixo.
		if ((direction === "DOWN" || direction === "down") && Math.abs(distanceY.value) > 50) {
			model.value = false;
		}
	},
});
</script>

<template>
	<Teleport to="body">
		<!-- Transição do Backdrop -->
		<Transition
			enter-active-class="transition-opacity duration-300 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-opacity duration-200 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<!-- Container exclusivo para Mobile (flex md:hidden) -->
			<div
				v-if="model"
				class="bg-background/80 fixed inset-x-0 top-0 bottom-0 z-50 flex flex-col justify-end backdrop-blur-sm md:hidden"
			>
				<!-- Fundo clicável para fechar -->
				<div class="absolute inset-0" @click="model = false"></div>

				<!-- Transição do Bottom Sheet -->
				<Transition
					enter-active-class="transition-transform duration-300 ease-out"
					enter-from-class="translate-y-full"
					enter-to-class="translate-y-0"
					leave-active-class="transition-transform duration-200 ease-in"
					leave-from-class="translate-y-0"
					leave-to-class="translate-y-full"
				>
					<div
						v-if="model"
						ref="sheetRef"
						role="dialog"
						aria-modal="true"
						class="border-border bg-card relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl border-t shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
						:style="{
							transform:
								isSwiping && direction === 'down' ? `translateY(${Math.abs(distanceY)}px)` : '',
							transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
						}"
					>
						<!-- Alça (Handle) de arrastar -->
						<div
							class="focus-visible:ring-primary/20 flex w-full cursor-grab touch-none justify-center rounded-t-2xl py-3 outline-none focus-visible:ring-2 active:cursor-grabbing"
							role="button"
							tabindex="0"
							aria-label="Arraste para fechar"
							@click="model = false"
							@keydown.enter="model = false"
							@keydown.space.prevent="model = false"
						>
							<div class="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
						</div>

						<!-- Cabeçalho -->
						<div class="space-y-1 px-6 pb-2 text-center">
							<h2 class="text-card-foreground text-xl font-semibold tracking-tight">
								<slot name="title">{{ defaultTitle }}</slot>
							</h2>
							<p v-if="description || $slots.description" class="text-muted-foreground text-sm">
								<slot name="description">{{ description }}</slot>
							</p>
						</div>

						<!-- Corpo Principal -->
						<div class="flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-6 py-4">
							<slot></slot>
						</div>

						<!-- Rodapé com botões full width -->
						<div
							class="border-border mt-2 mb-[env(safe-area-inset-bottom)] grid gap-3 border-t p-6 pb-10"
						>
							<slot name="footer">
								<button
									type="button"
									:class="[
										'inline-flex h-12 w-full items-center justify-center rounded px-6 text-base font-medium whitespace-nowrap shadow-sm transition-colors select-none',
										isEdicao
											? 'bg-info text-info-foreground hover:bg-info/90'
											: 'bg-success text-success-foreground hover:bg-success/90',
									]"
									@click="emit('confirm')"
								>
									{{ defaultConfirmText }}
								</button>
								<button
									type="button"
									class="bg-neutral/10 text-neutral hover:bg-neutral/20 inline-flex h-10 w-full items-center justify-center rounded px-4 text-sm font-medium whitespace-nowrap transition-colors select-none"
									@click="model = false"
								>
									Cancelar
								</button>
							</slot>
						</div>
					</div>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>
