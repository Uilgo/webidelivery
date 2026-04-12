/**
 * Tipos de países — usados em selects/dropdowns e na API de países
 */

import type { TCountryCode } from "countries-list";

/** Opção de país para select/dropdown */
export interface CountryOption {
	/** Código ISO 3166-1 alpha-2 (ex: "BR") */
	value: TCountryCode;
	/** Nome do país em inglês (ex: "Brazil") */
	label: string;
	/** URL da bandeira (ex: "https://flagcdn.com/w40/br.png") */
	flag: string;
	/** Nome nativo do país (ex: "Brasil") */
	native: string;
	/** Capital do país (ex: "Brasília") */
	capital: string;
	/** Código(s) de telefone (ex: [55]) */
	phone: number[];
	/** Continente (ex: "SA" para South America) */
	continent: string;
	/** Moedas (ex: ["BRL"]) */
	currencies: string[];
	/** Idiomas (ex: ["pt"]) */
	languages: string[];
}

/** Resposta da API interna de países (server/api/countries) */
export interface CountriesApiResponse {
	countries: CountryOption[];
	source: "local" | "api";
	timestamp: number;
}

/** Dados completos de um país vindos da REST Countries API externa */
export interface RestCountryData {
	name: {
		common: string;
		official: string;
	};
	cca2: string;
	cca3: string;
	flags: {
		png: string;
		svg: string;
	};
	timezones: string[];
	currencies: Record<string, { name: string; symbol: string }>;
	languages: Record<string, string>;
	capital?: string[];
	region: string;
	subregion?: string;
}
