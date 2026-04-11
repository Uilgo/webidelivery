<script setup lang="ts">
/**
 * UiAvatar — Componente de avatar do design system WebiDelivery
 *
 * Exibe a foto do usuário em formato circular ou arredondado.
 * Quando a imagem não está disponível (ou falha ao carregar),
 * exibe as iniciais do nome fornecido como fallback.
 *
 * Props:
 *   - src:       URL da imagem do avatar (opcional)
 *   - alt:       texto alternativo da imagem (padrão: "Avatar")
 *   - name:      nome completo — usado para gerar iniciais no fallback
 *   - size:      tamanho do avatar (xs | sm | md | lg | xl), padrão: "md"
 *   - color:     cor do fundo do fallback (primary | secondary | neutral | success | info | warning | error), padrão: "primary"
 *   - rounded:   formato totalmente circular (padrão: true)
 *   - border:    exibe borda no avatar (padrão: false)
 *
 * Slots:
 *   - icon: slot para exibir um ícone customizado no lugar das iniciais
 *
 * Uso:
 *   <UiAvatar src="/foto.jpg" name="João Silva" />
 *   <UiAvatar name="Maria Oliveira" color="secondary" />
 *   <UiAvatar name="Admin" size="lg" :rounded="false" />
 *   <UiAvatar size="sm"><template #icon><Icon name="lucide:user" /></template></UiAvatar>
 */

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Color = "primary" | "secondary" | "neutral" | "success" | "info" | "warning" | "error";

const props = withDefaults(
	defineProps<{
		src?: string;
		alt?: string;
		name?: string;
		size?: Size;
		color?: Color;
		rounded?: boolean;
		border?: boolean;
	}>(),
	{
		src: undefined,
		name: undefined,
		alt: "Avatar",
		size: "md",
		color: "primary",
		rounded: true,
		border: false,
	},
);

// Controla se a imagem falhou ao carregar — ativa o fallback de iniciais
const imgError = ref(false);

// Ref do elemento <img> nativo para lidar com falhas antes do Vue hidratar
const imgRef = ref<HTMLImageElement | null>(null);

// Indica se deve exibir a imagem (tem src e não deu erro)
const showImage = computed(() => !!props.src && !imgError.value);

// Tratamento de falhas na hidratação (SSR)
// Se a imagem falhou de carregar antes de o Vue "acordar", o evento @error
// é perdido. Checamos se a imagem está 'complete' mas tem tamanho 0.
onMounted(() => {
	if (imgRef.value && imgRef.value.complete && imgRef.value.naturalHeight === 0) {
		imgError.value = true;
	}
});

// Reseta o estado de erro quando a src muda
watch(
	() => props.src,
	() => {
		imgError.value = false;
	},
);

// Gera as iniciais a partir do nome (até 2 caracteres)
const initials = computed(() => {
	if (!props.name) return "?";
	const parts = props.name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0]![0]!.toUpperCase();
	return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
});

// Mapa de tamanhos — dimensão + texto das iniciais
const sizeClasses: Record<Size, string> = {
	xs: "size-6 text-[10px]",
	sm: "size-8 text-xs",
	md: "size-10 text-sm", // 40px — Padrão
	lg: "size-12 text-base",
	xl: "size-16 text-lg",
};

// Mapa de cores para o fallback (fundo + texto)
const colorClasses: Record<Color, string> = {
	primary: "bg-primary text-primary-foreground",
	secondary: "bg-secondary text-secondary-foreground",
	neutral: "bg-neutral text-neutral-foreground",
	success: "bg-success text-success-foreground",
	info: "bg-info text-info-foreground",
	warning: "bg-warning text-warning-foreground",
	error: "bg-error text-error-foreground",
};

// Classes finais computadas
const classes = computed(() => [
	"inline-flex items-center justify-center shrink-0 overflow-hidden select-none font-medium",
	sizeClasses[props.size],
	props.rounded ? "rounded-full" : "rounded",
	props.border ? "ring-2 ring-card" : "",
	// Aplica cor de fundo somente quando não tem imagem
	!showImage.value ? colorClasses[props.color] : "",
]);
</script>

<template>
	<span :class="classes" role="img" :aria-label="alt">
		<!-- Imagem do avatar -->
		<img
			v-if="showImage"
			ref="imgRef"
			:src="src"
			:alt="alt"
			class="size-full object-cover"
			@error="imgError = true"
		/>

		<!-- Slot de ícone customizado -->
		<slot v-else-if="$slots.icon" name="icon"></slot>

		<!-- Fallback: iniciais do nome -->
		<span v-else aria-hidden="true">{{ initials }}</span>
	</span>
</template>
