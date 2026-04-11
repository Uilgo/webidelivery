<script setup lang="ts">
/**
 * UiPeriodoSelector — Seletor de períodos WebiDelivery
 *
 * Componente 100% independente (sem dependência de UiSelect ou composables externos).
 * Inclui select customizado de presets e calendários personalizados inline.
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

export type PeriodoPreset =
	| "hoje"
	| "ontem"
	| "ultimos_7_dias"
	| "ultimos_15_dias"
	| "ultimos_30_dias"
	| "este_mes"
	| "mes_passado"
	| "ultimos_3_meses"
	| "ultimos_6_meses"
	| "este_ano"
	| "ano_passado"
	| "personalizado";

export interface PeriodoValue {
	preset: PeriodoPreset;
	data_inicio: string; // Formato ISO com timezone de GMT-3 (ex: 2024-05-10T00:00:00.000-03:00)
	data_fim: string; // Formato ISO com timezone de GMT-3 (ex: 2024-05-10T23:59:59.999-03:00)
}

interface Props {
	modelValue?: PeriodoValue | null;
	disabled?: boolean;
	size?: "sm" | "md" | "lg";
	showInfo?: boolean; // Exibirá o calendário com datas traduzidas e quantidade de dias à direita
	/** Expandir para preencher a largura do componente pai */
	fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	disabled: false,
	size: "md",
	showInfo: false,
	fullWidth: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: PeriodoValue | null];
}>();

// ─── Opções de preset ─────────────────────────────────────────────────────────
const presetOptions = [
	{ label: "Hoje", value: "hoje" },
	{ label: "Ontem", value: "ontem" },
	{ label: "Últimos 7 dias", value: "ultimos_7_dias" },
	{ label: "Últimos 15 dias", value: "ultimos_15_dias" },
	{ label: "Últimos 30 dias", value: "ultimos_30_dias" },
	{ label: "Este mês", value: "este_mes" },
	{ label: "Mês passado", value: "mes_passado" },
	{ label: "Últimos 3 meses", value: "ultimos_3_meses" },
	{ label: "Últimos 6 meses", value: "ultimos_6_meses" },
	{ label: "Este ano", value: "este_ano" },
	{ label: "Ano passado", value: "ano_passado" },
	{ label: "Personalizado", value: "personalizado" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SELECT DE PRESETS (built-in, sem UiSelect) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const presetOpen = ref(false);
const presetContainerRef = ref<HTMLElement | null>(null);
const presetTriggerRef = ref<HTMLElement | null>(null);
const presetPlacement = ref<"top" | "bottom">("bottom");

/** Calcula se o dropdown de presets deve abrir para cima ou para baixo */
const calcPresetPlacement = () => {
	if (!presetTriggerRef.value) return;
	const rect = presetTriggerRef.value.getBoundingClientRect();
	const spaceBelow = window.innerHeight - rect.bottom;
	presetPlacement.value = spaceBelow < 300 ? "top" : "bottom";
};

/** Toggle do dropdown de presets */
const togglePreset = () => {
	if (props.disabled) return;
	presetOpen.value = !presetOpen.value;
	if (presetOpen.value) {
		nextTick(() => calcPresetPlacement());
	}
};

/** Opção selecionada atualmente no select de presets */
const selectedPresetOption = computed(() =>
	presetOptions.find((o) => o.value === presetSelecionado.value),
);

/** Seleciona uma opção de preset e fecha o dropdown */
const selectPresetOption = (optionValue: string) => {
	presetSelecionado.value = optionValue as PeriodoPreset;
	presetOpen.value = false;
};

/** Navegação por teclado no select de presets */
const handlePresetKeydown = (e: KeyboardEvent) => {
	if (!presetOpen.value) {
		if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			presetOpen.value = true;
			nextTick(() => calcPresetPlacement());
		}
		return;
	}

	const currentIndex = presetOptions.findIndex((o) => o.value === presetSelecionado.value);

	if (e.key === "ArrowDown") {
		e.preventDefault();
		const nextIndex = (currentIndex + 1) % presetOptions.length;
		const target = presetOptions[nextIndex];
		if (target) presetSelecionado.value = target.value as PeriodoPreset;
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		const prevIndex = (currentIndex - 1 + presetOptions.length) % presetOptions.length;
		const target = presetOptions[prevIndex];
		if (target) presetSelecionado.value = target.value as PeriodoPreset;
	} else if (e.key === "Enter" || e.key === "Escape") {
		e.preventDefault();
		presetOpen.value = false;
	}
};

/** Classes do trigger de presets (idêntico ao Select.vue) */
const presetTriggerClasses = computed(() => [
	"flex items-center w-full rounded border bg-card text-foreground gap-2 transition-colors cursor-pointer select-none whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/20",
	sizeMap[props.size],
	props.disabled
		? "opacity-50 cursor-not-allowed"
		: "hover:border-neutral-400 dark:hover:border-neutral-500",
	presetOpen.value ? "border-primary" : "border-border",
]);

// ─── Estados do modo personalizado ────────────────────────────────────────────
const isCustomOpen = ref(false);
const customTriggerRef = ref<HTMLElement>();
const customDropdownRef = ref<HTMLDivElement>();

// Datas temporárias selecionadas no dropdown personalizado
const tempStartDate = ref<Date | null>(null);
const tempEndDate = ref<Date | null>(null);

// Calendário ativo: "start" | "end" | null
const activeCalendar = ref<"start" | "end" | null>(null);

// Mês/ano atual de cada calendário para navegação
const startCalMonth = ref(new Date().getMonth());
const startCalYear = ref(new Date().getFullYear());
const endCalMonth = ref(new Date().getMonth());
const endCalYear = ref(new Date().getFullYear());

// ─── Constantes de calendário PT-BR ──────────────────────────────────────────
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

// ─── Helpers de data ──────────────────────────────────────────────────────────

/** Obtém data AGORA alinhada à timezone de Brasília (GMT-03) */
const getBrasiliaNow = () => {
	const now = new Date();
	const brOffset = -3 * 60;
	const localOffset = now.getTimezoneOffset();
	return new Date(now.getTime() + (localOffset - brOffset) * 60000);
};

/** Formata Date → string ISO com timezone de Brasília */
const formatarDataIso = (d: Date, hora: "inicio" | "fim") => {
	const ano = d.getFullYear();
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const dia = String(d.getDate()).padStart(2, "0");
	const time = hora === "inicio" ? "00:00:00.000" : "23:59:59.999";
	return `${ano}-${mes}-${dia}T${time}-03:00`;
};

/** Formata Date → "DD/MM/AAAA" para exibição */
const formatarDataExibicao = (d: Date): string => {
	const dia = String(d.getDate()).padStart(2, "0");
	const mes = String(d.getMonth() + 1).padStart(2, "0");
	const ano = d.getFullYear();
	return `${dia}/${mes}/${ano}`;
};

/** Parseia ISO string → Date (apenas a parte YYYY-MM-DD) */
const parseDataISO = (iso: string): Date | null => {
	if (!iso) return null;
	const parts = iso.split("T")[0]?.split("-");
	if (!parts || parts.length < 3) return null;
	const [year, month, day] = parts.map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
};

/** Verifica se duas Dates são o mesmo dia */
const isMesmoDia = (a: Date, b: Date): boolean => {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
};

/** Verifica se a data é hoje */
const isHoje = (d: Date): boolean => {
	return isMesmoDia(d, getBrasiliaNow());
};

// ─── Dados do calendário (geração da grade de dias) ─────────────────────────

interface CalendarItem {
	data: Date;
	dia: number;
	mes: "anterior" | "atual" | "proximo";
	isHoje: boolean;
	isSelecionado: boolean;
	isDesabilitado: boolean;
	isInRange: boolean;
}

/**
 * Gera a grade de dias para um mês/ano específico
 * @param month - Mês (0-11)
 * @param year - Ano
 * @param selectedDate - Data selecionada nesse calendário
 * @param context - "start" ou "end" para validar desabilitação
 */
const gerarDiasCalendario = (
	month: number,
	year: number,
	selectedDate: Date | null,
	context: "start" | "end",
): CalendarItem[] => {
	const items: CalendarItem[] = [];

	// Primeiro dia do mês
	const primeiroDia = new Date(year, month, 1);
	const diaSemanaInicio = primeiroDia.getDay(); // 0=Dom, 6=Sáb

	// Último dia do mês
	const ultimoDia = new Date(year, month + 1, 0);
	const totalDiasMes = ultimoDia.getDate();

	// Dias do mês anterior para preencher a primeira semana
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

	// Dias do mês atual
	for (let dia = 1; dia <= totalDiasMes; dia++) {
		const data = new Date(year, month, dia);
		const desabilitado = isDataDesabilitada(data, context);
		items.push({
			data,
			dia,
			mes: "atual",
			isHoje: isHoje(data),
			isSelecionado: selectedDate ? isMesmoDia(data, selectedDate) : false,
			isDesabilitado: desabilitado,
			isInRange: isDateInRange(data),
		});
	}

	// Dias do próximo mês para completar a grade (6 semanas = 42 células)
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

/**
 * Verifica se a data está entre startDate e endDate (para highlight do range)
 */
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

/**
 * Valida se uma data deve estar desabilitada
 * - No calendário de "end": não permite selecionar antes da data de início
 * - No calendário de "start": não permite selecionar depois da data de fim
 */
const isDataDesabilitada = (date: Date, context: "start" | "end"): boolean => {
	if (context === "end" && tempStartDate.value) {
		const startDay = new Date(
			tempStartDate.value.getFullYear(),
			tempStartDate.value.getMonth(),
			tempStartDate.value.getDate(),
		);
		return date.getTime() < startDay.getTime();
	}
	if (context === "start" && tempEndDate.value) {
		const endDay = new Date(
			tempEndDate.value.getFullYear(),
			tempEndDate.value.getMonth(),
			tempEndDate.value.getDate(),
		);
		return date.getTime() > endDay.getTime();
	}
	return false;
};

// ─── Computed: grades de calendário ─────────────────────────────────────────

const startCalendarDays = computed(() =>
	gerarDiasCalendario(startCalMonth.value, startCalYear.value, tempStartDate.value, "start"),
);

const endCalendarDays = computed(() =>
	gerarDiasCalendario(endCalMonth.value, endCalYear.value, tempEndDate.value, "end"),
);

/** Label do mês/ano exibido no header de cada calendário */
const startCalLabel = computed(() => `${mesesNomes[startCalMonth.value]} ${startCalYear.value}`);
const endCalLabel = computed(() => `${mesesNomes[endCalMonth.value]} ${endCalYear.value}`);

/** Texto exibido nos campos do dropdown personalizado */
const startDateDisplay = computed(() =>
	tempStartDate.value ? formatarDataExibicao(tempStartDate.value) : "",
);
const endDateDisplay = computed(() =>
	tempEndDate.value ? formatarDataExibicao(tempEndDate.value) : "",
);

/** Ambas as datas preenchidas = pode aplicar */
const isRangeComplete = computed(() => !!tempStartDate.value && !!tempEndDate.value);

// ─── Navegação dos calendários ──────────────────────────────────────────────

const startCalMesAnterior = () => {
	if (startCalMonth.value === 0) {
		startCalMonth.value = 11;
		startCalYear.value--;
	} else {
		startCalMonth.value--;
	}
};

const startCalProximoMes = () => {
	if (startCalMonth.value === 11) {
		startCalMonth.value = 0;
		startCalYear.value++;
	} else {
		startCalMonth.value++;
	}
};

const endCalMesAnterior = () => {
	if (endCalMonth.value === 0) {
		endCalMonth.value = 11;
		endCalYear.value--;
	} else {
		endCalMonth.value--;
	}
};

const endCalProximoMes = () => {
	if (endCalMonth.value === 11) {
		endCalMonth.value = 0;
		endCalYear.value++;
	} else {
		endCalMonth.value++;
	}
};

// ─── Seleção de datas no calendário ─────────────────────────────────────────

const selecionarDataStart = (item: CalendarItem) => {
	if (item.isDesabilitado || item.mes !== "atual") return;
	tempStartDate.value = item.data;

	// Se a data de início ficou depois da data fim, limpar a data fim
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

// ─── Toggle dos calendários ─────────────────────────────────────────────────

const toggleCalendar = (which: "start" | "end") => {
	if (activeCalendar.value === which) {
		activeCalendar.value = null;
	} else {
		activeCalendar.value = which;
	}
};

// ─── Ações do dropdown personalizado ────────────────────────────────────────

/** Limpar seleção e fechar */
const limparCustom = () => {
	tempStartDate.value = null;
	tempEndDate.value = null;
	activeCalendar.value = null;
	isCustomOpen.value = false;
	emit("update:modelValue", null);
};

/** Aplicar seleção e fechar */
const aplicarCustom = () => {
	if (!tempStartDate.value || !tempEndDate.value) return;

	emit("update:modelValue", {
		preset: "personalizado",
		data_inicio: formatarDataIso(tempStartDate.value, "inicio"),
		data_fim: formatarDataIso(tempEndDate.value, "fim"),
	});

	activeCalendar.value = null;
	isCustomOpen.value = false;
};

/** Toggle do dropdown personalizado */
const toggleCustomDropdown = () => {
	if (props.disabled) return;
	isCustomOpen.value = !isCustomOpen.value;

	if (!isCustomOpen.value) {
		activeCalendar.value = null;
	}
};

// ─── Texto exibido no trigger do picker personalizado ───────────────────────

const customTriggerText = computed(() => {
	if (tempStartDate.value && tempEndDate.value) {
		return `${formatarDataExibicao(tempStartDate.value)} - ${formatarDataExibicao(tempEndDate.value)}`;
	}
	if (tempStartDate.value) {
		return `${formatarDataExibicao(tempStartDate.value)} - Selecione`;
	}
	return "Selecione o período";
});

const hasCustomValue = computed(() => !!tempStartDate.value || !!tempEndDate.value);

// ─── Lógica de presets (mesma do original) ──────────────────────────────────

const criarPeriodo = (preset: PeriodoPreset): PeriodoValue => {
	if (preset === "personalizado") {
		return { preset: "personalizado", data_inicio: "", data_fim: "" };
	}

	const hoje = getBrasiliaNow();
	let inicio = new Date(hoje);
	let fim = new Date(hoje);

	switch (preset) {
		case "hoje":
			break;
		case "ontem":
			inicio.setDate(hoje.getDate() - 1);
			fim = new Date(inicio);
			break;
		case "ultimos_7_dias":
			inicio.setDate(hoje.getDate() - 6);
			break;
		case "ultimos_15_dias":
			inicio.setDate(hoje.getDate() - 14);
			break;
		case "ultimos_30_dias":
			inicio.setDate(hoje.getDate() - 29);
			break;
		case "este_mes":
			inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
			break;
		case "mes_passado":
			inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
			fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
			break;
		case "ultimos_3_meses":
			inicio.setMonth(hoje.getMonth() - 3);
			break;
		case "ultimos_6_meses":
			inicio.setMonth(hoje.getMonth() - 6);
			break;
		case "este_ano":
			inicio = new Date(hoje.getFullYear(), 0, 1);
			break;
		case "ano_passado":
			inicio = new Date(hoje.getFullYear() - 1, 0, 1);
			fim = new Date(hoje.getFullYear() - 1, 11, 31);
			break;
	}

	return {
		preset,
		data_inicio: formatarDataIso(inicio, "inicio"),
		data_fim: formatarDataIso(fim, "fim"),
	};
};

const presetSelecionado = computed({
	get: () => props.modelValue?.preset || "",
	set: (presetVal) => {
		if (!presetVal) {
			emit("update:modelValue", null);
			return;
		}

		const preset = presetVal as PeriodoPreset;
		if (preset === "personalizado") {
			// Ao selecionar "Personalizado", abre o dropdown de calendário
			tempStartDate.value = null;
			tempEndDate.value = null;
			activeCalendar.value = null;
			emit("update:modelValue", {
				preset: "personalizado",
				data_inicio: "",
				data_fim: "",
			});

			// Abre o dropdown personalizado automaticamente
			nextTick(() => {
				isCustomOpen.value = true;
			});
			return;
		}

		// Fechar o dropdown personalizado ao trocar para outro preset
		isCustomOpen.value = false;
		activeCalendar.value = null;
		emit("update:modelValue", criarPeriodo(preset));
	},
});

// ─── Computed do resumo de info (mesmo do original) ─────────────────────────

const isPeriodoValido = computed(() => {
	return !!(props.modelValue?.data_inicio && props.modelValue?.data_fim);
});

const periodoFormatado = computed(() => {
	if (!isPeriodoValido.value || !props.modelValue) return "";

	const formatarData = (iso: string) => {
		const parts = iso.split("T")[0]?.split("-");
		if (!parts || parts.length < 3) return "";
		return `${parts[2]}/${parts[1]}/${parts[0]}`;
	};

	const inicioStr = formatarData(props.modelValue.data_inicio);
	const fimStr = formatarData(props.modelValue.data_fim);

	if (inicioStr === fimStr) return inicioStr;
	return `${inicioStr} até ${fimStr}`;
});

const diasNoPeriodo = computed(() => {
	if (!isPeriodoValido.value || !props.modelValue) return 0;

	const getLocalTime = (iso: string) => {
		const [year, month, day] = iso.split("T")[0]!.split("-").map(Number);
		if (!year || !month || !day) return 0;
		return new Date(year, month - 1, day).getTime();
	};

	const diff = getLocalTime(props.modelValue.data_fim) - getLocalTime(props.modelValue.data_inicio);

	return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
});

// ─── Sincronizar dados quando modelValue muda externamente ─────────────────

watch(
	() => props.modelValue,
	(val) => {
		if (val && val.preset === "personalizado") {
			const start = parseDataISO(val.data_inicio);
			const end = parseDataISO(val.data_fim);

			if (start) {
				tempStartDate.value = start;
				startCalMonth.value = start.getMonth();
				startCalYear.value = start.getFullYear();
			}
			if (end) {
				tempEndDate.value = end;
				endCalMonth.value = end.getMonth();
				endCalYear.value = end.getFullYear();
			}
		}
	},
	{ immediate: true },
);

// ─── Fechar ao clicar fora (unificado para presets + custom) ────────────────

const handleClickOutside = (e: MouseEvent) => {
	const target = e.target as Node;

	// Fechar dropdown de presets ao clicar fora
	if (presetOpen.value) {
		if (!presetContainerRef.value?.contains(target)) {
			presetOpen.value = false;
		}
	}

	// Fechar dropdown personalizado ao clicar fora
	if (isCustomOpen.value) {
		if (!customDropdownRef.value?.contains(target) && !customTriggerRef.value?.contains(target)) {
			isCustomOpen.value = false;
			activeCalendar.value = null;
		}
	}
};

onMounted(() => {
	document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("mousedown", handleClickOutside);
});

// ─── Mapa de tamanhos unificado ─────────────────────────────────────────────

const sizeMap: Record<string, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-10 px-3 text-sm",
	lg: "h-12 px-4 text-base",
};

// ─── Classes do trigger personalizado ───────────────────────────────────────

const customTriggerClasses = computed(() => [
	"flex items-center gap-2 w-full rounded border bg-card text-foreground transition-colors cursor-pointer select-none whitespace-nowrap outline-none",
	sizeMap[props.size],
	props.disabled
		? "opacity-50 cursor-not-allowed"
		: "hover:border-neutral-400 dark:hover:border-neutral-500",
	isCustomOpen.value ? "border-primary" : "border-border",
]);
</script>

<template>
	<div
		class="inline-flex flex-wrap items-center gap-2 sm:flex-nowrap"
		:class="{ 'w-full': fullWidth }"
	>
		<!-- ═══ Picker Personalizado (substituiu o input[type=date]) ═══ -->
		<div
			v-if="presetSelecionado === 'personalizado'"
			class="relative"
			:class="fullWidth ? 'flex-1' : 'w-[320px]'"
		>
			<!-- Trigger do Date Range Picker -->
			<div
				ref="customTriggerRef"
				:class="customTriggerClasses"
				tabindex="0"
				@click="toggleCustomDropdown"
				@keydown.enter.prevent="toggleCustomDropdown"
				@keydown.space.prevent="toggleCustomDropdown"
			>
				<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
				<span
					:class="[
						'flex-1 truncate text-left',
						hasCustomValue ? 'text-foreground' : 'text-muted-foreground',
					]"
				>
					{{ customTriggerText }}
				</span>
				<Icon
					name="lucide:chevron-down"
					:class="[
						'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
						isCustomOpen && 'rotate-180',
					]"
				/>
			</div>

			<!-- Dropdown do Date Range Picker -->
			<Transition
				enter-active-class="transition-all duration-200 ease-out"
				enter-from-class="opacity-0 scale-95 -translate-y-1"
				enter-to-class="opacity-100 scale-100 translate-y-0"
				leave-active-class="transition-all duration-150 ease-in"
				leave-from-class="opacity-100 scale-100 translate-y-0"
				leave-to-class="opacity-0 scale-95 -translate-y-1"
			>
				<div
					v-if="isCustomOpen"
					ref="customDropdownRef"
					class="bg-popover border-border absolute top-full left-0 z-50 mt-1 w-full rounded-lg border p-4 shadow-lg"
				>
					<div class="flex flex-col gap-4">
						<!-- ─── Campo Data Início ─── -->
						<div class="flex flex-col gap-1.5">
							<span class="text-muted-foreground text-xs font-medium"> Data Início </span>

							<div
								:class="[
									'bg-card text-foreground flex h-9 w-full cursor-pointer items-center gap-2 rounded border px-3 text-sm transition-colors select-none',
									activeCalendar === 'start'
										? 'border-primary'
										: 'border-border hover:border-neutral-400 dark:hover:border-neutral-500',
								]"
								aria-label="Selecionar data de início"
								@click="toggleCalendar('start')"
							>
								<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
								<span v-if="startDateDisplay" class="text-foreground flex-1">
									{{ startDateDisplay }}
								</span>
								<span v-else class="text-muted-foreground flex-1"> Selecione </span>
							</div>

							<!-- Calendário Início (inline) -->
							<Transition
								enter-active-class="transition-all duration-200 ease-out"
								enter-from-class="opacity-0 scale-95"
								enter-to-class="opacity-100 scale-100"
								leave-active-class="transition-all duration-150 ease-in"
								leave-from-class="opacity-100 scale-100"
								leave-to-class="opacity-0 scale-95"
							>
								<div
									v-if="activeCalendar === 'start'"
									class="bg-card border-border mt-1 rounded-lg border p-3"
								>
									<!-- Header do calendário -->
									<div class="mb-3 flex items-center justify-between">
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
											@click.stop="startCalMesAnterior"
										>
											<Icon name="lucide:chevron-left" class="size-4" />
										</button>
										<span class="text-foreground text-sm font-semibold select-none">
											{{ startCalLabel }}
										</span>
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
											@click.stop="startCalProximoMes"
										>
											<Icon name="lucide:chevron-right" class="size-4" />
										</button>
									</div>

									<!-- Dias da semana -->
									<div class="mb-2 grid grid-cols-7 gap-1">
										<div
											v-for="dia in diasSemana"
											:key="dia"
											class="text-muted-foreground py-1 text-center text-xs font-medium select-none"
										>
											{{ dia }}
										</div>
									</div>

									<!-- Grade de dias -->
									<div class="grid grid-cols-7 gap-1">
										<button
											v-for="(item, index) in startCalendarDays"
											:key="index"
											type="button"
											:disabled="item.isDesabilitado"
											:class="[
												'flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors',
												item.mes === 'atual'
													? 'text-foreground'
													: 'text-muted-foreground opacity-40',
												// Hoje (sem estar selecionado)
												item.isHoje && !item.isSelecionado
													? 'ring-primary font-semibold ring-2'
													: '',
												// Selecionado
												item.isSelecionado
													? 'bg-primary text-primary-foreground font-semibold'
													: '',
												// In range (entre start e end)
												item.isInRange && !item.isSelecionado ? 'bg-primary/10' : '',
												// Hover normal
												!item.isSelecionado && !item.isDesabilitado && item.mes === 'atual'
													? 'hover:bg-accent'
													: '',
												// Desabilitado
												item.isDesabilitado ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
											]"
											@click.stop="selecionarDataStart(item)"
										>
											{{ item.dia }}
										</button>
									</div>
								</div>
							</Transition>
						</div>

						<!-- ─── Campo Data Fim ─── -->
						<div class="flex flex-col gap-1.5">
							<span class="text-muted-foreground text-xs font-medium"> Data Fim </span>

							<div
								:class="[
									'bg-card text-foreground flex h-9 w-full cursor-pointer items-center gap-2 rounded border px-3 text-sm transition-colors select-none',
									activeCalendar === 'end'
										? 'border-primary'
										: 'border-border hover:border-neutral-400 dark:hover:border-neutral-500',
								]"
								aria-label="Selecionar data de fim"
								@click="toggleCalendar('end')"
							>
								<Icon name="lucide:calendar" class="text-muted-foreground size-4 shrink-0" />
								<span v-if="endDateDisplay" class="text-foreground flex-1">
									{{ endDateDisplay }}
								</span>
								<span v-else class="text-muted-foreground flex-1"> Selecione </span>
							</div>

							<!-- Calendário Fim (inline) -->
							<Transition
								enter-active-class="transition-all duration-200 ease-out"
								enter-from-class="opacity-0 scale-95"
								enter-to-class="opacity-100 scale-100"
								leave-active-class="transition-all duration-150 ease-in"
								leave-from-class="opacity-100 scale-100"
								leave-to-class="opacity-0 scale-95"
							>
								<div
									v-if="activeCalendar === 'end'"
									class="bg-card border-border mt-1 rounded-lg border p-3"
								>
									<!-- Header do calendário -->
									<div class="mb-3 flex items-center justify-between">
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
											@click.stop="endCalMesAnterior"
										>
											<Icon name="lucide:chevron-left" class="size-4" />
										</button>
										<span class="text-foreground text-sm font-semibold select-none">
											{{ endCalLabel }}
										</span>
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
											@click.stop="endCalProximoMes"
										>
											<Icon name="lucide:chevron-right" class="size-4" />
										</button>
									</div>

									<!-- Dias da semana -->
									<div class="mb-2 grid grid-cols-7 gap-1">
										<div
											v-for="dia in diasSemana"
											:key="dia"
											class="text-muted-foreground py-1 text-center text-xs font-medium select-none"
										>
											{{ dia }}
										</div>
									</div>

									<!-- Grade de dias -->
									<div class="grid grid-cols-7 gap-1">
										<button
											v-for="(item, index) in endCalendarDays"
											:key="index"
											type="button"
											:disabled="item.isDesabilitado"
											:class="[
												'flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors',
												item.mes === 'atual'
													? 'text-foreground'
													: 'text-muted-foreground opacity-40',
												// Hoje (sem estar selecionado)
												item.isHoje && !item.isSelecionado
													? 'ring-primary font-semibold ring-2'
													: '',
												// Selecionado
												item.isSelecionado
													? 'bg-primary text-primary-foreground font-semibold'
													: '',
												// In range (entre start e end)
												item.isInRange && !item.isSelecionado ? 'bg-primary/10' : '',
												// Hover normal
												!item.isSelecionado && !item.isDesabilitado && item.mes === 'atual'
													? 'hover:bg-accent'
													: '',
												// Desabilitado
												item.isDesabilitado ? 'cursor-not-allowed opacity-30' : 'cursor-pointer',
											]"
											@click.stop="selecionarDataEnd(item)"
										>
											{{ item.dia }}
										</button>
									</div>
								</div>
							</Transition>
						</div>
					</div>

					<!-- ─── Ações (Limpar / Aplicar) ─── -->
					<div class="border-border mt-4 flex items-center justify-end gap-2 border-t pt-3">
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
							@click="limparCustom"
						>
							Limpar
						</button>
						<button
							type="button"
							:disabled="!isRangeComplete"
							:class="[
								'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
								isRangeComplete
									? 'bg-primary text-primary-foreground hover:bg-primary/90'
									: 'bg-muted text-muted-foreground cursor-not-allowed',
							]"
							@click="aplicarCustom"
						>
							Aplicar
						</button>
					</div>
				</div>
			</Transition>
		</div>

		<!-- ═══ Select de Presets (built-in, sem UiSelect) ═══ -->
		<div ref="presetContainerRef" class="relative" :class="fullWidth ? 'flex-1' : 'w-[200px]'">
			<!-- Trigger do select de presets -->
			<button
				ref="presetTriggerRef"
				type="button"
				:disabled="disabled"
				:aria-expanded="presetOpen"
				aria-haspopup="listbox"
				:class="presetTriggerClasses"
				@click="togglePreset"
				@keydown="handlePresetKeydown"
			>
				<!-- Texto selecionado ou placeholder -->
				<span
					class="flex-1 truncate text-left"
					:class="selectedPresetOption ? 'text-foreground' : 'text-muted-foreground'"
				>
					{{ selectedPresetOption?.label ?? "Selecione o período" }}
				</span>

				<!-- Chevron -->
				<Icon
					name="lucide:chevrons-up-down"
					class="text-muted-foreground size-4 shrink-0"
					aria-hidden="true"
				/>
			</button>

			<!-- Painel de opções -->
			<Transition
				enter-active-class="transition-all duration-150 ease-out"
				:enter-from-class="
					presetPlacement === 'bottom'
						? 'opacity-0 scale-95 -translate-y-1'
						: 'opacity-0 scale-95 translate-y-1'
				"
				enter-to-class="opacity-100 scale-100 translate-y-0"
				leave-active-class="transition-all duration-100 ease-in"
				leave-from-class="opacity-100 scale-100 translate-y-0"
				:leave-to-class="
					presetPlacement === 'bottom'
						? 'opacity-0 scale-95 -translate-y-1'
						: 'opacity-0 scale-95 translate-y-1'
				"
			>
				<div
					v-if="presetOpen"
					role="listbox"
					:class="[
						'border-border bg-popover absolute left-0 z-50 flex max-h-60 w-full flex-col gap-0.5 overflow-y-auto rounded border p-1 shadow-md',
						presetPlacement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
					]"
				>
					<button
						v-for="option in presetOptions"
						:key="option.value"
						type="button"
						role="option"
						:aria-selected="option.value === presetSelecionado"
						:class="[
							'flex w-full items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors',
							option.value === presetSelecionado
								? 'bg-accent text-foreground font-medium'
								: 'text-foreground hover:bg-accent',
						]"
						@click="selectPresetOption(option.value)"
					>
						<span class="flex-1 text-left">{{ option.label }}</span>
						<Icon
							v-if="option.value === presetSelecionado"
							name="lucide:check"
							class="text-primary size-4 shrink-0"
							aria-hidden="true"
						/>
					</button>
				</div>
			</Transition>
		</div>

		<!-- ═══ Resumo (Dias / Período Formatado) ═══ -->
		<div
			v-if="showInfo && periodoFormatado"
			class="text-muted-foreground bg-muted border-border flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap"
		>
			<Icon name="lucide:calendar" class="size-4" />
			<span class="font-mono text-[11px] font-medium">
				{{ periodoFormatado }}
			</span>

			<!-- Pill de quantidade de dias -->
			<span
				v-if="diasNoPeriodo > 0"
				class="bg-card text-foreground border-border ml-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold shadow-sm"
			>
				{{ diasNoPeriodo }} dia{{ diasNoPeriodo !== 1 ? "s" : "" }}
			</span>
		</div>
	</div>
</template>
