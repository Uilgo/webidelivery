<script setup lang="ts">
/**
 * UiDateRangePicker — Seletor de intervalo de datas WebiDelivery
 *
 * Adaptado do projeto antigo para usar as variáveis Tailwind e comportamentos
 * do novo design system, sem necessidade de composables externos ("useCalendar" etc),
 * mantendo o componente totalmente auto-contido.
 */
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

export interface DateRange {
	start: string | null;
	end: string | null;
}

interface Props {
	modelValue?: DateRange | null;
	placeholder?: string;
	disabled?: boolean;
	size?: "sm" | "md" | "lg";
	minDate?: string; // Formato YYYY-MM-DD
	maxDate?: string; // Formato YYYY-MM-DD
	/** Expandir para preencher a largura pai */
	fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	placeholder: "Selecione o período",
	size: "md",
	minDate: undefined,
	maxDate: undefined,
	fullWidth: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: DateRange | null];
}>();

// Estados
const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLDivElement | null>(null);

const tempStartDate = ref<Date | null>(null);
const tempEndDate = ref<Date | null>(null);

const activeCalendar = ref<"start" | "end" | null>(null);

const startCalMonth = ref(new Date().getMonth());
const startCalYear = ref(new Date().getFullYear());
const endCalMonth = ref(new Date().getMonth());
const endCalYear = ref(new Date().getFullYear());

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

const getBrasiliaNow = () => {
	const now = new Date();
	const brOffset = -3 * 60;
	const localOffset = now.getTimezoneOffset();
	return new Date(now.getTime() + (localOffset - brOffset) * 60000);
};

const formatarDataIso = (d: Date, hora: "inicio" | "fim") => {
	const ano = d.getFullYear();
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const dia = String(d.getDate()).padStart(2, "0");
	const time = hora === "inicio" ? "00:00:00.000" : "23:59:59.999";
	return `${ano}-${mes}-${dia}T${time}-03:00`;
};

const formatarDataExibicao = (d: Date): string => {
	const dia = String(d.getDate()).padStart(2, "0");
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const ano = d.getFullYear();
	return `${dia}/${mes}/${ano}`;
};

const parseDataISO = (iso: string): Date | null => {
	if (!iso) return null;
	const parts = iso.split("T")[0]?.split("-");
	if (!parts || parts.length < 3) return null;
	const [year, month, day] = parts.map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
};

const isMesmoDia = (a: Date, b: Date): boolean => {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
};

const isHoje = (d: Date): boolean => isMesmoDia(d, getBrasiliaNow());

const isDateInRange = (date: Date): boolean => {
	if (!tempStartDate.value || !tempEndDate.value) return false;
	const time = date.getTime();
	const startTime = new Date(
		tempStartDate.value.getFullYear(),
		tempStartDate.value.getMonth(),
		tempStartDate.value.getDate(),
	).getTime();
	const endTime = new Date(
		tempEndDate.value.getFullYear(),
		tempEndDate.value.getMonth(),
		tempEndDate.value.getDate(),
	).getTime();
	return time >= startTime && time <= endTime;
};

const isDataDesabilitada = (date: Date, context: "start" | "end"): boolean => {
	const time = date.getTime();
	if (props.minDate) {
		const minD = parseDataISO(props.minDate);
		if (minD && time < minD.getTime()) return true;
	}
	if (props.maxDate) {
		const maxD = parseDataISO(props.maxDate);
		if (maxD && time > maxD.getTime()) return true;
	}

	if (context === "end" && tempStartDate.value) {
		const startDay = new Date(
			tempStartDate.value.getFullYear(),
			tempStartDate.value.getMonth(),
			tempStartDate.value.getDate(),
		);
		return time < startDay.getTime();
	}
	if (context === "start" && tempEndDate.value) {
		const endDay = new Date(
			tempEndDate.value.getFullYear(),
			tempEndDate.value.getMonth(),
			tempEndDate.value.getDate(),
		);
		return time > endDay.getTime();
	}
	return false;
};

interface CalendarItem {
	data: Date;
	dia: number;
	mes: "anterior" | "atual" | "proximo";
	isHoje: boolean;
	isSelecionado: boolean;
	isDesabilitado: boolean;
	isInRange: boolean;
}

const gerarDiasCalendario = (
	month: number,
	year: number,
	selectedDate: Date | null,
	context: "start" | "end",
): CalendarItem[] => {
	const items: CalendarItem[] = [];
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
			isSelecionado: selectedDate ? isMesmoDia(data, selectedDate) : false,
			isDesabilitado: true,
			isInRange: isDateInRange(data),
		});
	}

	for (let dia = 1; dia <= totalDiasMes; dia++) {
		const data = new Date(year, month, dia);
		items.push({
			data,
			dia,
			mes: "atual",
			isHoje: isHoje(data),
			isSelecionado: selectedDate ? isMesmoDia(data, selectedDate) : false,
			isDesabilitado: isDataDesabilitada(data, context),
			isInRange: isDateInRange(data),
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
			isSelecionado: selectedDate ? isMesmoDia(data, selectedDate) : false,
			isDesabilitado: true,
			isInRange: isDateInRange(data),
		});
	}
	return items;
};

const startCalendarDays = computed(() =>
	gerarDiasCalendario(startCalMonth.value, startCalYear.value, tempStartDate.value, "start"),
);
const endCalendarDays = computed(() =>
	gerarDiasCalendario(endCalMonth.value, endCalYear.value, tempEndDate.value, "end"),
);

const startCalLabel = computed(() => `${mesesNomes[startCalMonth.value]} ${startCalYear.value}`);
const endCalLabel = computed(() => `${mesesNomes[endCalMonth.value]} ${endCalYear.value}`);

const startDateDisplay = computed(() =>
	tempStartDate.value ? formatarDataExibicao(tempStartDate.value) : "",
);
const endDateDisplay = computed(() =>
	tempEndDate.value ? formatarDataExibicao(tempEndDate.value) : "",
);
const isRangeComplete = computed(() => !!tempStartDate.value && !!tempEndDate.value);

const mesAnterior = (context: "start" | "end") => {
	if (context === "start") {
		if (startCalMonth.value === 0) {
			startCalMonth.value = 11;
			startCalYear.value--;
		} else {
			startCalMonth.value--;
		}
	} else {
		if (endCalMonth.value === 0) {
			endCalMonth.value = 11;
			endCalYear.value--;
		} else {
			endCalMonth.value--;
		}
	}
};

const proximoMes = (context: "start" | "end") => {
	if (context === "start") {
		if (startCalMonth.value === 11) {
			startCalMonth.value = 0;
			startCalYear.value++;
		} else {
			startCalMonth.value++;
		}
	} else {
		if (endCalMonth.value === 11) {
			endCalMonth.value = 0;
			endCalYear.value++;
		} else {
			endCalMonth.value++;
		}
	}
};

const selecionarDataStart = (item: CalendarItem) => {
	if (item.isDesabilitado || item.mes !== "atual") return;
	tempStartDate.value = item.data;
	if (tempEndDate.value && item.data.getTime() > tempEndDate.value.getTime()) {
		tempEndDate.value = null;
	}
	activeCalendar.value = null;
};

const selecionarDataEnd = (item: CalendarItem) => {
	if (item.isDesabilitado || item.mes !== "atual") return;
	tempEndDate.value = item.data;
	activeCalendar.value = null;
};

const toggleCalendar = (which: "start" | "end") => {
	if (activeCalendar.value === which) {
		activeCalendar.value = null;
	} else {
		activeCalendar.value = which;
	}
};

const toggle = () => {
	if (props.disabled) return;
	isOpen.value = !isOpen.value;
	if (!isOpen.value) {
		activeCalendar.value = null;
	}
};

const limpar = () => {
	tempStartDate.value = null;
	tempEndDate.value = null;
	activeCalendar.value = null;
	isOpen.value = false;
	emit("update:modelValue", null);
};

const aplicar = () => {
	if (!tempStartDate.value || !tempEndDate.value) return;
	emit("update:modelValue", {
		start: formatarDataIso(tempStartDate.value, "inicio"),
		end: formatarDataIso(tempEndDate.value, "fim"),
	});
	activeCalendar.value = null;
	isOpen.value = false;
};

const displayText = computed(() => {
	if (props.modelValue?.start && props.modelValue?.end) {
		const s = parseDataISO(props.modelValue.start);
		const e = parseDataISO(props.modelValue.end);
		if (s && e) {
			return `${formatarDataExibicao(s)} - ${formatarDataExibicao(e)}`;
		}
	} else if (props.modelValue?.start) {
		const s = parseDataISO(props.modelValue.start);
		if (s) {
			return `A partir de ${formatarDataExibicao(s)}`;
		}
	}
	return props.placeholder;
});

const hasValue = computed(() => !!props.modelValue?.start || !!props.modelValue?.end);

watch(
	() => props.modelValue,
	(val) => {
		if (val) {
			const start = parseDataISO(val.start || "");
			const end = parseDataISO(val.end || "");
			if (start) {
				tempStartDate.value = start;
				startCalMonth.value = start.getMonth();
				startCalYear.value = start.getFullYear();
			} else {
				tempStartDate.value = null;
			}
			if (end) {
				tempEndDate.value = end;
				endCalMonth.value = end.getMonth();
				endCalYear.value = end.getFullYear();
			} else {
				tempEndDate.value = null;
			}
		} else {
			tempStartDate.value = null;
			tempEndDate.value = null;
		}
	},
	{ immediate: true },
);

const handleClickOutside = (e: MouseEvent) => {
	const target = e.target as Node;
	if (isOpen.value) {
		if (!dropdownRef.value?.contains(target) && !triggerRef.value?.contains(target)) {
			isOpen.value = false;
			activeCalendar.value = null;
		}
	}
};

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));

const sizeMap: Record<string, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-3 text-sm",
	lg: "h-12 px-4 text-base",
};

const triggerClasses = computed(() => [
	"flex items-center gap-2 w-full rounded border bg-card text-foreground transition-colors cursor-pointer select-none whitespace-nowrap outline-none outline-0",
	sizeMap[props.size],
	props.disabled
		? "opacity-50 cursor-not-allowed"
		: "hover:border-neutral-400 dark:hover:border-neutral-500",
	isOpen.value ? "border-primary" : "border-border",
]);
</script>

<template>
	<div class="relative" :class="fullWidth ? 'w-full' : 'w-[320px]'">
		<!-- Trigger -->
		<div
			ref="triggerRef"
			:class="triggerClasses"
			tabindex="0"
			@click="toggle"
			@keydown.enter.prevent="toggle"
			@keydown.space.prevent="toggle"
		>
			<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
			<span
				:class="[
					'flex-1 truncate text-left',
					hasValue ? 'text-foreground' : 'text-muted-foreground',
				]"
			>
				{{ displayText }}
			</span>
			<Icon
				name="lucide:chevron-down"
				:class="[
					'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
					isOpen && 'rotate-180',
				]"
			/>
		</div>

		<!-- Dropdown Principal -->
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
				ref="dropdownRef"
				class="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-full rounded-lg border p-4 shadow-lg"
			>
				<div class="flex flex-col gap-4">
					<!-- Data Início -->
					<div class="flex flex-col gap-1.5">
						<span class="text-muted-foreground text-xs font-medium">Data Início</span>
						<div
							:class="[
								'bg-card text-foreground flex h-9 w-full cursor-pointer items-center gap-2 rounded border px-3 text-sm outline-0 transition-colors outline-none select-none',
								activeCalendar === 'start'
									? 'border-primary'
									: 'border-border hover:border-neutral-400 dark:hover:border-neutral-500',
							]"
							tabindex="0"
							aria-label="Selecionar data de início"
							@click="toggleCalendar('start')"
							@keydown.enter.prevent="toggleCalendar('start')"
							@keydown.space.prevent="toggleCalendar('start')"
						>
							<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
							<span v-if="startDateDisplay" class="text-foreground flex-1">{{
								startDateDisplay
							}}</span>
							<span v-else class="text-muted-foreground flex-1">Selecione</span>
						</div>

						<!-- Calendário Data Início -->
						<div
							v-if="activeCalendar === 'start'"
							class="border-border bg-card mt-1 rounded-lg border p-3 shadow-sm"
						>
							<div class="mb-3 flex items-center justify-between">
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 outline-0 transition-colors outline-none"
									@click="mesAnterior('start')"
								>
									<Icon name="lucide:chevron-left" class="size-4" />
								</button>
								<span class="text-foreground text-sm font-semibold">{{ startCalLabel }}</span>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 outline-0 transition-colors outline-none"
									@click="proximoMes('start')"
								>
									<Icon name="lucide:chevron-right" class="size-4" />
								</button>
							</div>
							<div class="mb-2 grid grid-cols-7 gap-1">
								<div
									v-for="dia in diasSemana"
									:key="dia"
									class="text-muted-foreground py-1 text-center text-[10px] font-medium"
								>
									{{ dia }}
								</div>
							</div>
							<div class="grid grid-cols-7 gap-1">
								<button
									v-for="(item, index) in startCalendarDays"
									:key="index"
									type="button"
									:disabled="item.isDesabilitado"
									:class="[
										'flex h-8 w-full items-center justify-center rounded text-xs outline-0 transition-colors outline-none',
										item.mes === 'atual' ? 'text-foreground' : 'text-muted-foreground opacity-40',
										item.isHoje && !item.isSelecionado
											? 'border-primary text-primary border font-medium'
											: '',
										item.isInRange && !item.isSelecionado ? 'bg-primary/10 text-primary' : '',
										item.isSelecionado
											? 'bg-primary text-primary-foreground font-medium'
											: 'hover:bg-muted',
										item.isDesabilitado ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
									]"
									@click.stop="selecionarDataStart(item)"
								>
									{{ item.dia }}
								</button>
							</div>
						</div>
					</div>

					<!-- Data Fim -->
					<div class="flex flex-col gap-1.5">
						<span class="text-muted-foreground text-xs font-medium">Data Fim</span>
						<div
							:class="[
								'bg-card text-foreground flex h-9 w-full cursor-pointer items-center gap-2 rounded border px-3 text-sm outline-0 transition-colors outline-none select-none',
								activeCalendar === 'end'
									? 'border-primary'
									: 'border-border hover:border-neutral-400 dark:hover:border-neutral-500',
							]"
							tabindex="0"
							aria-label="Selecionar data de fim"
							@click="toggleCalendar('end')"
							@keydown.enter.prevent="toggleCalendar('end')"
							@keydown.space.prevent="toggleCalendar('end')"
						>
							<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
							<span v-if="endDateDisplay" class="text-foreground flex-1">{{ endDateDisplay }}</span>
							<span v-else class="text-muted-foreground flex-1">Selecione</span>
						</div>

						<!-- Calendário Data Fim -->
						<div
							v-if="activeCalendar === 'end'"
							class="border-border bg-card mt-1 rounded-lg border p-3 shadow-sm"
						>
							<div class="mb-3 flex items-center justify-between">
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 outline-0 transition-colors outline-none"
									@click="mesAnterior('end')"
								>
									<Icon name="lucide:chevron-left" class="size-4" />
								</button>
								<span class="text-foreground text-sm font-semibold">{{ endCalLabel }}</span>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 outline-0 transition-colors outline-none"
									@click="proximoMes('end')"
								>
									<Icon name="lucide:chevron-right" class="size-4" />
								</button>
							</div>
							<div class="mb-2 grid grid-cols-7 gap-1">
								<div
									v-for="dia in diasSemana"
									:key="dia"
									class="text-muted-foreground py-1 text-center text-[10px] font-medium"
								>
									{{ dia }}
								</div>
							</div>
							<div class="grid grid-cols-7 gap-1">
								<button
									v-for="(item, index) in endCalendarDays"
									:key="index"
									type="button"
									:disabled="item.isDesabilitado"
									:class="[
										'flex h-8 w-full items-center justify-center rounded text-xs outline-0 transition-colors outline-none',
										item.mes === 'atual' ? 'text-foreground' : 'text-muted-foreground opacity-40',
										item.isHoje && !item.isSelecionado
											? 'border-primary text-primary border font-medium'
											: '',
										item.isInRange && !item.isSelecionado ? 'bg-primary/10 text-primary' : '',
										item.isSelecionado
											? 'bg-primary text-primary-foreground font-medium'
											: 'hover:bg-muted',
										item.isDesabilitado ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
									]"
									@click.stop="selecionarDataEnd(item)"
								>
									{{ item.dia }}
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Ações -->
				<div class="border-border mt-4 flex items-center justify-end gap-2 border-t pt-3">
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground px-3 py-1.5 text-xs font-medium outline-0 transition-colors outline-none"
						@click="limpar"
					>
						Limpar
					</button>
					<button
						type="button"
						:disabled="!isRangeComplete"
						:class="[
							'rounded px-4 py-1.5 text-xs font-medium outline-0 transition-colors outline-none',
							isRangeComplete
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'bg-muted text-muted-foreground cursor-not-allowed',
						]"
						@click="aplicar"
					>
						Aplicar
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
/* Remove TODOS os focus rings deste componente */
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
