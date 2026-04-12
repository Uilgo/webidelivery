/**
 * Constantes de preferências do usuário — timezones, locales e padrões
 */

import type { PreferenciasUsuario } from "~~/shared/types/database/core";

// ---------------------------------------------------------------------------
// Padrões
// ---------------------------------------------------------------------------

/** Preferências padrão para novos usuários (Brasil) */
export const DEFAULT_PREFERENCES: Required<
	Pick<
		PreferenciasUsuario,
		| "timezone"
		| "locale"
		| "theme"
		| "sidebar_collapsed"
		| "notifications_enabled"
		| "sound_enabled"
		| "dashboard_layout"
		| "items_per_page"
	>
> = {
	timezone: "America/Sao_Paulo",
	locale: "pt-BR",
	theme: "system",
	sidebar_collapsed: false,
	notifications_enabled: true,
	sound_enabled: true,
	dashboard_layout: "grid",
	items_per_page: 20,
};

// ---------------------------------------------------------------------------
// Timezones suportados
// ---------------------------------------------------------------------------

export const SUPPORTED_TIMEZONES = [
	// Brasil
	{ value: "America/Sao_Paulo", label: "Brasília (GMT-3)", country: "🇧🇷 Brasil" },
	{ value: "America/Manaus", label: "Manaus (GMT-4)", country: "🇧🇷 Brasil" },
	{ value: "America/Rio_Branco", label: "Rio Branco (GMT-5)", country: "🇧🇷 Brasil" },
	{ value: "America/Noronha", label: "Fernando de Noronha (GMT-2)", country: "🇧🇷 Brasil" },
	// Américas
	{ value: "America/New_York", label: "Nova York (GMT-5)", country: "🇺🇸 EUA" },
	{ value: "America/Los_Angeles", label: "Los Angeles (GMT-8)", country: "🇺🇸 EUA" },
	{ value: "America/Chicago", label: "Chicago (GMT-6)", country: "🇺🇸 EUA" },
	{ value: "America/Mexico_City", label: "Cidade do México (GMT-6)", country: "🇲🇽 México" },
	{ value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)", country: "🇦🇷 Argentina" },
	// Europa
	{ value: "Europe/London", label: "Londres (GMT+0)", country: "🇬🇧 Reino Unido" },
	{ value: "Europe/Paris", label: "Paris (GMT+1)", country: "🇫🇷 França" },
	{ value: "Europe/Madrid", label: "Madrid (GMT+1)", country: "🇪🇸 Espanha" },
	{ value: "Europe/Lisbon", label: "Lisboa (GMT+0)", country: "🇵🇹 Portugal" },
	// Ásia
	{ value: "Asia/Tokyo", label: "Tóquio (GMT+9)", country: "🇯🇵 Japão" },
	{ value: "Asia/Shanghai", label: "Xangai (GMT+8)", country: "🇨🇳 China" },
	{ value: "Asia/Dubai", label: "Dubai (GMT+4)", country: "🇦🇪 Emirados Árabes" },
] as const;

// ---------------------------------------------------------------------------
// Locales suportados
// ---------------------------------------------------------------------------

export const SUPPORTED_LOCALES = [
	{ value: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
	{ value: "en-US", label: "English (USA)", flag: "🇺🇸" },
	{ value: "es-ES", label: "Español (España)", flag: "🇪🇸" },
	{ value: "es-MX", label: "Español (México)", flag: "🇲🇽" },
	{ value: "fr-FR", label: "Français (France)", flag: "🇫🇷" },
	{ value: "de-DE", label: "Deutsch (Deutschland)", flag: "🇩🇪" },
	{ value: "it-IT", label: "Italiano (Italia)", flag: "🇮🇹" },
	{ value: "ja-JP", label: "日本語 (日本)", flag: "🇯🇵" },
	{ value: "zh-CN", label: "中文 (中国)", flag: "🇨🇳" },
] as const;

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

/** Verifica se o objeto é uma preferência válida */
export const isValidPreferences = (obj: unknown): obj is PreferenciasUsuario => {
	if (typeof obj !== "object" || obj === null) return false;
	const prefs = obj as Partial<PreferenciasUsuario>;
	if (prefs.timezone !== undefined && typeof prefs.timezone !== "string") return false;
	if (prefs.locale !== undefined && typeof prefs.locale !== "string") return false;
	if (
		prefs.theme !== undefined &&
		prefs.theme !== "light" &&
		prefs.theme !== "dark" &&
		prefs.theme !== "system"
	)
		return false;
	if (prefs.sidebar_collapsed !== undefined && typeof prefs.sidebar_collapsed !== "boolean")
		return false;
	if (prefs.notifications_enabled !== undefined && typeof prefs.notifications_enabled !== "boolean")
		return false;
	if (prefs.sound_enabled !== undefined && typeof prefs.sound_enabled !== "boolean") return false;
	if (
		prefs.dashboard_layout !== undefined &&
		prefs.dashboard_layout !== "grid" &&
		prefs.dashboard_layout !== "list"
	)
		return false;
	if (prefs.items_per_page !== undefined && typeof prefs.items_per_page !== "number") return false;
	return true;
};
