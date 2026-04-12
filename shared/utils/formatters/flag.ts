/**
 * Utilitários de bandeiras de países.
 * Converte código ISO do país para emoji de bandeira e URLs de imagem.
 *
 * Nota: a lib countries-list já exporta getEmojiFlag nativamente,
 * mas mantemos getFlagEmoji como wrapper para consistência da API interna.
 */

import { getEmojiFlag } from "countries-list";
import type { TCountryCode } from "countries-list";

/**
 * Converte código ISO 3166-1 alpha-2 para emoji de bandeira.
 * Usa a função nativa da lib countries-list.
 *
 * @example
 * getFlagEmoji('BR') // "🇧🇷"
 * getFlagEmoji('US') // "🇺🇸"
 */
export const getFlagEmoji = (countryCode: string | TCountryCode): string => {
	if (!countryCode || countryCode.length !== 2) return "🏳️";
	try {
		return getEmojiFlag(countryCode.toUpperCase() as TCountryCode);
	} catch {
		return "🏳️";
	}
};

/**
 * Obtém URL da imagem PNG da bandeira via flagcdn.com.
 *
 * @example
 * getFlagImageUrl('BR', 'w40') // "https://flagcdn.com/w40/br.png"
 */
export const getFlagImageUrl = (
	countryCode: string | TCountryCode,
	size: "w20" | "w40" | "w80" | "w160" | "w320" | "w640" | "w1280" | "w2560" = "w40",
): string => {
	return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`;
};

/**
 * Obtém URL da imagem SVG da bandeira via flagcdn.com.
 *
 * @example
 * getFlagSvgUrl('BR') // "https://flagcdn.com/br.svg"
 */
export const getFlagSvgUrl = (countryCode: string | TCountryCode): string => {
	return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
};

/**
 * Verifica se o navegador suporta emojis de bandeiras.
 * Apenas no cliente — retorna false no servidor.
 *
 * Usa globalThis para evitar referência direta a `document`,
 * pois shared/ é compilado também pelo tsconfig do servidor (sem lib: dom).
 */
export const supportsFlagEmojis = (): boolean => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	if (typeof g.document === "undefined") return false;
	try {
		const canvas = g.document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return false;
		ctx.fillText("🇧🇷", 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		return (imageData.data as number[]).some((pixel: number) => pixel !== 0);
	} catch {
		return false;
	}
};
