/**
 * 📌 Validador de Email
 *
 * Valida endereços de email seguindo RFC 5322.
 */

/**
 * Valida se um email é válido
 *
 * @param email - Email a ser validado
 * @returns true se o email é válido
 *
 * @example
 * isValidEmail('usuario@exemplo.com') // true
 * isValidEmail('usuario+tag@exemplo.com.br') // true
 * isValidEmail('usuario@exemplo') // false
 */
export const isValidEmail = (email: string): boolean => {
	if (!email || typeof email !== "string") return false;

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) return false;

	const [localPart, domain] = email.split("@");

	if (!localPart || !domain) return false;
	if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
	if (localPart.includes("..")) return false;
	if (domain.startsWith("-") || domain.endsWith("-")) return false;
	if (!domain.includes(".")) return false;

	return true;
};

/**
 * Normaliza email (lowercase e trim)
 *
 * @param email - Email a ser normalizado
 * @returns Email normalizado
 *
 * @example
 * normalizeEmail('  Usuario@Exemplo.COM  ') // 'usuario@exemplo.com'
 */
export const normalizeEmail = (email: string): string => {
	if (!email || typeof email !== "string") return "";
	return email.trim().toLowerCase();
};

/**
 * Valida se email pertence a um domínio específico
 *
 * @param email - Email a ser validado
 * @param domain - Domínio permitido
 * @returns true se o email é do domínio
 *
 * @example
 * isEmailFromDomain('usuario@empresa.com', 'empresa.com') // true
 */
export const isEmailFromDomain = (email: string, domain: string): boolean => {
	if (!isValidEmail(email)) return false;

	const emailDomain = email.split("@")[1];
	if (!emailDomain) return false;

	return emailDomain.toLowerCase() === domain.toLowerCase();
};

/**
 * Extrai domínio do email
 *
 * @param email - Email
 * @returns Domínio do email ou string vazia se inválido
 *
 * @example
 * getEmailDomain('usuario@exemplo.com') // 'exemplo.com'
 */
export const getEmailDomain = (email: string): string => {
	if (!isValidEmail(email)) return "";
	return email.split("@")[1] ?? "";
};
