/**
 * 📌 Formatador de Telefone
 *
 * Funções para formatar e mascarar telefones brasileiros (fixo e celular).
 */

/**
 * Remove formatação do telefone, mantendo apenas dígitos
 *
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone limpo (apenas números)
 *
 * @example
 * parsePhone('(11) 99988-7766') // '11999887766'
 */
export const parsePhone = (phone: string): string => {
	if (!phone || typeof phone !== "string") return "";
	return phone.replace(/\D/g, "");
};

/**
 * Formata telefone no padrão brasileiro
 * (XX) XXXX-XXXX para fixo | (XX) XXXXX-XXXX para celular
 *
 * @param phone - Telefone sem formatação (10 ou 11 dígitos)
 * @returns Telefone formatado ou string vazia se inválido
 *
 * @example
 * formatPhone('1133334444') // '(11) 3333-4444'
 * formatPhone('11999887766') // '(11) 99988-7766'
 */
export const formatPhone = (phone: string): string => {
	const phoneLimpo = parsePhone(phone);

	if (phoneLimpo.length === 10) {
		return `(${phoneLimpo.slice(0, 2)}) ${phoneLimpo.slice(2, 6)}-${phoneLimpo.slice(6)}`;
	}

	if (phoneLimpo.length === 11) {
		return `(${phoneLimpo.slice(0, 2)}) ${phoneLimpo.slice(2, 7)}-${phoneLimpo.slice(7)}`;
	}

	return "";
};

/**
 * Mascara telefone enquanto o usuário digita
 *
 * @param value - Valor atual do input
 * @returns Valor formatado progressivamente
 *
 * @example
 * maskPhone('11999887766') // '(11) 99988-7766'
 */
export const maskPhone = (value: string): string => {
	const phoneTruncado = parsePhone(value).slice(0, 11);

	if (phoneTruncado.length <= 2) return phoneTruncado;
	if (phoneTruncado.length <= 6) return `(${phoneTruncado.slice(0, 2)}) ${phoneTruncado.slice(2)}`;
	if (phoneTruncado.length <= 10) {
		return `(${phoneTruncado.slice(0, 2)}) ${phoneTruncado.slice(2, 6)}-${phoneTruncado.slice(6)}`;
	}

	return `(${phoneTruncado.slice(0, 2)}) ${phoneTruncado.slice(2, 7)}-${phoneTruncado.slice(7)}`;
};

/**
 * Formata telefone no formato internacional (+55)
 *
 * @param phone - Telefone sem formatação
 * @returns Telefone no formato internacional
 *
 * @example
 * formatPhoneInternational('11999887766') // '+55 (11) 99988-7766'
 */
export const formatPhoneInternational = (phone: string): string => {
	const formatted = formatPhone(phone);
	return formatted ? `+55 ${formatted}` : "";
};

/**
 * Formata telefone para WhatsApp (apenas números com DDI)
 *
 * @param phone - Telefone sem formatação
 * @returns Telefone no formato WhatsApp (5511999887766)
 *
 * @example
 * formatPhoneWhatsApp('11999887766') // '5511999887766'
 */
export const formatPhoneWhatsApp = (phone: string): string => {
	const phoneLimpo = parsePhone(phone);
	return phoneLimpo.length >= 10 ? `55${phoneLimpo}` : "";
};
