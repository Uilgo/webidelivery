/**
 * Formatadores de endereços brasileiros.
 */

import { formatCEP } from "~~/shared/utils/formatters/formatar-cep";

export interface EnderecoCompleto {
	logradouro: string;
	numero?: string;
	complemento?: string;
	bairro: string;
	cidade: string;
	estado: string;
	cep: string;
}

/**
 * Formata endereço completo em uma linha.
 *
 * @example
 * formatAddress({ logradouro: 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01001000' })
 * // 'Rua das Flores, 123 - Centro, São Paulo - SP, 01001-000'
 */
export const formatAddress = (endereco: EnderecoCompleto): string => {
	const parts: string[] = [];

	if (endereco.logradouro) {
		let rua = endereco.logradouro;
		if (endereco.numero) rua += `, ${endereco.numero}`;
		parts.push(rua);
	}

	if (endereco.complemento) parts.push(endereco.complemento);
	if (endereco.bairro) parts.push(endereco.bairro);

	if (endereco.cidade && endereco.estado) {
		parts.push(`${endereco.cidade} - ${endereco.estado}`);
	} else if (endereco.cidade) {
		parts.push(endereco.cidade);
	}

	if (endereco.cep) {
		const cepFormatado = formatCEP(endereco.cep);
		if (cepFormatado) parts.push(cepFormatado);
	}

	return parts.join(", ");
};

/**
 * Formata endereço em múltiplas linhas.
 *
 * @example
 * formatAddressMultiline({...})
 * // ['Rua das Flores, 123', 'Centro', 'São Paulo - SP', '01001-000']
 */
export const formatAddressMultiline = (endereco: EnderecoCompleto): string[] => {
	const lines: string[] = [];

	if (endereco.logradouro) {
		let linha1 = endereco.logradouro;
		if (endereco.numero) linha1 += `, ${endereco.numero}`;
		if (endereco.complemento) linha1 += ` - ${endereco.complemento}`;
		lines.push(linha1);
	}

	if (endereco.bairro) lines.push(endereco.bairro);

	if (endereco.cidade && endereco.estado) {
		lines.push(`${endereco.cidade} - ${endereco.estado}`);
	}

	if (endereco.cep) {
		const cepFormatado = formatCEP(endereco.cep);
		if (cepFormatado) lines.push(cepFormatado);
	}

	return lines;
};

/**
 * Formata endereço resumido (apenas rua e número).
 *
 * @example
 * formatAddressShort({...}) // 'Rua das Flores, 123'
 */
export const formatAddressShort = (endereco: EnderecoCompleto): string => {
	if (!endereco.logradouro) return "";
	let address = endereco.logradouro;
	if (endereco.numero) address += `, ${endereco.numero}`;
	return address;
};

/**
 * Formata cidade e estado.
 *
 * @example
 * formatCityState('São Paulo', 'SP') // 'São Paulo - SP'
 */
export const formatCityState = (cidade: string, estado: string): string => {
	if (!cidade || !estado) return "";
	return `${cidade} - ${estado}`;
};

/** Abreviações de tipos de logradouro */
const LOGRADOURO_ABBREVIATIONS: Record<string, string> = {
	Rua: "R.",
	Avenida: "Av.",
	Travessa: "Tv.",
	Alameda: "Al.",
	Praça: "Pç.",
	Rodovia: "Rod.",
	Estrada: "Est.",
	Viela: "Vl.",
	Largo: "Lg.",
};

/**
 * Abrevia tipo de logradouro.
 *
 * @example
 * abbreviateLogradouro('Rua das Flores') // 'R. das Flores'
 */
export const abbreviateLogradouro = (logradouro: string): string => {
	if (!logradouro) return "";
	for (const [full, abbr] of Object.entries(LOGRADOURO_ABBREVIATIONS)) {
		if (logradouro.startsWith(full)) return logradouro.replace(full, abbr);
	}
	return logradouro;
};
