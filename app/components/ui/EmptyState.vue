<script setup lang="ts">
/**
 * UiEmptyState — Estado vazio do design system WebiDelivery
 *
 * Componente para exibir quando uma lista, tabela ou seção
 * não possui dados. Incentiva o usuário a tomar uma ação.
 *
 * Props:
 *   - icon:         ícone central (ex: "lucide:inbox"), padrão: "lucide:inbox"
 *   - title:        título principal (ex: "Nenhum pedido encontrado")
 *   - description:  texto descritivo complementar (opcional)
 *   - size:         tamanho do layout (sm | md | lg), padrão: "md"
 *   - compact:      remove padding extra para uso inline (padrão: false)
 *
 * Slots:
 *   - icon:    slot para ícone/ilustração customizada (sobrepõe prop icon)
 *   - default: conteúdo adicional abaixo da descrição
 *   - actions: botões de ação (ex: "Criar novo", "Tentar novamente")
 *
 * Uso:
 *   <UiEmptyState
 *     icon="lucide:package"
 *     title="Nenhum produto"
 *     description="Comece adicionando seu primeiro produto ao catálogo."
 *   >
 *     <template #actions>
 *       <UiButton icon-left="lucide:plus">Adicionar produto</UiButton>
 *     </template>
 *   </UiEmptyState>
 *
 *   <UiEmptyState title="Sem resultados" description="Tente buscar com outros termos." size="sm" compact />
 */

type Size = "sm" | "md" | "lg";

const props = withDefaults(
	defineProps<{
		icon?: string;
		title: string;
		description?: string;
		size?: Size;
		compact?: boolean;
	}>(),
	{
		icon: "lucide:inbox",
		description: undefined,
		size: "md",
		compact: false,
	},
);

// Mapa de tamanhos — ícone + tipografia + paddings
const sizeConfig: Record<
	Size,
	{ icon: string; title: string; desc: string; padding: string; gap: string }
> = {
	sm: {
		icon: "size-8 text-muted-foreground/50",
		title: "text-sm font-semibold",
		desc: "text-xs",
		padding: "py-6",
		gap: "gap-2",
	},
	md: {
		icon: "size-12 text-muted-foreground/50",
		title: "text-base font-semibold",
		desc: "text-sm",
		padding: "py-10",
		gap: "gap-3",
	},
	lg: {
		icon: "size-16 text-muted-foreground/50",
		title: "text-lg font-semibold",
		desc: "text-base",
		padding: "py-16",
		gap: "gap-4",
	},
};

const config = computed(() => sizeConfig[props.size]);
</script>

<template>
	<div
		:class="[
			'flex flex-col items-center justify-center text-center',
			config.gap,
			compact ? 'py-4' : config.padding,
		]"
	>
		<!-- Ícone / Ilustração -->
		<div class="mb-1">
			<slot name="icon">
				<Icon :name="icon" :class="config.icon" aria-hidden="true" />
			</slot>
		</div>

		<!-- Título -->
		<h4 :class="['text-foreground', config.title]">{{ title }}</h4>

		<!-- Descrição -->
		<p v-if="description" :class="['text-muted-foreground max-w-sm', config.desc]">
			{{ description }}
		</p>

		<!-- Conteúdo adicional (slot default) -->
		<slot></slot>

		<!-- Ações -->
		<div v-if="$slots.actions" class="mt-3 flex items-center gap-2">
			<slot name="actions"></slot>
		</div>
	</div>
</template>
