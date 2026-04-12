/**
 * 📌 Formatador de Números
 *
 * Funções para formatar números diversos (compacto, bytes, ordinal, etc).
 */

/**
 * Formata número com separador de milhares (pt-BR)
 *
 * @example
 * formatNumber(1234567) // '1.234.567'
 * formatNumber(1234.56) // '1.234,56'
 */
export const formatNumber = (value: number): string => {
	return new Intl.NumberFormat("pt-BR").format(value);
};

/**
 * Formata número com casas decimais fixas
 *
 * @example
 * formatDecimal(1234.5, 2) // '1.234,50'
 */
export const formatDecimal = (value: number, decimalPlaces: number = 2): string => {
	return new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces,
	}).format(value);
};

/**
 * Formata número compacto (mil, mi, bi)
 *
 * @example
 * formatCompactNumber(1234) // '1,2 mil'
 * formatCompactNumber(1234567) // '1,2 mi'
 */
export const formatCompactNumber = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		notation: "compact",
		compactDisplay: "short",
	}).format(value);
};

/**
 * Formata bytes em formato legível
 *
 * @example
 * formatBytes(1024) // '1 KB'
 * formatBytes(1048576) // '1 MB'
 */
export const formatBytes = (bytes: number, decimalPlaces: number = 2): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPlaces))} ${sizes[i] ?? "TB"}`;
};

/**
 * Formata número ordinal
 *
 * @example
 * formatOrdinal(1) // '1º'
 * formatOrdinal(3) // '3º'
 */
export const formatOrdinal = (value: number): string => `${value}º`;

/**
 * Arredonda número para cima
 *
 * @example
 * roundUp(1.231, 2) // 1.24
 */
export const roundUp = (value: number, decimalPlaces: number = 2): number => {
	const multiplier = Math.pow(10, decimalPlaces);
	return Math.ceil(value * multiplier) / multiplier;
};

/**
 * Arredonda número para baixo
 *
 * @example
 * roundDown(1.239, 2) // 1.23
 */
export const roundDown = (value: number, decimalPlaces: number = 2): number => {
	const multiplier = Math.pow(10, decimalPlaces);
	return Math.floor(value * multiplier) / multiplier;
};

/**
 * Limita número entre min e max
 *
 * @example
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 */
export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
};

/**
 * Calcula porcentagem
 *
 * @example
 * calculatePercentage(1, 4) // 25
 */
export const calculatePercentage = (value: number, total: number): number => {
	if (total === 0) return 0;
	return (value / total) * 100;
};

/**
 * Gera número aleatório entre min e max (inclusivo)
 *
 * @example
 * randomNumber(1, 10) // 7 (exemplo)
 */
export const randomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
