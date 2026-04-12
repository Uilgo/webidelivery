<script setup lang="ts">
/**
 * ViewToggle — Alterna entre modo Card (grade) e Lista (tabela).
 *
 * Props:
 *   - modelValue: modo atual ('card' | 'list')
 *
 * Emits:
 *   - update:modelValue: novo modo selecionado
 */

type ViewMode = "card" | "list";

const props = defineProps<{ modelValue: ViewMode }>();
const emit = defineEmits<{ "update:modelValue": [value: ViewMode] }>();
</script>

<template>
	<div class="bg-muted flex items-center rounded-lg p-1">
		<button
			type="button"
			class="inline-flex size-8 items-center justify-center rounded-md transition-colors"
			:class="
				props.modelValue === 'card'
					? 'bg-card text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'
			"
			aria-label="Modo grade"
			@click="emit('update:modelValue', 'card')"
		>
			<Icon name="lucide:layout-grid" class="size-4" />
		</button>
		<button
			type="button"
			class="inline-flex size-8 items-center justify-center rounded-md transition-colors"
			:class="
				props.modelValue === 'list'
					? 'bg-card text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'
			"
			aria-label="Modo lista"
			@click="emit('update:modelValue', 'list')"
		>
			<Icon name="lucide:list" class="size-4" />
		</button>
	</div>
</template>
