/**
 * Utilitários de preferências por país.
 * Gera e atualiza preferências baseadas no país do usuário.
 */

import {
	getCountryCurrency,
	getCountryLocale,
	getCountryTimezone,
} from "~~/shared/constants/countries";
import { DEFAULT_PREFERENCES } from "~~/shared/constants/preferences";
import type { PreferenciasUsuario } from "~~/shared/types/database/core";

/**
 * Gera preferências padrão baseado no país.
 *
 * @example
 * getPreferencesByCountry('BR')
 * // { timezone: 'America/Sao_Paulo', locale: 'pt-BR', currency: 'BRL', ... }
 */
export const getPreferencesByCountry = (countryCode: string): PreferenciasUsuario => {
	const timezone = getCountryTimezone(countryCode);
	const locale = getCountryLocale(countryCode);
	const currency = getCountryCurrency(countryCode);

	return {
		...DEFAULT_PREFERENCES,
		timezone: timezone ?? DEFAULT_PREFERENCES.timezone,
		locale: locale ?? DEFAULT_PREFERENCES.locale,
		...(currency && { currency }),
	};
};

/**
 * Atualiza preferências existentes com timezone, locale e moeda do país.
 * Mantém todas as outras preferências intactas.
 *
 * @example
 * updatePreferencesWithCountry(userPrefs, 'PT')
 * // Mantém outras preferências, atualiza apenas timezone/locale/currency
 */
export const updatePreferencesWithCountry = (
	currentPreferences: PreferenciasUsuario,
	countryCode: string,
): PreferenciasUsuario => {
	const timezone = getCountryTimezone(countryCode);
	const locale = getCountryLocale(countryCode);
	const currency = getCountryCurrency(countryCode);

	return {
		...currentPreferences,
		...(timezone && { timezone }),
		...(locale && { locale }),
		...(currency && { currency }),
	};
};
