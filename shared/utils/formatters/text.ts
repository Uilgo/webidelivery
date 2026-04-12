/**
 * 📌 Formatador de Texto
 *
 * Funções utilitárias para formatação de textos.
 */

/**
 * Capitaliza primeira letra de cada palavra
 *
 * @example
 * capitalize('joão da silva') // 'João Da Silva'
 */
export const capitalize = (text: string): string => {
	if (!text || typeof text !== "string") return "";
	return text
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

/**
 * Capitaliza apenas a primeira letra do texto
 *
 * @example
 * capitalizeFirst('joão da silva') // 'João da silva'
 */
export const capitalizeFirst = (text: string): string => {
	if (!text || typeof text !== "string") return "";
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Trunca texto adicionando reticências
 *
 * @example
 * truncate('Texto muito longo que precisa ser truncado', 20) // 'Texto muito longo...'
 */
export const truncate = (text: string, maxLength: number, suffix: string = "..."): string => {
	if (!text || typeof text !== "string") return "";
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Remove acentos do texto
 *
 * @example
 * removeAccents('João José') // 'Joao Jose'
 */
export const removeAccents = (text: string): string => {
	if (!text || typeof text !== "string") return "";
	return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Extrai iniciais do nome
 *
 * @example
 * getInitials('João da Silva') // 'JS'
 * getInitials('Maria Santos Oliveira', 3) // 'MSO'
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
	if (!name || typeof name !== "string") return "";
	return name
		.trim()
		.split(" ")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase())
		.slice(0, maxInitials)
		.join("");
};

/**
 * Pluraliza palavra baseado na quantidade
 *
 * @example
 * pluralize(1, 'item') // '1 item'
 * pluralize(5, 'item', 'itens') // '5 itens'
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
	const word = count === 1 ? singular : (plural ?? `${singular}s`);
	return `${count} ${word}`;
};

/**
 * Limita texto por número de palavras
 *
 * @example
 * limitWords('Este é um texto muito longo', 4) // 'Este é um texto...'
 */
export const limitWords = (text: string, maxWords: number, suffix: string = "..."): string => {
	if (!text || typeof text !== "string") return "";
	const words = text.split(" ");
	if (words.length <= maxWords) return text;
	return words.slice(0, maxWords).join(" ") + suffix;
};

/**
 * Formata nome próprio mantendo preposições em minúsculo
 *
 * @example
 * formatName('JOÃO DA SILVA') // 'João da Silva'
 * formatName('maria dos santos') // 'Maria dos Santos'
 */
export const formatName = (name: string): string => {
	if (!name || typeof name !== "string") return "";
	const prepositions = ["de", "da", "do", "dos", "das", "e"];
	return name
		.toLowerCase()
		.split(" ")
		.map((word) =>
			prepositions.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
		)
		.join(" ");
};

/**
 * Remove espaços extras (múltiplos espaços, tabs, quebras de linha)
 *
 * @example
 * cleanSpaces('Texto   com    espaços') // 'Texto com espaços'
 */
export const cleanSpaces = (text: string): string => {
	if (!text || typeof text !== "string") return "";
	return text.replace(/\s+/g, " ").trim();
};
