/**
 * Detecção automática de país do usuário.
 * Detecta baseado em timezone e locale do navegador.
 *
 * ATENÇÃO: Funções que acessam `navigator` ou `Intl` só funcionam no cliente.
 */

import type { TCountryCode } from "countries-list";

/**
 * Mapeamento reverso: Timezone IANA → País (ISO 3166-1 alpha-2)
 */
const TIMEZONE_TO_COUNTRY: Record<string, TCountryCode> = {
	// Brasil (múltiplos timezones)
	"America/Sao_Paulo": "BR",
	"America/Manaus": "BR",
	"America/Rio_Branco": "BR",
	"America/Noronha": "BR",
	"America/Belem": "BR",
	"America/Fortaleza": "BR",
	"America/Recife": "BR",
	"America/Araguaina": "BR",
	"America/Maceio": "BR",
	"America/Bahia": "BR",
	"America/Santarem": "BR",
	"America/Campo_Grande": "BR",
	"America/Cuiaba": "BR",
	"America/Porto_Velho": "BR",
	"America/Boa_Vista": "BR",

	// Portugal
	"Europe/Lisbon": "PT",
	"Atlantic/Madeira": "PT",
	"Atlantic/Azores": "PT",

	// PALOP
	"Africa/Luanda": "AO",
	"Africa/Maputo": "MZ",
	"Africa/Bissau": "GW",
	"Atlantic/Cape_Verde": "CV",
	"Africa/Sao_Tome": "ST",
	"Africa/Malabo": "GQ",
	"Asia/Dili": "TL",
	"Asia/Macau": "MO",

	// EUA
	"America/New_York": "US",
	"America/Los_Angeles": "US",
	"America/Chicago": "US",
	"America/Denver": "US",
	"America/Phoenix": "US",
	"America/Anchorage": "US",
	"Pacific/Honolulu": "US",

	// Reino Unido
	"Europe/London": "GB",

	// Canadá
	"America/Toronto": "CA",
	"America/Vancouver": "CA",
	"America/Montreal": "CA",
	"America/Halifax": "CA",

	// Austrália
	"Australia/Sydney": "AU",
	"Australia/Melbourne": "AU",
	"Australia/Brisbane": "AU",
	"Australia/Perth": "AU",
	"Australia/Adelaide": "AU",

	// Nova Zelândia
	"Pacific/Auckland": "NZ",

	// Irlanda
	"Europe/Dublin": "IE",

	// África do Sul
	"Africa/Johannesburg": "ZA",

	// Índia
	"Asia/Kolkata": "IN",
	"Asia/Calcutta": "IN",

	// Paquistão
	"Asia/Karachi": "PK",

	// Bangladesh
	"Asia/Dhaka": "BD",

	// Nigéria
	"Africa/Lagos": "NG",

	// Quênia
	"Africa/Nairobi": "KE",

	// Gana
	"Africa/Accra": "GH",

	// Uganda
	"Africa/Kampala": "UG",

	// Tanzânia
	"Africa/Dar_es_Salaam": "TZ",

	// Zimbábue
	"Africa/Harare": "ZW",

	// Jamaica
	"America/Jamaica": "JM",

	// Trinidad e Tobago
	"America/Port_of_Spain": "TT",

	// Barbados
	"America/Barbados": "BB",

	// Bahamas
	"America/Nassau": "BS",

	// Belize
	"America/Belize": "BZ",

	// Guiana
	"America/Guyana": "GY",

	// Malta
	"Europe/Malta": "MT",

	// Singapura
	"Asia/Singapore": "SG",

	// Filipinas
	"Asia/Manila": "PH",

	// Malásia
	"Asia/Kuala_Lumpur": "MY",

	// Hong Kong
	"Asia/Hong_Kong": "HK",

	// Países Africanos (inglês)
	"Africa/Gaborone": "BW",
	"Africa/Douala": "CM",
	"Africa/Addis_Ababa": "ET",
	"Africa/Banjul": "GM",
	"Africa/Monrovia": "LR",
	"Africa/Blantyre": "MW",
	"Indian/Mauritius": "MU",
	"Africa/Windhoek": "NA",
	"Africa/Kigali": "RW",
	"Indian/Mahe": "SC",
	"Africa/Freetown": "SL",
	"Africa/Juba": "SS",
	"Africa/Khartoum": "SD",
	"Africa/Mbabane": "SZ",
	"Africa/Lusaka": "ZM",

	// Caribe (inglês)
	"America/Antigua": "AG",
	"America/Dominica": "DM",
	"America/Grenada": "GD",
	"America/St_Kitts": "KN",
	"America/St_Lucia": "LC",
	"America/St_Vincent": "VC",

	// Oceania (inglês)
	"Pacific/Fiji": "FJ",
	"Pacific/Port_Moresby": "PG",
	"Pacific/Apia": "WS",
	"Pacific/Tongatapu": "TO",
	"Pacific/Efate": "VU",
	"Pacific/Guadalcanal": "SB",

	// Ásia (inglês)
	"Asia/Colombo": "LK",
	"Asia/Yangon": "MM",
	"Asia/Kathmandu": "NP",
	"Asia/Brunei": "BN",

	// Espanha
	"Europe/Madrid": "ES",
	"Atlantic/Canary": "ES",

	// México
	"America/Mexico_City": "MX",
	"America/Cancun": "MX",
	"America/Tijuana": "MX",

	// Argentina
	"America/Buenos_Aires": "AR",

	// Colômbia
	"America/Bogota": "CO",

	// Peru
	"America/Lima": "PE",

	// Venezuela
	"America/Caracas": "VE",

	// Chile
	"America/Santiago": "CL",

	// Equador
	"America/Guayaquil": "EC",

	// Guatemala
	"America/Guatemala": "GT",

	// Cuba
	"America/Havana": "CU",

	// Bolívia
	"America/La_Paz": "BO",

	// República Dominicana
	"America/Santo_Domingo": "DO",

	// Honduras
	"America/Tegucigalpa": "HN",

	// Paraguai
	"America/Asuncion": "PY",

	// Nicarágua
	"America/Managua": "NI",

	// El Salvador
	"America/El_Salvador": "SV",

	// Costa Rica
	"America/Costa_Rica": "CR",

	// Panamá
	"America/Panama": "PA",

	// Uruguai
	"America/Montevideo": "UY",

	// Porto Rico
	"America/Puerto_Rico": "PR",

	// Gibraltar
	"Europe/Gibraltar": "GI",

	// Outros
	"Europe/Paris": "FR",
	"Europe/Berlin": "DE",
	"Europe/Rome": "IT",
	"Asia/Tokyo": "JP",
	"Asia/Shanghai": "CN",
	"Asia/Dubai": "AE",
};

/**
 * Mapeamento de locale BCP 47 → País (fallback quando timezone não resolve)
 */
const LOCALE_TO_COUNTRY: Record<string, TCountryCode> = {
	// Português
	"pt-BR": "BR",
	"pt-PT": "PT",
	"pt-AO": "AO",
	"pt-MZ": "MZ",
	"pt-GW": "GW",
	"pt-CV": "CV",
	"pt-ST": "ST",
	"pt-GQ": "GQ",
	"pt-TL": "TL",

	// Inglês
	"en-US": "US",
	"en-GB": "GB",
	"en-CA": "CA",
	"en-AU": "AU",
	"en-NZ": "NZ",
	"en-IE": "IE",
	"en-ZA": "ZA",
	"en-IN": "IN",
	"en-PK": "PK",
	"en-NG": "NG",
	"en-KE": "KE",
	"en-GH": "GH",
	"en-UG": "UG",
	"en-TZ": "TZ",
	"en-ZW": "ZW",
	"en-JM": "JM",
	"en-TT": "TT",
	"en-BB": "BB",
	"en-BS": "BS",
	"en-BZ": "BZ",
	"en-GY": "GY",
	"en-MT": "MT",
	"en-SG": "SG",
	"en-PH": "PH",
	"en-MY": "MY",
	"en-HK": "HK",
	"en-BW": "BW",
	"en-CM": "CM",
	"en-GM": "GM",
	"en-LR": "LR",
	"en-MW": "MW",
	"en-MU": "MU",
	"en-NA": "NA",
	"en-SC": "SC",
	"en-SL": "SL",
	"en-SS": "SS",
	"en-SZ": "SZ",
	"en-ZM": "ZM",
	"en-AG": "AG",
	"en-DM": "DM",
	"en-GD": "GD",
	"en-KN": "KN",
	"en-LC": "LC",
	"en-VC": "VC",
	"en-FJ": "FJ",
	"en-PG": "PG",
	"en-WS": "WS",
	"en-SB": "SB",
	"en-GI": "GI",

	// Espanhol
	"es-ES": "ES",
	"es-MX": "MX",
	"es-AR": "AR",
	"es-CO": "CO",
	"es-PE": "PE",
	"es-VE": "VE",
	"es-CL": "CL",
	"es-EC": "EC",
	"es-GT": "GT",
	"es-CU": "CU",
	"es-BO": "BO",
	"es-DO": "DO",
	"es-HN": "HN",
	"es-PY": "PY",
	"es-NI": "NI",
	"es-SV": "SV",
	"es-CR": "CR",
	"es-PA": "PA",
	"es-UY": "UY",
	"es-PR": "PR",

	// Outros
	"fr-FR": "FR",
	"de-DE": "DE",
	"it-IT": "IT",
	"ja-JP": "JP",
	"zh-CN": "CN",
	"ar-AE": "AE",
	"bn-BD": "BD",
	"am-ET": "ET",
	"rw-RW": "RW",
	"ar-SD": "SD",
	"to-TO": "TO",
	"bi-VU": "VU",
	"si-LK": "LK",
	"my-MM": "MM",
	"ne-NP": "NP",
	"ms-BN": "BN",
	"zh-MO": "MO",
};

/**
 * Detecta o timezone do navegador.
 * @returns Timezone IANA (ex: "America/Sao_Paulo")
 */
export const detectBrowserTimezone = (): string => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return "America/Sao_Paulo";
	}
};

/**
 * Detecta o locale do navegador.
 * @returns Locale BCP 47 (ex: "pt-BR")
 */
export const detectBrowserLocale = (): string => {
	try {
		return navigator.language || navigator.languages?.[0] || "pt-BR";
	} catch {
		return "pt-BR";
	}
};

/**
 * Detecta o país do usuário baseado em timezone e locale.
 *
 * Estratégia:
 * 1. Timezone (mais preciso)
 * 2. Locale completo (ex: "pt-BR")
 * 3. Prefixo do locale (ex: "pt" → BR)
 * 4. Fallback: Brasil
 *
 * @example
 * detectUserCountry() // "BR" se timezone for "America/Sao_Paulo"
 */
export const detectUserCountry = (): TCountryCode => {
	const timezone = detectBrowserTimezone();
	const countryByTimezone = TIMEZONE_TO_COUNTRY[timezone];
	if (countryByTimezone) return countryByTimezone;

	const locale = detectBrowserLocale();
	const countryByLocale = LOCALE_TO_COUNTRY[locale];
	if (countryByLocale) return countryByLocale;

	// Inferir pelo prefixo do locale
	const prefix = locale.split("-")[0];
	if (prefix === "pt") return "BR";
	if (prefix === "en") return "US";
	if (prefix === "es") return "ES";

	return "BR";
};

/**
 * Detecta timezone, locale e país do navegador de uma vez.
 */
export const detectBrowserInfo = (): {
	timezone: string;
	locale: string;
	country: TCountryCode;
} => {
	return {
		timezone: detectBrowserTimezone(),
		locale: detectBrowserLocale(),
		country: detectUserCountry(),
	};
};
