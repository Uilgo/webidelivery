<script setup lang="ts">
/**
 * UiDatePicker — Seletor de data WebiDelivery
 *
 * Totalmente adaptado para usar o novo design system (variáveis Tailwind)
 * e sem dependências externas (composables).
 */
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";

interface Props {
	/** Valor do datepicker (v-model) - formato ISO (YYYY-MM-DD) */
	modelValue?: string;
	/** Placeholder do input */
	placeholder?: string;
	/** Tamanho do input */
	size?: "sm" | "md" | "lg" | "xl";
	/** Estado desabilitado */
	disabled?: boolean;
	/** Campo obrigatório */
	required?: boolean;
	/** ID customizado */
	id?: string;
	/** Nome do campo para form submission */
	name?: string;
	/** Estado de erro */
	invalid?: boolean;
	/** Data mínima permitida (formato YYYY-MM-DD) */
	minDate?: string;
	/** Data máxima permitida (formato YYYY-MM-DD) */
	maxDate?: string;
	/** Expandir dropdown para a mesma largura do trigger */
	fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "",
	placeholder: "Selecione uma data",
	size: "md",
	disabled: false,
	required: false,
	id: undefined,
	name: undefined,
	invalid: false,
	minDate: undefined,
	maxDate: undefined,
	fullWidth: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

// Injeta id do FormField se disponível (simulação, caso não tenha ID próprio)
const fieldId = inject<string>("formfield-id", "");
const uid = useId();
const computedId = computed(() => props.id || fieldId || `datepicker-${uid}`);

// Estados
const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const calendarRef = ref<HTMLDivElement | null>(null);

const selectedDate = ref<Date | null>(null);
const calMonth = ref(new Date().getMonth());
const calYear = ref(new Date().getFullYear());

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const mesesNomes = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

// Helpers
const getBrasiliaNow = () => {
	const now = new Date();
	const brOffset = -3 * 60;
	const localOffset = now.getTimezoneOffset();
	return new Date(now.getTime() + (localOffset - brOffset) * 60000);
};

const isMesmoDia = (a: Date, b: Date): boolean => {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
};

const isHoje = (d: Date): boolean => isMesmoDia(d, getBrasiliaNow());

const parseDataISO = (iso: string): Date | null => {
	if (!iso) return null;
	const parts = iso.split("T")[0]?.split("-");
	if (!parts || parts.length < 3) return null;
	const [year, month, day] = parts.map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
};

const formatarDataISO = (d: Date): string => {
	const ano = d.getFullYear();
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const dia = String(d.getDate()).padStart(2, "0");
	return `${ano}-${mes}-${dia}`;
};

const formatarDataExibicao = (d: Date): string => {
	const dia = String(d.getDate()).padStart(2, "0");
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const ano = d.getFullYear();
	return `${dia}/${mes}/${ano}`;
};

// Validação
const isDataDesabilitada = (date: Date): boolean => {
	const time = date.getTime();
	if (props.minDate) {
		const minD = parseDataISO(props.minDate);
		if (minD && time < minD.getTime()) return true;
	}
	if (props.maxDate) {
		const maxD = parseDataISO(props.maxDate);
		if (maxD && time > maxD.getTime()) return true;
	}
	return false;
};

// Calendário
interface CalendarItem {
	data: Date;
	dia: number;
	mes: "anterior" | "atual" | "proximo";
	isHoje: boolean;
	isSelecionado: boolean;
	isDesabilitado: boolean;
}

const calendarDays = computed(() => {
	const items: CalendarItem[] = [];
	const month = calMonth.value;
	const year = calYear.value;

	const primeiroDia = new Date(year, month, 1);
	const diaSemanaInicio = primeiroDia.getDay();
	const ultimoDia = new Date(year, month + 1, 0);
	const totalDiasMes = ultimoDia.getDate();
	const diasMesAnterior = new Date(year, month, 0).getDate();

	for (let i = diaSemanaInicio - 1; i >= 0; i--) {
		const dia = diasMesAnterior - i;
		const data = new Date(year, month - 1, dia);
		items.push({
			data,
			dia,
			mes: "anterior",
			isHoje: isHoje(data),
			isSelecionado: selectedDate.value ? isMesmoDia(data, selectedDate.value) : false,
			isDesabilitado: true,
		});
	}

	for (let dia = 1; dia <= totalDiasMes; dia++) {
		const data = new Date(year, month, dia);
		items.push({
			data,
			dia,
			mes: "atual",
			isHoje: isHoje(data),
			isSelecionado: selectedDate.value ? isMesmoDia(data, selectedDate.value) : false,
			isDesabilitado: isDataDesabilitada(data),
		});
	}

	const totalCelulas = 42;
	const restante = totalCelulas - items.length;
	for (let i = 1; i <= restante; i++) {
		const data = new Date(year, month + 1, i);
		items.push({
			data,
			dia: i,
			mes: "proximo",
			isHoje: isHoje(data),
			isSelecionado: selectedDate.value ? isMesmoDia(data, selectedDate.value) : false,
			isDesabilitado: true,
		});
	}
	return items;
});

const calLabel = computed(() => `${mesesNomes[calMonth.value]} ${calYear.value}`);

const valorExibicao = computed(() => {
	if (!props.modelValue) return "";
	const date = parseDataISO(props.modelValue);
	return date ? formatarDataExibicao(date) : "";
});

// Ações
const mesAnterior = () => {
	if (calMonth.value === 0) {
		calMonth.value = 11;
		calYear.value--;
	} else {
		calMonth.value--;
	}
};

const proximoMes = () => {
	if (calMonth.value === 11) {
		calMonth.value = 0;
		calYear.value++;
	} else {
		calMonth.value++;
	}
};

const irParaHoje = () => {
	const hoje = getBrasiliaNow();
	calMonth.value = hoje.getMonth();
	calYear.value = hoje.getFullYear();
	selecionarData({
		data: hoje,
		mes: "atual",
		isDesabilitado: isDataDesabilitada(hoje),
	} as CalendarItem);
};

const limpar = () => {
	selectedDate.value = null;
	emit("update:modelValue", "");
	isOpen.value = false;
};

const selecionarData = (item: CalendarItem) => {
	if (item.isDesabilitado || item.mes !== "atual") return;
	selectedDate.value = item.data;
	emit("update:modelValue", formatarDataISO(item.data));
	isOpen.value = false;
};

const toggle = () => {
	if (props.disabled) return;
	isOpen.value = !isOpen.value;
};

const handleClickOutside = (e: MouseEvent) => {
	const target = e.target as Node;
	if (isOpen.value && !calendarRef.value?.contains(target) && !triggerRef.value?.contains(target)) {
		isOpen.value = false;
	}
};

watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue) {
			const date = parseDataISO(newValue);
			if (date) {
				selectedDate.value = date;
				calMonth.value = date.getMonth();
				calYear.value = date.getFullYear();
			}
		} else {
			selectedDate.value = null;
		}
	},
	{ immediate: true },
);

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));

// Tema e Classes
const sizeMap: Record<string, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-3 text-sm",
	lg: "h-12 px-4 text-base",
	xl: "h-14 px-4 text-lg",
};

const triggerClasses = computed(() => {
	const base = [
		"flex items-center gap-2 w-full rounded border bg-card text-foreground transition-all cursor-pointer select-none whitespace-nowrap outline-none outline-0",
		sizeMap[props.size] || sizeMap.md,
	];

	if (props.invalid) {
		base.push("border-destructive ring-1 ring-destructive/50");
	} else if (isOpen.value) {
		base.push("border-primary ring-1 ring-primary/20");
	} else {
		base.push("border-border");
	}

	if (props.disabled) {
		base.push("opacity-50 cursor-not-allowed");
	} else if (!props.invalid && !isOpen.value) {
		base.push("hover:border-neutral-400 dark:hover:border-neutral-500");
	}

	return base.join(" ");
});
</script>

<template>
	<div class="relative" :class="fullWidth ? 'w-full' : 'w-[280px]'">
		<!-- Trigger -->
		<div
			:id="computedId"
			ref="triggerRef"
			:class="triggerClasses"
			tabindex="0"
			@click="toggle"
			@keydown.enter.prevent="toggle"
			@keydown.space.prevent="toggle"
		>
			<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
			<span v-if="valorExibicao" class="text-foreground flex-1 truncate text-left">{{
				valorExibicao
			}}</span>
			<span v-else class="text-muted-foreground flex-1 truncate text-left">{{ placeholder }}</span>

			<Icon
				name="lucide:chevron-down"
				:class="[
					'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
					isOpen && 'rotate-180',
				]"
			/>

			<!-- Hidden input for pure HTML forms compatibility -->
			<input type="hidden" :name="name" :value="modelValue" :required="required" />
		</div>

		<!-- Dropdown -->
		<Transition
			enter-active-class="transition-all duration-200 ease-out"
			enter-from-class="opacity-0 scale-95 -translate-y-1"
			enter-to-class="opacity-100 scale-100 translate-y-0"
			leave-active-class="transition-all duration-150 ease-in"
			leave-from-class="opacity-100 scale-100 translate-y-0"
			leave-to-class="opacity-0 scale-95 -translate-y-1"
		>
			<div
				v-if="isOpen"
				ref="calendarRef"
				class="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-full rounded-lg border p-3 shadow-lg"
			>
				<!-- Config e Nav do calendário -->
				<div class="mb-3 flex items-center justify-between">
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 outline-0 transition-colors outline-none"
						@click="mesAnterior"
					>
						<Icon name="lucide:chevron-left" class="size-4" />
					</button>
					<span class="text-foreground text-sm font-semibold">{{ calLabel }}</span>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 outline-0 transition-colors outline-none"
						@click="proximoMes"
					>
						<Icon name="lucide:chevron-right" class="size-4" />
					</button>
				</div>

				<!-- Header dias semana -->
				<div class="mb-2 grid grid-cols-7 gap-1">
					<div
						v-for="dia in diasSemana"
						:key="dia"
						class="text-muted-foreground py-1 text-center text-[10px] font-medium"
					>
						{{ dia }}
					</div>
				</div>

				<!-- Grid dias -->
				<div class="grid grid-cols-7 gap-1">
					<button
						v-for="(item, index) in calendarDays"
						:key="index"
						type="button"
						:disabled="item.isDesabilitado"
						:class="[
							'flex h-8 w-full items-center justify-center rounded text-xs outline-0 transition-colors outline-none',
							item.mes === 'atual' ? 'text-foreground' : 'text-muted-foreground opacity-40',
							item.isHoje && !item.isSelecionado
								? 'border-primary text-primary border font-medium'
								: '',
							item.isSelecionado
								? 'bg-primary text-primary-foreground font-medium'
								: 'hover:bg-muted',
							item.isDesabilitado ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
						]"
						@click.stop="selecionarData(item)"
					>
						{{ item.dia }}
					</button>
				</div>

				<!-- Footer -->
				<div class="border-border mt-3 flex items-center justify-between border-t pt-2">
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground text-xs font-medium outline-0 transition-colors outline-none"
						@click="limpar"
					>
						Limpar
					</button>
					<button
						type="button"
						class="text-primary hover:text-primary/80 text-xs font-medium outline-0 transition-colors outline-none"
						@click="irParaHoje"
					>
						Hoje
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
div[tabindex],
button {
	outline: none !important;
	box-shadow: none !important;
	-webkit-tap-highlight-color: transparent !important;
}

div[tabindex]:focus,
div[tabindex]:focus-visible,
div[tabindex]:focus-within,
button:focus,
button:focus-visible {
	outline: none !important;
	box-shadow: none !important;
}
</style>
