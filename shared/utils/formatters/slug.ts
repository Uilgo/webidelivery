/**
 * 📌 Formatador de Slug
 *
 * Funções para criar e validar slugs (URLs amigáveis).
 */

/**
 * Converte texto em slug (URL amigável)
 *
 * @example
 * createSlug('Pizzaria do João') // 'pizzaria-do-joao'
 * createSlug('Açaí & Cia') // 'acai-e-cia'
 */
export const createSlug = (text: string): string => {
	if (!text || typeof text !== "string") return "";

	return text
		.toString()
		.toLowerCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[àáâãäå]/g, "a")
		.replace(/[èéêë]/g, "e")
		.replace(/[ìíîï]/g, "i")
		.replace(/[òóôõö]/g, "o")
		.replace(/[ùúûü]/g, "u")
		.replace(/[ç]/g, "c")
		.replace(/[ñ]/g, "n")
		.replace(/&/g, "-e-")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s-]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

/**
 * Valida e limpa slug em tempo real (para inputs)
 *
 * @example
 * sanitizeSlug('Pizzaria do João') // 'pizzaria-do-joao'
 */
export const sanitizeSlug = (value: string): string => createSlug(value);

/**
 * Gera slug único adicionando sufixo numérico se necessário
 *
 * @example
 * generateUniqueSlug('pizzaria', ['pizzaria']) // 'pizzaria-2'
 */
export const generateUniqueSlug = (baseSlug: string, slugArray: string[]): string => {
	let slug = baseSlug;
	let counter = 2;

	while (slugArray.includes(slug)) {
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	return slug;
};

/**
 * Trunca slug para tamanho máximo mantendo palavras completas
 *
 * @example
 * truncateSlug('slug-muito-longo-que-precisa-ser-truncado', 20) // 'slug-muito-longo'
 */
export const truncateSlug = (slug: string, maxLen: number = 50): string => {
	if (slug.length <= maxLen) return slug;

	const truncated = slug.slice(0, maxLen);
	const lastHyphen = truncated.lastIndexOf("-");

	return lastHyphen > 0 ? truncated.slice(0, lastHyphen) : truncated;
};
