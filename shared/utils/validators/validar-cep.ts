import { parseCEP } from "../formatters/formatar-cep.js";

/**
 * Valida se o CEP é válido (8 dígitos numéricos)
 *
 * @param cep - CEP a ser validado (formatado ou não)
 * @returns true se válido, false caso contrário
 *
 * @example
 * isValidCEP('01001-000') // true
 * isValidCEP('01001000')  // true
 * isValidCEP('0100100')   // false (7 dígitos)
 * isValidCEP('00000000')  // false (todos zeros)
 */
export const isValidCEP = (cep: string): boolean => {
	const limpo = parseCEP(cep);

	// Deve ter exatamente 8 dígitos
	if (limpo.length !== 8) {
		return false;
	}

	// Não pode ser todos zeros
	if (limpo === "00000000") {
		return false;
	}

	// Deve conter apenas números
	if (!/^\d{8}$/.test(limpo)) {
		return false;
	}

	return true;
};

/**
 * Valida CEP e retorna mensagem de erro se inválido
 *
 * @param cep - CEP a ser validado
 * @returns null se válido, mensagem de erro se inválido
 *
 * @example
 * validateCEP('01001-000') // null
 * validateCEP('0100100')   // 'CEP deve conter 8 dígitos'
 */
export const validateCEP = (cep: string): string | null => {
	const limpo = parseCEP(cep);

	if (!limpo) {
		return "CEP é obrigatório";
	}

	if (limpo.length !== 8) {
		return "CEP deve conter 8 dígitos";
	}

	if (limpo === "00000000") {
		return "CEP inválido";
	}

	if (!/^\d{8}$/.test(limpo)) {
		return "CEP deve conter apenas números";
	}

	return null;
};
