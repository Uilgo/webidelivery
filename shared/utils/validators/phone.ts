/**
 * 📌 Validador de Telefone
 *
 * Valida telefones brasileiros (fixo e celular).
 */

/**
 * Valida se um telefone brasileiro é válido
 *
 * @param phone - Telefone a ser validado (com ou sem formatação)
 * @returns true se o telefone é válido
 *
 * @example
 * isValidPhone('(11) 3333-4444') // true (fixo)
 * isValidPhone('(11) 99988-7766') // true (celular)
 * isValidPhone('123') // false
 */
export const isValidPhone = (phone: string): boolean => {
	if (!phone || typeof phone !== "string") return false;

	const phoneLimpo = phone.replace(/\D/g, "");

	if (phoneLimpo.length !== 10 && phoneLimpo.length !== 11) return false;
	if (/^(\d)\1+$/.test(phoneLimpo)) return false;

	const ddd = parseInt(phoneLimpo.slice(0, 2), 10);
	if (ddd < 11 || ddd > 99) return false;

	// Celular (11 dígitos) deve começar com 9
	if (phoneLimpo.length === 11 && phoneLimpo[2] !== "9") return false;

	return true;
};

/**
 * Valida se é um telefone celular (11 dígitos, começa com 9)
 *
 * @param phone - Telefone a ser validado
 * @returns true se é celular
 *
 * @example
 * isCelular('11999887766') // true
 * isCelular('1133334444') // false
 */
export const isCelular = (phone: string): boolean => {
	const phoneLimpo = phone.replace(/\D/g, "");
	return phoneLimpo.length === 11 && phoneLimpo[2] === "9";
};

/**
 * Valida se é um telefone fixo (10 dígitos)
 *
 * @param phone - Telefone a ser validado
 * @returns true se é fixo
 *
 * @example
 * isFixo('1133334444') // true
 * isFixo('11999887766') // false
 */
export const isFixo = (phone: string): boolean => {
	const phoneLimpo = phone.replace(/\D/g, "");
	return phoneLimpo.length === 10;
};
