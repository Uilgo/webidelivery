/**
 * 📌 Validador de Documentos (CPF/CNPJ)
 *
 * Valida CPF e CNPJ brasileiros com verificação de dígitos verificadores.
 */

/**
 * Valida CPF brasileiro
 *
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se o CPF é válido
 *
 * @example
 * isValidCPF('123.456.789-00') // false (dígitos inválidos)
 * isValidCPF('111.111.111-11') // false (sequência igual)
 */
export const isValidCPF = (cpf: string): boolean => {
	if (!cpf || typeof cpf !== "string") return false;

	const cpfLimpo = cpf.replace(/\D/g, "");

	if (cpfLimpo.length !== 11) return false;
	if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

	let soma = 0;
	let resto: number;

	for (let i = 1; i <= 9; i++) {
		soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (11 - i);
	}

	resto = (soma * 10) % 11;
	if (resto === 10 || resto === 11) resto = 0;
	if (resto !== parseInt(cpfLimpo.substring(9, 10), 10)) return false;

	soma = 0;

	for (let i = 1; i <= 10; i++) {
		soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (12 - i);
	}

	resto = (soma * 10) % 11;
	if (resto === 10 || resto === 11) resto = 0;
	if (resto !== parseInt(cpfLimpo.substring(10, 11), 10)) return false;

	return true;
};

/**
 * Valida CNPJ brasileiro
 *
 * @param cnpj - CNPJ a ser validado (com ou sem formatação)
 * @returns true se o CNPJ é válido
 *
 * @example
 * isValidCNPJ('12.345.678/0001-00') // false (dígitos inválidos)
 * isValidCNPJ('11.111.111/1111-11') // false (sequência igual)
 */
export const isValidCNPJ = (cnpj: string): boolean => {
	if (!cnpj || typeof cnpj !== "string") return false;

	const cnpjLimpo = cnpj.replace(/\D/g, "");

	if (cnpjLimpo.length !== 14) return false;
	if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

	let tamanho = cnpjLimpo.length - 2;
	let numeros = cnpjLimpo.substring(0, tamanho);
	const digitos = cnpjLimpo.substring(tamanho);
	let soma = 0;
	let pos = tamanho - 7;

	for (let i = tamanho; i >= 1; i--) {
		soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
		if (pos < 2) pos = 9;
	}

	let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
	if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

	tamanho = tamanho + 1;
	numeros = cnpjLimpo.substring(0, tamanho);
	soma = 0;
	pos = tamanho - 7;

	for (let i = tamanho; i >= 1; i--) {
		soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
		if (pos < 2) pos = 9;
	}

	resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
	if (resultado !== parseInt(digitos.charAt(1), 10)) return false;

	return true;
};

/**
 * Valida documento (CPF ou CNPJ) automaticamente pelo tamanho
 *
 * @param document - Documento a ser validado
 * @returns true se o documento é válido
 *
 * @example
 * isValidDocument('123.456.789-00') // valida como CPF
 * isValidDocument('12.345.678/0001-00') // valida como CNPJ
 */
export const isValidDocument = (document: string): boolean => {
	const documentLimpo = document.replace(/\D/g, "");

	if (documentLimpo.length === 11) return isValidCPF(documentLimpo);
	if (documentLimpo.length === 14) return isValidCNPJ(documentLimpo);

	return false;
};
