/**
 * 📌 Formatador de Timestamps UTC
 *
 * Converte timestamps UTC (do Supabase) para timezone e locale específicos.
 * Usa API nativa Intl.DateTimeFormat (zero dependências externas).
 */

import { DEFAULT_LOCALE, DEFAULT_TIMEZONE } from "~~/shared/constants/locale";

/** Opções de formatação de timestamp */
export interface FormatTimestampOptions {
	/** Timezone (IANA) — padrão: America/Sao_Paulo */
	timezone?: string;
	/** Locale (BCP 47) — padrão: pt-BR */
	locale?: string;
	/** Formato de saída */
	format?: "date" | "datetime" | "time" | "relative" | "short" | "long";
	/** Incluir segundos (apenas para time/datetime) */
	includeSeconds?: boolean;
}

/**
 * Formatar timestamp UTC para timezone e locale específicos
 *
 * @example
 * formatTimestamp('2024-02-25T15:30:00Z')
 * // Brasil (GMT-3): '25/02/2024 12:30'
 *
 * formatTimestamp('2024-02-25T15:30:00Z', { format: 'date' })
 * // '25/02/2024'
 */
export const formatTimestamp = (
	utcTimestamp: string | Date | null | undefined,
	options: FormatTimestampOptions = {},
): string => {
	if (!utcTimestamp) return "";

	const date = typeof utcTimestamp === "string" ? new Date(utcTimestamp) : utcTimestamp;
	if (isNaN(date.getTime())) return "";

	const timezone = options.timezone ?? DEFAULT_TIMEZONE;
	const locale = options.locale ?? DEFAULT_LOCALE;
	const format = options.format ?? "datetime";

	if (format === "relative") {
		return formatRelativeTimestamp(date, locale);
	}

	const formatOptions = getDateTimeFormatOptions(format, timezone, options.includeSeconds);

	try {
		return new Intl.DateTimeFormat(locale, formatOptions).format(date);
	} catch (error) {
		console.error("[formatTimestamp] Erro ao formatar:", error);
		return date.toISOString();
	}
};

/** Retorna opções do Intl.DateTimeFormat baseado no formato */
const getDateTimeFormatOptions = (
	format: "date" | "datetime" | "time" | "short" | "long",
	timezone: string,
	includeSeconds?: boolean,
): Intl.DateTimeFormatOptions => {
	const base: Intl.DateTimeFormatOptions = { timeZone: timezone };

	switch (format) {
		case "date":
			return { ...base, year: "numeric", month: "2-digit", day: "2-digit" };
		case "time":
			return {
				...base,
				hour: "2-digit",
				minute: "2-digit",
				...(includeSeconds && { second: "2-digit" }),
			};
		case "datetime":
			return {
				...base,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				...(includeSeconds && { second: "2-digit" }),
			};
		case "short":
			return { ...base, dateStyle: "short", timeStyle: "short" };
		case "long":
			return { ...base, dateStyle: "long", timeStyle: "long" };
		default:
			return base;
	}
};

/**
 * Formatar timestamp de forma relativa (há X minutos, há X horas)
 *
 * @example
 * formatRelativeTimestamp(new Date(Date.now() - 60000), 'pt-BR')
 * // 'há 1 minuto'
 */
export const formatRelativeTimestamp = (date: Date, locale: string = DEFAULT_LOCALE): string => {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffDay / 365);

	try {
		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

		if (diffSec < 60) return rtf.format(-diffSec, "second");
		if (diffMin < 60) return rtf.format(-diffMin, "minute");
		if (diffHour < 24) return rtf.format(-diffHour, "hour");
		if (diffDay < 30) return rtf.format(-diffDay, "day");
		if (diffMonth < 12) return rtf.format(-diffMonth, "month");

		return rtf.format(-diffYear, "year");
	} catch (error) {
		console.error("[formatRelativeTimestamp] Erro ao formatar:", error);
		return date.toISOString();
	}
};

/**
 * Formatar apenas a data (sem hora)
 *
 * @example
 * formatDateOnly('2024-02-25T15:30:00Z') // '25/02/2024'
 */
export const formatDateOnly = (
	utcTimestamp: string | Date | null | undefined,
	options: Omit<FormatTimestampOptions, "format"> = {},
): string => formatTimestamp(utcTimestamp, { ...options, format: "date" });

/**
 * Formatar apenas a hora (sem data)
 *
 * @example
 * formatTimeOnly('2024-02-25T15:30:00Z') // '12:30' (Brasil GMT-3)
 */
export const formatTimeOnly = (
	utcTimestamp: string | Date | null | undefined,
	options: Omit<FormatTimestampOptions, "format"> = {},
): string => formatTimestamp(utcTimestamp, { ...options, format: "time" });

/**
 * Converter data local para UTC (para enviar ao backend)
 *
 * @example
 * toUTC(new Date('2024-02-25T12:30:00')) // '2024-02-25T15:30:00.000Z'
 */
export const toUTC = (localDate: Date): string => localDate.toISOString();

/**
 * Obter timestamp atual em UTC
 *
 * @example
 * nowUTC() // '2024-02-25T15:30:00.000Z'
 */
export const nowUTC = (): string => new Date().toISOString();
