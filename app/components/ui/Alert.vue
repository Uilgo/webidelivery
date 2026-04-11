<script setup lang="ts">
/**
 * UiAlert — Caixa de alerta/notificação inline do design system WebiDelivery
 *
 * Exibe uma mensagem contextual com ícone, título e descrição.
 * Segue as cores semânticas do design system e pode ser dispensada.
 *
 * Props:
 *   - color:       cor semântica (primary | secondary | neutral | success | info | warning | error), padrão: "info"
 *   - variant:     estilo visual (soft | solid | outline), padrão: "soft"
 *   - icon:        ícone customizado (se omitido, usa ícone padrão por cor)
 *   - title:       título do alerta (opcional)
 *   - closable:    exibe botão de fechar (padrão: false)
 *
 * Eventos:
 *   - close: emitido ao clicar no botão de fechar
 *
 * Slots:
 *   - default:     conteúdo/descrição do alerta
 *   - title:       slot para título customizado (sobrepõe prop title)
 *   - actions:     ações adicionais no rodapé do alerta (botões, links)
 *
 * Uso:
 *   <UiAlert color="success" title="Sucesso!">Operação concluída.</UiAlert>
 *   <UiAlert color="error" closable @close="fechar">Algo deu errado.</UiAlert>
 *   <UiAlert color="warning" variant="outline" icon="lucide:alert-triangle">Atenção!</UiAlert>
 */

type Color = "primary" | "secondary" | "neutral" | "success" | "info" | "warning" | "error";
type Variant = "soft" | "solid" | "outline";

const props = withDefaults(
	defineProps<{
		color?: Color;
		variant?: Variant;
		icon?: string;
		title?: string;
		closable?: boolean;
	}>(),
	{
		color: "info",
		variant: "soft",
		icon: undefined,
		title: undefined,
		closable: false,
	},
);

const emit = defineEmits<{ close: [] }>();

// Controla se o alerta está visível (para closable)
const visible = ref(true);

// Fecha o alerta e emite evento
function close() {
	visible.value = false;
	emit("close");
}

// Ícones padrão por cor semântica (quando icon não é fornecido)
const defaultIcons: Record<Color, string> = {
	primary: "lucide:info",
	secondary: "lucide:info",
	neutral: "lucide:info",
	success: "lucide:circle-check",
	info: "lucide:info",
	warning: "lucide:triangle-alert",
	error: "lucide:circle-x",
};

// Ícone efetivo — prop ou padrão da cor
const effectiveIcon = computed(() => props.icon ?? defaultIcons[props.color]);

// Mapa de variante + cor → classes Tailwind
const variantColorMap: Record<Variant, Record<Color, string>> = {
	soft: {
		primary: "bg-primary/10 text-primary",
		secondary: "bg-secondary/10 text-secondary",
		neutral: "bg-neutral/10 text-foreground",
		success: "bg-success/10 text-success",
		info: "bg-info/10 text-info",
		warning: "bg-warning/10 text-warning",
		error: "bg-error/10 text-error",
	},
	solid: {
		primary: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		neutral: "bg-neutral text-neutral-foreground",
		success: "bg-success text-success-foreground",
		info: "bg-info text-info-foreground",
		warning: "bg-warning text-warning-foreground",
		error: "bg-error text-error-foreground",
	},
	outline: {
		primary: "border border-primary text-primary bg-transparent",
		secondary: "border border-secondary text-secondary bg-transparent",
		neutral: "border border-border text-foreground bg-transparent",
		success: "border border-success text-success bg-transparent",
		info: "border border-info text-info bg-transparent",
		warning: "border border-warning text-warning bg-transparent",
		error: "border border-error text-error bg-transparent",
	},
};

// Classes finais computadas
const classes = computed(() => [
	"flex gap-3 rounded p-4 text-sm",
	variantColorMap[props.variant][props.color],
]);
</script>

<template>
	<div v-if="visible" :class="classes" role="alert">
		<!-- Ícone do alerta -->
		<Icon :name="effectiveIcon" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />

		<!-- Conteúdo principal -->
		<div class="min-w-0 flex-1">
			<!-- Título (slot ou prop) -->
			<div v-if="$slots.title || title" class="mb-1 font-semibold">
				<slot name="title">{{ title }}</slot>
			</div>

			<!-- Descrição -->
			<div class="leading-relaxed opacity-90">
				<slot></slot>
			</div>

			<!-- Ações adicionais -->
			<div v-if="$slots.actions" class="mt-3 flex items-center gap-2">
				<slot name="actions"></slot>
			</div>
		</div>

		<!-- Botão de fechar -->
		<button
			v-if="closable"
			type="button"
			class="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
			aria-label="Fechar alerta"
			@click="close"
		>
			<Icon name="lucide:x" class="size-4" aria-hidden="true" />
		</button>
	</div>
</template>
