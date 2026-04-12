/**
 * Constantes de países — mapeamentos de país para timezone, locale e moeda padrão.
 * Baseado na biblioteca countries-list + dados customizados.
 *
 * Total: 100+ países mapeados
 * - Português: 10 países (BR, PT, AO, MZ, GW, CV, ST, GQ, TL, MO)
 * - Inglês: 50+ países (US, GB, CA, AU, NZ, IE, ZA, IN, PK, NG, KE, GH, etc)
 * - Espanhol: 22 países (ES, MX, AR, CO, PE, VE, CL, EC, GT, CU, BO, DO, HN, PY, NI, SV, CR, PA, UY, PR, GI)
 * - Outros: FR, DE, IT, JP, CN, AE
 */

import type { TCountryCode } from "countries-list";

/** Países principais suportados inicialmente */
export const MAIN_COUNTRIES: TCountryCode[] = ["BR", "PT", "US", "ES"];

/**
 * Mapeamento de país (ISO 3166-1 alpha-2) para timezone IANA padrão.
 * Países com múltiplos timezones usam o mais comum/capital.
 */
export const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
	// Língua Portuguesa
	BR: "America/Sao_Paulo",
	PT: "Europe/Lisbon",
	AO: "Africa/Luanda",
	MZ: "Africa/Maputo",
	GW: "Africa/Bissau",
	CV: "Atlantic/Cape_Verde",
	ST: "Africa/Sao_Tome",
	GQ: "Africa/Malabo",
	TL: "Asia/Dili",
	MO: "Asia/Macau",

	// Língua Inglesa
	US: "America/New_York",
	GB: "Europe/London",
	CA: "America/Toronto",
	AU: "Australia/Sydney",
	NZ: "Pacific/Auckland",
	IE: "Europe/Dublin",
	ZA: "Africa/Johannesburg",
	IN: "Asia/Kolkata",
	PK: "Asia/Karachi",
	BD: "Asia/Dhaka",
	NG: "Africa/Lagos",
	KE: "Africa/Nairobi",
	GH: "Africa/Accra",
	UG: "Africa/Kampala",
	TZ: "Africa/Dar_es_Salaam",
	ZW: "Africa/Harare",
	JM: "America/Jamaica",
	TT: "America/Port_of_Spain",
	BB: "America/Barbados",
	BS: "America/Nassau",
	BZ: "America/Belize",
	GY: "America/Guyana",
	MT: "Europe/Malta",
	SG: "Asia/Singapore",
	PH: "Asia/Manila",
	MY: "Asia/Kuala_Lumpur",
	HK: "Asia/Hong_Kong",
	BW: "Africa/Gaborone",
	CM: "Africa/Douala",
	ET: "Africa/Addis_Ababa",
	GM: "Africa/Banjul",
	LR: "Africa/Monrovia",
	MW: "Africa/Blantyre",
	MU: "Indian/Mauritius",
	NA: "Africa/Windhoek",
	RW: "Africa/Kigali",
	SC: "Indian/Mahe",
	SL: "Africa/Freetown",
	SS: "Africa/Juba",
	SD: "Africa/Khartoum",
	SZ: "Africa/Mbabane",
	ZM: "Africa/Lusaka",
	AG: "America/Antigua",
	DM: "America/Dominica",
	GD: "America/Grenada",
	KN: "America/St_Kitts",
	LC: "America/St_Lucia",
	VC: "America/St_Vincent",
	FJ: "Pacific/Fiji",
	PG: "Pacific/Port_Moresby",
	WS: "Pacific/Apia",
	TO: "Pacific/Tongatapu",
	VU: "Pacific/Efate",
	SB: "Pacific/Guadalcanal",
	LK: "Asia/Colombo",
	MM: "Asia/Yangon",
	NP: "Asia/Kathmandu",
	BN: "Asia/Brunei",

	// Língua Espanhola
	ES: "Europe/Madrid",
	MX: "America/Mexico_City",
	AR: "America/Buenos_Aires",
	CO: "America/Bogota",
	PE: "America/Lima",
	VE: "America/Caracas",
	CL: "America/Santiago",
	EC: "America/Guayaquil",
	GT: "America/Guatemala",
	CU: "America/Havana",
	BO: "America/La_Paz",
	DO: "America/Santo_Domingo",
	HN: "America/Tegucigalpa",
	PY: "America/Asuncion",
	NI: "America/Managua",
	SV: "America/El_Salvador",
	CR: "America/Costa_Rica",
	PA: "America/Panama",
	UY: "America/Montevideo",
	PR: "America/Puerto_Rico",
	GI: "Europe/Gibraltar",

	// Outros
	FR: "Europe/Paris",
	DE: "Europe/Berlin",
	IT: "Europe/Rome",
	JP: "Asia/Tokyo",
	CN: "Asia/Shanghai",
	AE: "Asia/Dubai",
};

/**
 * Mapeamento de país (ISO 3166-1 alpha-2) para locale BCP 47 padrão.
 */
export const COUNTRY_LOCALE_MAP: Record<string, string> = {
	// Língua Portuguesa
	BR: "pt-BR",
	PT: "pt-PT",
	AO: "pt-AO",
	MZ: "pt-MZ",
	GW: "pt-GW",
	CV: "pt-CV",
	ST: "pt-ST",
	GQ: "pt-GQ",
	TL: "pt-TL",
	MO: "zh-MO",

	// Língua Inglesa
	US: "en-US",
	GB: "en-GB",
	CA: "en-CA",
	AU: "en-AU",
	NZ: "en-NZ",
	IE: "en-IE",
	ZA: "en-ZA",
	IN: "en-IN",
	PK: "en-PK",
	BD: "bn-BD",
	NG: "en-NG",
	KE: "en-KE",
	GH: "en-GH",
	UG: "en-UG",
	TZ: "en-TZ",
	ZW: "en-ZW",
	JM: "en-JM",
	TT: "en-TT",
	BB: "en-BB",
	BS: "en-BS",
	BZ: "en-BZ",
	GY: "en-GY",
	MT: "en-MT",
	SG: "en-SG",
	PH: "en-PH",
	MY: "en-MY",
	HK: "en-HK",
	BW: "en-BW",
	CM: "en-CM",
	ET: "am-ET",
	GM: "en-GM",
	LR: "en-LR",
	MW: "en-MW",
	MU: "en-MU",
	NA: "en-NA",
	RW: "rw-RW",
	SC: "en-SC",
	SL: "en-SL",
	SS: "en-SS",
	SD: "ar-SD",
	SZ: "en-SZ",
	ZM: "en-ZM",
	AG: "en-AG",
	DM: "en-DM",
	GD: "en-GD",
	KN: "en-KN",
	LC: "en-LC",
	VC: "en-VC",
	FJ: "en-FJ",
	PG: "en-PG",
	WS: "en-WS",
	TO: "to-TO",
	VU: "bi-VU",
	SB: "en-SB",
	LK: "si-LK",
	MM: "my-MM",
	NP: "ne-NP",
	BN: "ms-BN",

	// Língua Espanhola
	ES: "es-ES",
	MX: "es-MX",
	AR: "es-AR",
	CO: "es-CO",
	PE: "es-PE",
	VE: "es-VE",
	CL: "es-CL",
	EC: "es-EC",
	GT: "es-GT",
	CU: "es-CU",
	BO: "es-BO",
	DO: "es-DO",
	HN: "es-HN",
	PY: "es-PY",
	NI: "es-NI",
	SV: "es-SV",
	CR: "es-CR",
	PA: "es-PA",
	UY: "es-UY",
	PR: "es-PR",
	GI: "en-GI",

	// Outros
	FR: "fr-FR",
	DE: "de-DE",
	IT: "it-IT",
	JP: "ja-JP",
	CN: "zh-CN",
	AE: "ar-AE",
};

/**
 * Mapeamento de país (ISO 3166-1 alpha-2) para código de moeda ISO 4217.
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
	// Língua Portuguesa
	BR: "BRL",
	PT: "EUR",
	AO: "AOA",
	MZ: "MZN",
	GW: "XOF",
	CV: "CVE",
	ST: "STN",
	GQ: "XAF",
	TL: "USD",
	MO: "MOP",

	// Língua Inglesa
	US: "USD",
	GB: "GBP",
	CA: "CAD",
	AU: "AUD",
	NZ: "NZD",
	IE: "EUR",
	ZA: "ZAR",
	IN: "INR",
	PK: "PKR",
	BD: "BDT",
	NG: "NGN",
	KE: "KES",
	GH: "GHS",
	UG: "UGX",
	TZ: "TZS",
	ZW: "ZWL",
	JM: "JMD",
	TT: "TTD",
	BB: "BBD",
	BS: "BSD",
	BZ: "BZD",
	GY: "GYD",
	MT: "EUR",
	SG: "SGD",
	PH: "PHP",
	MY: "MYR",
	HK: "HKD",
	BW: "BWP",
	CM: "XAF",
	ET: "ETB",
	GM: "GMD",
	LR: "LRD",
	MW: "MWK",
	MU: "MUR",
	NA: "NAD",
	RW: "RWF",
	SC: "SCR",
	SL: "SLL",
	SS: "SSP",
	SD: "SDG",
	SZ: "SZL",
	ZM: "ZMW",
	AG: "XCD",
	DM: "XCD",
	GD: "XCD",
	KN: "XCD",
	LC: "XCD",
	VC: "XCD",
	FJ: "FJD",
	PG: "PGK",
	WS: "WST",
	TO: "TOP",
	VU: "VUV",
	SB: "SBD",
	LK: "LKR",
	MM: "MMK",
	NP: "NPR",
	BN: "BND",

	// Língua Espanhola
	ES: "EUR",
	MX: "MXN",
	AR: "ARS",
	CO: "COP",
	PE: "PEN",
	VE: "VES",
	CL: "CLP",
	EC: "USD",
	GT: "GTQ",
	CU: "CUP",
	BO: "BOB",
	DO: "DOP",
	HN: "HNL",
	PY: "PYG",
	NI: "NIO",
	SV: "USD",
	CR: "CRC",
	PA: "PAB",
	UY: "UYU",
	PR: "USD",
	GI: "GIP",

	// Outros
	FR: "EUR",
	DE: "EUR",
	IT: "EUR",
	JP: "JPY",
	CN: "CNY",
	AE: "AED",
};

/**
 * Obtém timezone padrão para um país.
 * @returns Timezone IANA (ex: "America/Sao_Paulo") ou null se não encontrado
 */
export const getCountryTimezone = (countryCode: string): string | null => {
	return COUNTRY_TIMEZONE_MAP[countryCode.toUpperCase()] ?? null;
};

/**
 * Obtém locale padrão para um país.
 * @returns Locale BCP 47 (ex: "pt-BR") ou null se não encontrado
 */
export const getCountryLocale = (countryCode: string): string | null => {
	return COUNTRY_LOCALE_MAP[countryCode.toUpperCase()] ?? null;
};

/**
 * Obtém moeda padrão para um país.
 * @returns Código de moeda ISO 4217 (ex: "BRL") ou null se não encontrado
 */
export const getCountryCurrency = (countryCode: string): string | null => {
	return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? null;
};
