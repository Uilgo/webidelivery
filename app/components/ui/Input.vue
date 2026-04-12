<script setup lang="ts">
/**
 * UiInput — Campo de entrada base do design system WebiDelivery
 *
 * Ícones via props (usando @nuxt/icon + lucide):
 *   - iconLeft:  ícone no lado esquerdo (ex: "lucide:search")
 *   - iconRight: ícone no lado direito (ex: "lucide:calendar")
 *   Quando type="password", o ícone direito é substituído automaticamente
 *   pelo toggle de visibilidade (olho), ignorando iconRight.
 *
 * Formatação automática:
 *   - format="currency": formata como moeda BRL (R$ 1.234,56) enquanto digita.
 *     O v-model recebe/emite o valor numérico (number).
 *     Internamente exibe o valor formatado e converte no input/blur.
 *
 * Estados visuais:
 *   - padrão:   borda neutra
 *   - error:    borda vermelha
 *   - disabled: opacidade reduzida, cursor not-allowed
 *
 * Props:
 *   - type:        tipo do input HTML (padrão: "text")
 *   - format:      formatação especial ("currency" | undefined)
 *   - placeholder: texto de placeholder
 *   - disabled:    desabilita o campo
 *   - error:       ativa estado de erro visual
 *   - hint:        texto auxiliar abaixo do campo
 *   - label:       label acima do campo
 *   - id:          id do input (gerado automaticamente se omitido)
 *   - iconLeft:    nome do ícone à esquerda
 *   - iconRight:   nome do ícone à direita (ignorado em type="password")
 *   - forgotLabel: texto do link "esqueci a senha" (padrão: "Esqueci a senha")
 *   - forgotHref:  destino do link — se omitido, emite evento "forgot" ao clicar
 *
 * Eventos:
 *   - forgot: emitido ao clicar no link de esqueci a senha (quando forgotHref não definido)
 *
 * Uso:
 *   <UiInput v-model="q" icon-left="lucide:search" placeholder="Buscar..." />
 *   <UiInput v-model="preco" format="currency" icon-left="lucide:dollar-sign" />
 *   <UiInput v-model="senha" type="password" label="Senha" forgot-href="/recuperar" />
 *   <UiInput v-model="email" type="email" :error="true" hint="E-mail inválido" />
 */

const props = withDefaults(
	defineProps<{
		type?: string;
		format?: "currency";
		placeholder?: string;
		disabled?: boolean;
		error?: boolean;
		hint?: string;
		label?: string;
		id?: string;
		iconLeft?: string;
		iconRight?: string;
		forgotLabel?: string;
		forgotHref?: string;
		size?: "sm" | "md" | "lg";
		autocomplete?: string;
		errorMessage?: string;
		prefix?: string;
		suffix?: string;
	}>(),
	{
		type: "text",
		format: undefined,
		disabled: false,
		error: false,
		forgotLabel: "Esqueci a senha",
		size: "md",
		placeholder: undefined,
		hint: undefined,
		label: undefined,
		id: undefined,
		iconLeft: undefined,
		iconRight: undefined,
		forgotHref: undefined,
		autocomplete: undefined,
		errorMessage: undefined,
		prefix: undefined,
		suffix: undefined,
	},
);

defineEmits<{ forgot: [] }>();

// v-model nativo via defineModel (Vue 3.4+)
// Para format="currency", o modelo externo é number; internamente exibimos string formatada
const model = defineModel<string | number>();

// ─── Formatação de moeda ──────────────────────────────────────────────────────

// Converte string formatada (ex: "1.234,56") para número (1234.56)
function parseCurrencyInline(value: string): number {
	if (!value || typeof value !== "string") return 0;
	const cleaned = value.replace(/[^\d,]/g, "");
	const normalized = cleaned.replace(",", ".");
	return parseFloat(normalized) || 0;
}

// Formata número como moeda BRL sem símbolo (ex: 1234.56 → "1.234,56")
function formatCurrencyInline(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	})
		.format(value)
		.replace("R$", "")
		.trim();
}

// Valor exibido no input (string formatada quando format="currency")
const displayValue = ref("");

// Inicializa o display quando o modelo externo muda
watch(
	() => model.value,
	(val) => {
		if (props.format !== "currency") return;
		const num = typeof val === "number" ? val : parseCurrencyInline(String(val ?? ""));
		const current = parseCurrencyInline(displayValue.value);
		if (num !== current) {
			displayValue.value = num > 0 ? formatCurrencyInline(num) : "";
		}
	},
	{ immediate: true },
);

function onCurrencyInput(e: Event) {
	const raw = (e.target as HTMLInputElement).value;
	displayValue.value = raw.replace(/[^\d,]/g, "");
}

function onCurrencyBlur() {
	const num = parseCurrencyInline(displayValue.value);
	displayValue.value = num > 0 ? formatCurrencyInline(num) : "";
	model.value = num;
}

// ─── Senha ────────────────────────────────────────────────────────────────────

const showPassword = ref(false);

const inputType = computed(() => {
	if (props.type !== "password") return props.type;
	return showPassword.value ? "text" : "password";
});

// ─── ID ───────────────────────────────────────────────────────────────────────

const inputId = useId();
const effectiveId = computed(() => props.id ?? inputId);

// ─── Autocomplete ─────────────────────────────────────────────────────────────

const defaultAutocompletes: Record<string, string> = {
	password: "current-password",
	email: "email",
	tel: "tel",
	url: "url",
	text: "off",
};

const effectiveAutocomplete = computed(() => {
	if (props.autocomplete) return props.autocomplete;
	return defaultAutocompletes[props.type] || undefined;
});

// ─── Tamanhos ─────────────────────────────────────────────────────────────────

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
	sm: "h-8 text-xs",
	md: "h-10 text-sm",
	lg: "h-12 text-base",
};

const wrapperClasses = computed(() => [
	"flex items-center w-full rounded border bg-input gap-2 transition-colors",
	sizeClasses[props.size],
	props.error ? "border-error" : "border-border",
	props.disabled ? "opacity-50 cursor-not-allowed" : "",
]);
</script>

<template>
	<div class="flex w-full flex-col gap-1.5">
		<!-- Label -->
		<label v-if="label" :for="effectiveId" class="text-foreground text-sm font-medium">
			{{ label }}
		</label>

		<!-- Wrapper: borda + ícones + input alinhados em todos os eixos -->
		<div :class="['ui-input-wrapper overflow-hidden', ...wrapperClasses]">
			<!-- Ícone esquerdo -->
			<Icon
				v-if="iconLeft"
				:name="iconLeft"
				class="text-muted-foreground ml-3 size-4 shrink-0"
				aria-hidden="true"
			/>

			<!-- Prefixo (Static Text ou Slot) -->
			<span
				v-if="prefix || $slots.prefix"
				class="text-muted-foreground bg-muted border-border flex h-full shrink-0 items-center border-r px-3 text-sm select-none"
			>
				<slot name="prefix">{{ prefix }}</slot>
			</span>

			<!-- Campo de entrada — modo currency -->
			<input
				v-if="format === 'currency'"
				:id="effectiveId"
				:value="displayValue"
				type="text"
				inputmode="decimal"
				:placeholder="placeholder ?? '0,00'"
				:disabled="disabled"
				autocomplete="off"
				:aria-invalid="error"
				:aria-describedby="hint ? `${effectiveId}-hint` : undefined"
				:class="[
					'text-foreground placeholder:text-muted-foreground h-full w-full min-w-0 flex-1 bg-transparent tabular-nums outline-none',
					prefix || $slots.prefix ? 'pl-3' : iconLeft ? 'pl-1' : 'pl-4',
					suffix || $slots.suffix ? 'pr-3' : iconRight ? 'pr-1' : 'pr-4',
				]"
				@input="onCurrencyInput"
				@blur="onCurrencyBlur"
			/>

			<!-- Campo de entrada — modo padrão -->
			<input
				v-else
				:id="effectiveId"
				v-model="model"
				:type="inputType"
				:placeholder="placeholder"
				:disabled="disabled"
				:autocomplete="effectiveAutocomplete"
				:aria-invalid="error"
				:aria-describedby="hint ? `${effectiveId}-hint` : undefined"
				:class="[
					'text-foreground placeholder:text-muted-foreground h-full w-full min-w-0 flex-1 [appearance:textfield] bg-transparent outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
					prefix || $slots.prefix ? 'pl-3' : iconLeft ? 'pl-1' : 'pl-4',
					suffix || $slots.suffix ? 'pr-3' : type === 'password' || iconRight ? 'pr-1' : 'pr-4',
				]"
			/>

			<!-- Sufixo (Static Text ou Slot) -->
			<span
				v-if="suffix || $slots.suffix"
				class="text-muted-foreground bg-muted border-border flex h-full shrink-0 items-center border-l px-3 text-sm select-none"
			>
				<slot name="suffix">{{ suffix }}</slot>
			</span>

			<!-- Toggle olho (type=password) — substitui iconRight -->
			<Icon
				v-if="type === 'password'"
				:name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
				class="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 mr-3 shrink-0 cursor-pointer rounded transition-colors outline-none focus-visible:ring-2"
				:aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
				role="button"
				tabindex="0"
				:aria-pressed="showPassword"
				@click="showPassword = !showPassword"
				@keydown.enter.prevent="showPassword = !showPassword"
				@keydown.space.prevent="showPassword = !showPassword"
			/>

			<!-- Ícone direito (ignorado em type=password) -->
			<Icon
				v-else-if="iconRight"
				:name="iconRight"
				class="text-muted-foreground mr-3 size-4 shrink-0"
				aria-hidden="true"
			/>
		</div>

		<!-- Linha inferior: erro/hint à esquerda + esqueci a senha à direita -->
		<!-- Sempre renderizada quando há forgotHref, para erro e link ficarem na mesma linha -->
		<div
			v-if="hint || errorMessage || (type === 'password' && (forgotHref || $attrs.onForgot))"
			class="flex items-center justify-between gap-2"
		>
			<!-- errorMessage tem prioridade sobre hint -->
			<p
				:id="`${effectiveId}-hint`"
				:class="['text-xs', error || errorMessage ? 'text-error' : 'text-muted-foreground']"
			>
				{{ errorMessage || hint || "" }}
			</p>

			<component
				:is="forgotHref ? 'a' : 'button'"
				v-if="type === 'password' && (forgotHref || $attrs.onForgot)"
				:href="forgotHref"
				:type="forgotHref ? undefined : 'button'"
				class="text-muted-foreground hover:text-foreground shrink-0 text-xs transition-colors"
			>
				{{ forgotLabel }}
			</component>
		</div>
	</div>
</template>
