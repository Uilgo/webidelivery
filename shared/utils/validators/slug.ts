/**
 * 📌 Validador de Slug
 *
 * Valida slugs (URLs amigáveis) seguindo as regras do sistema.
 * Regras: apenas letras minúsculas, números e hífens; começa com letra;
 * sem hífens consecutivos; tamanho entre 3 e 50 caracteres.
 */

/**
 * Valida se um slug é válido
 *
 * @param slug - Slug a ser validado
 * @returns true se o slug é válido
 *
 * @example
 * isValidSlug('pizzaria-do-joao') // true
 * isValidSlug('123-slug') // false (não começa com letra)
 * isValidSlug('slug--duplo') // false (hífens consecutivos)
 * isValidSlug('ab') // false (menos de 3 caracteres)
 */
export const isValidSlug = (slug: string): boolean => {
	if (!slug || typeof slug !== "string") return false;
	if (slug.length < 3 || slug.length > 50) return false;
	if (!/^[a-z]/.test(slug)) return false;
	if (!/^[a-z0-9-]+$/.test(slug)) return false;
	if (/--/.test(slug)) return false;
	if (/-$/.test(slug)) return false;

	return true;
};

/**
 * Valida se slug está disponível (não existe na lista)
 *
 * @param slug - Slug a ser validado
 * @param existingList - Array de slugs já existentes
 * @returns true se está disponível
 *
 * @example
 * isSlugAvailable('novo-slug', ['slug-existente']) // true
 * isSlugAvailable('slug-existente', ['slug-existente']) // false
 */
export const isSlugAvailable = (slug: string, existingList: string[]): boolean => {
	return !existingList.includes(slug);
};

/**
 * Valida tamanho do slug
 *
 * @param slug - Slug a ser validado
 * @param minLen - Tamanho mínimo (padrão: 3)
 * @param maxLen - Tamanho máximo (padrão: 50)
 * @returns true se o tamanho é válido
 */
export const isValidSlugLength = (
	slug: string,
	minLen: number = 3,
	maxLen: number = 50,
): boolean => {
	return slug.length >= minLen && slug.length <= maxLen;
};
