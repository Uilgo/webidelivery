/**
 * Formatadores de moeda (Real brasileiro — BRL).
 */

/**
 * Formata número como moeda brasileira (R$).
 *
 * @example
 * formatCurrency(1234.56) // 'R$ 1.234,56'
 * formatCurrency(1234.56, false) // '1.234,56'
 */
export const formatCurrency = (value: number, showSymbol: boolean = true): string => {
	const formatted = new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);

	return showSymbol ? formatted : formatted.replace("R$", "").trim();
};

/**
 * Converte centavos para reais formatado.
 *
 * @example
 * formatCentsToReais(12345) // 'R$ 123,45'
 */
export const formatCentsToReais = (cents: number, showSymbol: boolean = true): string => {
	return formatCurrency(cents / 100, showSymbol);
};

/**
 * Converte string formatada para número.
 *
 * @example
 * parseCurrency('R$ 1.234,56') // 1234.56
 */
export const parseCurrency = (formatted: string): number => {
	if (!formatted || typeof formatted !== "string") return 0;
	const cleaned = formatted.replace(/[^\d,]/g, "");
	const normalized = cleaned.replace(",", ".");
	return parseFloat(normalized) || 0;
};

/**
 * Formata porcentagem.
 *
 * @example
 * formatPercentage(0.15) // '15%'
 * formatPercentage(0.1567, 2) // '15,67%'
 */
export const formatPercentage = (value: number, fractionDigits: number = 0): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "percent",
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value);
};

/**
 * Formata desconto (valor ou porcentagem).
 *
 * @example
 * formatDiscount(10, 'percentage') // '10% OFF'
 * formatDiscount(50, 'value') // 'R$ 50,00 OFF'
 */
export const formatDiscount = (value: number, type: "percentage" | "value"): string => {
	if (type === "percentage") return `${value}% OFF`;
	return `${formatCurrency(value)} OFF`;
};
