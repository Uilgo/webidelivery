<script setup lang="ts">
/**
 * UiForm — Formulário com validação integrada do design system WebiDelivery
 *
 * Wrapper de <form> que valida o state contra um schema Zod (ou Standard Schema).
 * Distribui erros automaticamente para os UiFormField filhos via provide/inject.
 *
 * Props:
 *   - state:                  objeto reativo com os dados do formulário (obrigatório)
 *   - schema:                 schema de validação (Zod, Valibot, etc.) — opcional
 *   - validate:               função de validação customizada — opcional
 *   - validateOn:             eventos que disparam validação (input | change | blur), padrão: ['input', 'change', 'blur']
 *   - disabled:               desabilita todos os campos do formulário (padrão: false)
 *   - validateOnInputDelay:   delay em ms antes de validar no evento input (padrão: 300)
 *
 * Emits:
 *   - submit:  disparado quando o formulário é válido — recebe { data } com os dados transformados
 *   - error:   disparado quando há erros de validação — recebe { errors } com a lista de erros
 *
 * Expose:
 *   - submit()      — dispara o submit programáticamente
 *   - validate()    — valida o formulário (ou um campo específico)
 *   - clear()       — limpa erros (todos ou por path)
 *   - getErrors()   — retorna erros (todos ou por path)
 *   - setErrors()   — define erros manualmente
 *   - errors        — ref reativa com a lista de erros
 *   - dirty         — true se ao menos um campo foi alterado
 *
 * Uso:
 *   <UiForm :state="form" :schema="zodSchema" @submit="onSubmit">
 *     <UiFormField name="email" label="E-mail">
 *       <UiInput v-model="form.email" />
 *     </UiFormField>
 *     <UiButton type="submit">Enviar</UiButton>
 *   </UiForm>
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Erro de validação de formulário */
export interface FormError {
	name: string;
	message: string;
}

/** Eventos que disparam validação em tempo real */
type ValidateOn = "input" | "change" | "blur";

/** Contexto fornecido aos FormField filhos via provide */
export interface FormContext {
	errors: Ref<FormError[]>;
	validateField: (name: string) => Promise<FormError[]>;
	validateOn: ComputedRef<ValidateOn[]>;
	inputDelay: ComputedRef<number>;
	disabled: ComputedRef<boolean>;
	markDirty: (name: string) => void;
	markTouched: (name: string) => void;
}

// ─── Interfaces de schema (sem any) ──────────────────────────────────────────

/** Issue retornado pelo Zod no safeParse */
interface ZodIssue {
	path: PropertyKey[];
	message: string;
}

/** Resultado de safeParse do Zod */
type ZodSafeParseResult =
	| { success: true; data: Record<string, unknown> }
	| { success: false; error: { issues: ZodIssue[] } };

/** Schema compatível com Zod */
interface ZodLikeSchema {
	safeParse(data: unknown): ZodSafeParseResult;
	parse(data: unknown): Record<string, unknown>;
}

/** Path item do Standard Schema v1 */
type StandardSchemaPathItem = { key: string } | string;

/** Issue retornado pelo Standard Schema v1 */
interface StandardSchemaIssue {
	path?: StandardSchemaPathItem[];
	message: string;
}

/** Resultado de validate do Standard Schema v1 */
interface StandardSchemaResult {
	issues?: StandardSchemaIssue[];
}

/** Schema compatível com Standard Schema v1 */
interface StandardLikeSchema {
	"~standard": {
		validate(data: unknown): StandardSchemaResult;
	};
}

/** Union dos schemas suportados */
type FormSchema = ZodLikeSchema | StandardLikeSchema;

// ─── Type Guards ──────────────────────────────────────────────────────────────

function isZodSchema(schema: FormSchema): schema is ZodLikeSchema {
	return "safeParse" in schema && typeof (schema as ZodLikeSchema).safeParse === "function";
}

function isStandardSchema(schema: FormSchema): schema is StandardLikeSchema {
	return "~standard" in schema;
}

// ─── Props ────────────────────────────────────────────────────────────────────

const props = withDefaults(
	defineProps<{
		state: Record<string, unknown>;
		schema?: FormSchema;
		validate?: (state: Record<string, unknown>) => FormError[] | Promise<FormError[]>;
		validateOn?: ValidateOn[];
		disabled?: boolean;
		validateOnInputDelay?: number;
	}>(),
	{
		validateOn: () => ["input", "change", "blur"],
		disabled: false,
		validateOnInputDelay: 300,
		schema: undefined,
		validate: undefined,
	},
);

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
	submit: [payload: { data: Record<string, unknown> }];
	error: [payload: { errors: FormError[] }];
}>();

// ─── Estado interno ───────────────────────────────────────────────────────────

/** Lista reativa de erros de validação */
const errors = ref<FormError[]>([]);

/** Campos que foram alterados pelo usuário */
const dirtyFields = ref(new Set<string>());

/** Campos com os quais o usuário interagiu (perdeu foco) */
const touchedFields = ref(new Set<string>());

/** True se ao menos um campo foi alterado */
const dirty = computed(() => dirtyFields.value.size > 0);

// ─── Validação ────────────────────────────────────────────────────────────────

async function validateForm(fieldName?: string): Promise<FormError[]> {
	let allErrors: FormError[] = [];

	if (props.schema) {
		if (isZodSchema(props.schema)) {
			const result = props.schema.safeParse(props.state);
			if (!result.success) {
				allErrors = result.error.issues.map((issue) => ({
					name: issue.path.filter((p): p is string | number => typeof p !== "symbol").join("."),
					message: issue.message,
				}));
			}
		} else if (isStandardSchema(props.schema)) {
			const result = props.schema["~standard"].validate(props.state);
			if (result.issues) {
				allErrors = result.issues.map((issue) => ({
					name: issue.path?.map((p) => (typeof p === "object" ? p.key : p)).join(".") ?? "",
					message: issue.message,
				}));
			}
		}
	}

	if (props.validate) {
		const customErrors = await props.validate(props.state);
		allErrors = [...allErrors, ...customErrors];
	}

	if (fieldName) {
		errors.value = [
			...errors.value.filter((e) => e.name !== fieldName),
			...allErrors.filter((e) => e.name === fieldName),
		];
	} else {
		errors.value = allErrors;
	}

	return errors.value;
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function onSubmit(e: Event) {
	e.preventDefault();

	const validationErrors = await validateForm();

	if (validationErrors.length > 0) {
		emit("error", { errors: validationErrors });
		return;
	}

	let data: Record<string, unknown> = props.state;
	if (props.schema && isZodSchema(props.schema)) {
		try {
			data = props.schema.parse(props.state);
		} catch {
			data = props.state;
		}
	}

	emit("submit", { data });
}

// ─── Métodos públicos ─────────────────────────────────────────────────────────

/** Limpa erros (todos, por path string ou por RegExp) */
function clear(path?: string | RegExp) {
	if (!path) {
		errors.value = [];
	} else if (typeof path === "string") {
		errors.value = errors.value.filter((e) => e.name !== path);
	} else {
		errors.value = errors.value.filter((e) => !path.test(e.name));
	}
}

/** Retorna erros (todos ou filtrados por path) */
function getErrors(path?: string) {
	if (!path) return errors.value;
	return errors.value.filter((e) => e.name === path);
}

/** Define erros manualmente (substituindo ou adicionando) */
function setErrors(newErrors: FormError[], path?: string) {
	if (path) {
		errors.value = [...errors.value.filter((e) => e.name !== path), ...newErrors];
	} else {
		errors.value = newErrors;
	}
}

// ─── Provide para FormField filhos ────────────────────────────────────────────

provide("ui-form-context", {
	errors,
	validateField: (name: string) => validateForm(name),
	validateOn: computed(() => props.validateOn),
	inputDelay: computed(() => props.validateOnInputDelay),
	disabled: computed(() => props.disabled),
	markDirty: (name: string) => dirtyFields.value.add(name),
	markTouched: (name: string) => touchedFields.value.add(name),
} satisfies FormContext);

// ─── Expose ───────────────────────────────────────────────────────────────────

defineExpose({
	submit: () => onSubmit(new Event("submit")),
	validate: validateForm,
	clear,
	getErrors,
	setErrors,
	errors,
	dirty,
	dirtyFields: readonly(dirtyFields),
	touchedFields: readonly(touchedFields),
});
</script>

<template>
	<form
		:class="['flex flex-col gap-5', disabled ? 'pointer-events-none opacity-60' : '']"
		novalidate
		@submit="onSubmit"
	>
		<slot></slot>
	</form>
</template>
