/**
 * 📌 Formatador de Chaves PIX
 *
 * Funções para formatar, mascarar e validar chaves PIX brasileiras.
 */

import { formatCNPJ, formatCPF } from "~~/shared/utils/formatters/document";
import { formatPhone } from "~~/shared/utils/formatters/phone";
import { isValidCNPJ, isValidCPF } from "~~/shared/utils/validators/document";
import { isValidEmail } from "~~/shared/utils/validators/email";
import { isValidPhone } from "~~/shared/utils/validators/phone";

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

/**
 * Identifica o tipo de chave PIX
 *
 * @example
 * identifyPixKeyType('12345678900') // 'cpf'
 * identifyPixKeyType('usuario@email.com') // 'email'
 * identifyPixKeyType('123e4567-e89b-12d3-a456-426614174000') // 'random'
 */
export const identifyPixKeyType = (key: string): PixKeyType | null => {
	if (!key || typeof key !== "string") return null;

	const cleanKey = key.replace(/\D/g, "");

	if (cleanKey.length === 11 && /^\d{11}$/.test(cleanKey)) return "cpf";
	if (cleanKey.length === 14 && /^\d{14}$/.test(cleanKey)) return "cnpj";
	if ((cleanKey.length === 10 || cleanKey.length === 11) && /^\d{10,11}$/.test(cleanKey))
		return "phone";
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "email";
	if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return "random";

	return null;
};

/**
 * Formata chave PIX baseado no tipo identificado
 *
 * @example
 * formatPixKey('12345678900') // '123.456.789-00' (CPF)
 * formatPixKey('11999887766') // '(11) 99988-7766' (Telefone)
 */
export const formatPixKey = (key: string): string => {
	const type = identifyPixKeyType(key);
	if (!type) return key;

	switch (type) {
		case "cpf":
			return formatCPF(key);
		case "cnpj":
			return formatCNPJ(key);
		case "phone":
			return formatPhone(key);
		case "email":
			return key.toLowerCase();
		case "random":
			return key.toLowerCase();
		default:
			return key;
	}
};

/**
 * Mascara chave PIX para exibição segura
 *
 * @example
 * maskPixKey('12345678900') // '***.***.789-00'
 * maskPixKey('usuario@email.com') // 'usu***@email.com'
 */
export const maskPixKey = (key: string): string => {
	const type = identifyPixKeyType(key);
	if (!type) return key;

	switch (type) {
		case "cpf": {
			const formatted = formatCPF(key);
			return formatted.replace(/\d(?=\d{2})/g, "*");
		}
		case "cnpj": {
			const formatted = formatCNPJ(key);
			return formatted.replace(/\d(?=\d{2})/g, "*");
		}
		case "phone": {
			const formatted = formatPhone(key);
			return formatted.replace(/\d(?=\d{4})/g, "*");
		}
		case "email": {
			const [local, domain] = key.split("@");
			if (!local || !domain) return key;
			return `${local.slice(0, 3)}***@${domain}`;
		}
		case "random":
			return `${key.slice(0, 8)}...${key.slice(-4)}`;
		default:
			return key;
	}
};

/**
 * Valida chave PIX (tipo + conteúdo)
 *
 * @example
 * isValidPixKey('usuario@email.com') // true
 * isValidPixKey('123') // false
 */
export const isValidPixKey = (key: string): boolean => {
	const type = identifyPixKeyType(key);
	if (!type) return false;

	switch (type) {
		case "cpf":
			return isValidCPF(key);
		case "cnpj":
			return isValidCNPJ(key);
		case "phone":
			return isValidPhone(key);
		case "email":
			return isValidEmail(key);
		case "random":
			return true;
		default:
			return false;
	}
};

/**
 * Gera chave PIX aleatória (UUID v4)
 *
 * @example
 * generateRandomPixKey() // '123e4567-e89b-12d3-a456-426614174000'
 */
export const generateRandomPixKey = (): string => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
