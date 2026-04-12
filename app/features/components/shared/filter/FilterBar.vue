<script setup lang="ts">
/**
 * FilterBar — Barra de controle global das listagens.
 *
 * Combina busca, filtros, ViewToggle e botão "Novo" em uma única barra.
 *
 * Props:
 *   - createLabel:  texto do botão de criação (ex: "Nova Categoria")
 *   - viewMode:     modo de visualização atual ('card' | 'list')
 *   - showCreate:   exibe o botão de criação (padrão: true)
 *   - showView:     exibe o ViewToggle (padrão: true)
 *   - placeholder:  placeholder do campo de busca
 *
 * Emits:
 *   - create:             clique no botão "Novo"
 *   - update:viewMode:    mudança de modo de visualização
 *
 * Slots:
 *   - filters: área de filtros customizados (selects, datas, etc.)
 */

type ViewMode = "card" | "list";

withDefaults(
	defineProps<{
		createLabel?: string;
		viewMode?: ViewMode;
		showCreate?: boolean;
		showView?: boolean;
		placeholder?: string;
	}>(),
	{
		createLabel: "Novo",
		viewMode: "card",
		showCreate: true,
		showView: true,
		placeholder: "Buscar...",
	},
);

const emit = defineEmits<{
	create: [];
	"update:viewMode": [value: ViewMode];
}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3">
		<!-- Filtros customizados (slot) -->
		<slot name="filters"></slot>

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- ViewToggle -->
		<ViewToggle
			v-if="showView"
			:model-value="viewMode"
			@update:model-value="emit('update:viewMode', $event)"
		/>

		<!-- Botão criar -->
		<UiButton v-if="showCreate" icon-left="lucide:plus" size="md" @click="emit('create')">
			{{ createLabel }}
		</UiButton>
	</div>
</template>
