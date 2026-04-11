<script setup lang="ts">
/**
 * UiSelectMenu — Select com campo de pesquisa integrado
 *
 * Igual ao UiSelect, porém possui um campo de pesquisa no topo do painel
 * para filtrar as opções dinamicamente. Ideal para listas longas.
 *
 * Props:
 *   - options:       lista de opções { label, value, icon?, disabled? }
 *   - placeholder:   texto quando nenhuma opção selecionada
 *   - searchPlaceholder: placeholder do campo de pesquisa
 *   - label:         label acima do campo
 *   - size:          tamanho (sm | md | lg), padrão: "md"
 *   - error:         ativa estado de erro visual
 *   - hint:          texto auxiliar abaixo do campo
 *   - disabled:      desabilita o campo
 *   - id:            id do elemento (gerado automaticamente se omitido)
 *   - emptyMessage:  texto quando nenhuma opção encontrada na pesquisa
 *
 * Model:
 *   - modelValue: valor selecionado (string)
 *
 * Uso:
 *   <UiSelectMenu v-model="cidade" :options="cidadesOptions" label="Cidade" search-placeholder="Buscar cidade..." />
 */

import type { SelectOption } from "./Select.vue";

type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		options: SelectOption[];
		placeholder?: string;
		searchPlaceholder?: string;
		label?: string;
		size?: Size;
		error?: boolean;
		hint?: string;
		disabled?: boolean;
		id?: string;
		emptyMessage?: string;
		fullWidth?: boolean;
		creatable?: boolean;
	}>(),
	{
		placeholder: "Selecione...",
		searchPlaceholder: "Pesquisar...",
		size: "md",
		error: false,
		disabled: false,
		emptyMessage: "Nenhuma opção encontrada.",
		fullWidth: true,
		creatable: false,
		label: undefined,
		hint: undefined,
		id: undefined,
	},
);

// v-model bidirecional
const model = defineModel<string>();

// Controle de abertura e pesquisa
const open = ref(false);
const placement = ref<"top" | "bottom">("bottom");
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const { bottom: triggerBottom } = useElementBounding(triggerRef);
const { height: windowHeight } = useWindowSize();

// Fecha ao clicar fora
onClickOutside(containerRef, () => {
	// Se for creatable, ele tiver digitado algo válido e não for match existente, auto-selecionamos
	if (props.creatable && searchQuery.value.trim() && !exactMatchExists.value) {
		model.value = searchQuery.value.trim();
	}
	open.value = false;
	searchQuery.value = "";
});

// Detecta se deve abrir para cima ou para baixo toda vez que abrir
watch(open, async (val) => {
	if (val) {
		// Aguarda o DOM atualizar para ter as medidas corretas do trigger
		await nextTick();
		const spaceBelow = windowHeight.value - triggerBottom.value;
		// Se houver menos de 260px abaixo, abre para cima
		placement.value = spaceBelow < 260 ? "top" : "bottom";
	}
});

// ID estável para acessibilidade via useId() do Nuxt
const generatedId = useId();
const selectId = computed(() => props.id ?? generatedId);

// Opção selecionada atualmente (se for creatable e não existir, criamos um mock visual)
const selectedOption = computed(() => {
	const opt = props.options.find((o) => o.value === model.value);
	if (!opt && props.creatable && model.value) {
		return { label: model.value, value: model.value };
	}
	return opt;
});

// Opções filtradas pela pesquisa (case insensitive)
const filteredOptions = computed(() => {
	if (!searchQuery.value) return props.options;
	const q = searchQuery.value.toLowerCase();
	return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

// Opção exata existe? Se não existir e for creatable, mostramos o botão de criar
const exactMatchExists = computed(() => {
	const q = searchQuery.value.trim().toLowerCase();
	return props.options.some((o) => o.label.toLowerCase() === q || o.value.toLowerCase() === q);
});

// Mapa de tamanhos (independente, replicando a escala do sistema)
const sizeClasses: Record<Size, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-3 text-sm", // 40px — Padrão
	lg: "h-12 px-4 text-base",
};

// Classes do trigger (nativas)
const triggerClasses = computed(() => [
	"flex items-center w-full rounded border bg-card text-foreground gap-2 transition-colors cursor-pointer select-none whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/20",
	sizeClasses[props.size],
	props.error ? "border-error" : "border-border",
	props.disabled
		? "opacity-50 cursor-not-allowed"
		: "hover:border-neutral-400 dark:hover:border-neutral-500",
]);

// Ao abrir, foca o campo de pesquisa
function toggleOpen() {
	open.value = !open.value;
	if (open.value) {
		searchQuery.value = "";
		nextTick(() => searchInputRef.value?.focus());
	}
}

// Seleciona uma opção, fecha o painel e limpa a pesquisa
function selectOption(option: SelectOption) {
	if (option.disabled) return;
	model.value = option.value;
	open.value = false;
	searchQuery.value = "";
}

// Quando pressiona Enter na busca
function onEnterSearch() {
	if (filteredOptions.value.length > 0) {
		const first = filteredOptions.value[0];
		if (first) selectOption(first);
	} else if (props.creatable && searchQuery.value.trim() && !exactMatchExists.value) {
		selectOption({ label: searchQuery.value.trim(), value: searchQuery.value.trim() });
	}
}
</script>

<template>
	<div ref="containerRef" class="relative flex w-full flex-col gap-1.5">
		<!-- Label -->
		<label v-if="label" :for="selectId" class="text-foreground text-sm font-medium">
			{{ label }}
		</label>

		<!-- Container do campo (Botão + Painel) -->
		<div class="relative">
			<!-- Trigger -->
			<button
				:id="selectId"
				ref="triggerRef"
				type="button"
				:disabled="disabled"
				:aria-expanded="open"
				:aria-invalid="error"
				:aria-describedby="hint ? `${selectId}-hint` : undefined"
				aria-haspopup="listbox"
				:class="triggerClasses"
				@click="toggleOpen"
			>
				<!-- Ícone da opção selecionada -->
				<Icon
					v-if="selectedOption?.icon"
					:name="selectedOption.icon"
					class="text-muted-foreground size-4 shrink-0"
					aria-hidden="true"
				/>

				<!-- Texto selecionado ou placeholder -->
				<span
					class="flex-1 truncate text-left"
					:class="selectedOption ? 'text-foreground' : 'text-muted-foreground'"
				>
					{{ selectedOption?.label ?? placeholder }}
				</span>

				<!-- Chevron -->
				<Icon
					name="lucide:chevrons-up-down"
					class="text-muted-foreground size-4 shrink-0"
					aria-hidden="true"
				/>
			</button>

			<!-- Painel de opções com pesquisa -->
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
					:class="[
						'border-border bg-popover absolute left-0 z-50 rounded border shadow-md',
						fullWidth ? 'w-full' : 'min-w-64',
						placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
					]"
				>
					<!-- Campo de pesquisa fixo no topo -->
					<div class="border-border border-b p-1.5">
						<div class="bg-input flex h-8 items-center gap-2 rounded px-2.5">
							<Icon
								name="lucide:search"
								class="text-muted-foreground size-4 shrink-0"
								aria-hidden="true"
							/>
							<input
								ref="searchInputRef"
								v-model="searchQuery"
								type="text"
								:placeholder="searchPlaceholder"
								class="text-foreground placeholder:text-muted-foreground h-full flex-1 bg-transparent text-sm outline-none"
								@keydown.enter.prevent="onEnterSearch"
							/>
						</div>
					</div>

					<!-- Lista de opções filtradas -->
					<div role="listbox" class="flex max-h-52 flex-col gap-0.5 overflow-y-auto p-1">
						<!-- Mensagem vazia se não for creatable -->
						<p
							v-if="filteredOptions.length === 0 && (!creatable || !searchQuery)"
							class="text-muted-foreground px-2.5 py-4 text-center text-sm"
						>
							{{ emptyMessage }}
						</p>

						<button
							v-for="option in filteredOptions"
							:key="option.value"
							type="button"
							role="option"
							:aria-selected="option.value === model"
							:disabled="option.disabled"
							:class="[
								'flex w-full items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors',
								option.value === model
									? 'bg-accent text-foreground font-medium'
									: option.disabled
										? 'text-muted-foreground cursor-not-allowed opacity-50'
										: 'text-foreground hover:bg-accent',
							]"
							@click="selectOption(option)"
						>
							<Icon
								v-if="option.icon"
								:name="option.icon"
								class="size-4 shrink-0"
								aria-hidden="true"
							/>
							<span class="flex-1 text-left">{{ option.label }}</span>
							<Icon
								v-if="option.value === model"
								name="lucide:check"
								class="text-primary size-4 shrink-0"
								aria-hidden="true"
							/>
						</button>

						<!-- Opção de criação dinâmica -->
						<button
							v-if="creatable && searchQuery && !exactMatchExists"
							type="button"
							role="option"
							class="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors"
							@click="selectOption({ label: searchQuery, value: searchQuery })"
						>
							<Icon name="lucide:plus" class="text-primary size-4 shrink-0" aria-hidden="true" />
							<span class="flex-1 text-left font-medium">Criar "{{ searchQuery }}"</span>
						</button>
					</div>
				</div>
			</Transition>
		</div>

		<!-- Hint / Erro -->
		<p
			v-if="hint"
			:id="`${selectId}-hint`"
			:class="['text-xs', error ? 'text-error' : 'text-muted-foreground']"
		>
			{{ hint }}
		</p>
	</div>
</template>
