/**
 * 📌 Formatador de Documentos (CPF/CNPJ)
 *
 * Funções para formatar e mascarar CPF e CNPJ brasileiros.
 */

/**
 * Remove formatação do documento, mantendo apenas dígitos
 *
 * @param document - Documento com ou sem formatação
 * @returns Documento limpo (apenas números)
 *
 * @example
 * parseDocument('123.456.789-00') // '12345678900'
 * parseDocument('12.345.678/0001-00') // '12345678000100'
 */
export const parseDocument = (document: string): string => {
	if (!document || typeof document !== "string") return "";
	return document.replace(/\D/g, "");
};

/**
 * Formata CPF no padrão brasileiro (XXX.XXX.XXX-XX)
 *
 * @param cpf - CPF sem formatação (11 dígitos)
 * @returns CPF formatado ou string vazia se inválido
 *
 * @example
 * formatCPF('12345678900') // '123.456.789-00'
 */
export const formatCPF = (cpf: string): string => {
	const cpfLimpo = parseDocument(cpf);
	if (cpfLimpo.length !== 11) return "";

	return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`;
};

/**
 * Formata CNPJ no padrão brasileiro (XX.XXX.XXX/XXXX-XX)
 *
 * @param cnpj - CNPJ sem formatação (14 dígitos)
 * @returns CNPJ formatado ou string vazia se inválido
 *
 * @example
 * formatCNPJ('12345678000100') // '12.345.678/0001-00'
 */
export const formatCNPJ = (cnpj: string): string => {
	const cnpjLimpo = parseDocument(cnpj);
	if (cnpjLimpo.length !== 14) return "";

	return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8, 12)}-${cnpjLimpo.slice(12)}`;
};

/**
 * Formata documento (CPF ou CNPJ) automaticamente pelo tamanho
 *
 * @param document - Documento sem formatação
 * @returns Documento formatado
 *
 * @example
 * formatDocument('12345678900') // '123.456.789-00'
 * formatDocument('12345678000100') // '12.345.678/0001-00'
 */
export const formatDocument = (document: string): string => {
	const documentLimpo = parseDocument(document);

	if (documentLimpo.length === 11) return formatCPF(documentLimpo);
	if (documentLimpo.length === 14) return formatCNPJ(documentLimpo);

	return "";
};

/**
 * Mascara CPF enquanto o usuário digita
 *
 * @param value - Valor atual do input
 * @returns Valor formatado progressivamente
 *
 * @example
 * maskCPF('12345678900') // '123.456.789-00'
 */
export const maskCPF = (value: string): string => {
	const cpfLimpo = parseDocument(value).slice(0, 11);

	if (cpfLimpo.length <= 3) return cpfLimpo;
	if (cpfLimpo.length <= 6) return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
	if (cpfLimpo.length <= 9)
		return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`;

	return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`;
};

/**
 * Mascara CNPJ enquanto o usuário digita
 *
 * @param value - Valor atual do input
 * @returns Valor formatado progressivamente
 *
 * @example
 * maskCNPJ('12345678000100') // '12.345.678/0001-00'
 */
export const maskCNPJ = (value: string): string => {
	const cnpjLimpo = parseDocument(value).slice(0, 14);

	if (cnpjLimpo.length <= 2) return cnpjLimpo;
	if (cnpjLimpo.length <= 5) return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2)}`;
	if (cnpjLimpo.length <= 8)
		return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5)}`;
	if (cnpjLimpo.length <= 12)
		return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8)}`;

	return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8, 12)}-${cnpjLimpo.slice(12)}`;
};

/**
 * Mascara documento (CPF ou CNPJ) automaticamente
 *
 * @param value - Valor atual do input
 * @returns Valor formatado progressivamente
 *
 * @example
 * maskDocument('12345678900') // '123.456.789-00'
 * maskDocument('12345678000100') // '12.345.678/0001-00'
 */
export const maskDocument = (value: string): string => {
	const documentLimpo = parseDocument(value);
	// Se tem mais de 11 dígitos, trata como CNPJ
	return documentLimpo.length > 11 ? maskCNPJ(documentLimpo) : maskCPF(documentLimpo);
};
