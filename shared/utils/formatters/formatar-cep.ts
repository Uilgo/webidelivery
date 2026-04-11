/**
 * Remove formatação do CEP (deixa apenas números)
 *
 * @param cep - CEP formatado ou não
 * @returns CEP limpo (apenas números)
 *
 * @example
 * parseCEP('01001-000') // '01001000'
 * parseCEP('01001000')  // '01001000'
 * parseCEP('01.001-000') // '01001000'
 */
export const parseCEP = (cep: string): string => {
	return cep.replace(/\D/g, "");
};

/**
 * Formata CEP no padrão brasileiro (00000-000)
 *
 * @param cep - CEP sem formatação (apenas números)
 * @returns CEP formatado
 *
 * @example
 * formatCEP('01001000') // '01001-000'
 * formatCEP('01001')    // '01001'
 */
export const formatCEP = (cep: string): string => {
	const limpo = parseCEP(cep);

	if (limpo.length !== 8) {
		return limpo;
	}

	return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
};

/**
 * Mascara CEP enquanto o usuário digita
 *
 * @param value - Valor atual do input
 * @returns Valor mascarado
 *
 * @example
 * maskCEP('01001')    // '01001'
 * maskCEP('01001000') // '01001-000'
 */
export const maskCEP = (value: string): string => {
	const limpo = parseCEP(value);

	if (limpo.length <= 5) {
		return limpo;
	}

	return `${limpo.slice(0, 5)}-${limpo.slice(5, 8)}`;
};
