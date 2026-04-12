/**
 * _zod-error-handler
 *
 * Converte erros de validação Zod em respostas HTTP 400 seguras.
 * Nunca vaza detalhes internos — retorna apenas mensagens de campo.
 */

import type { z } from "zod";

export interface ValidationError {
	field: string;
	message: string;
}

/**
 * Valida o body de um request contra um schema Zod.
 * Lança createError(400) com os erros de validação se inválido.
 *
 * @example
 * const data = await validateBody(event, loginSchema)
 */
export async function validateBody<T>(
	event: Parameters<typeof readBody>[0],
	schema: z.ZodSchema<T>,
): Promise<T> {
	const body: unknown = await readBody(event);
	const result = schema.safeParse(body);

	if (!result.success) {
		const errors: ValidationError[] = result.error.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));

		throw createError({
			statusCode: 400,
			statusMessage: "Dados inválidos",
			data: { errors },
		});
	}

	return result.data;
}

/**
 * Valida query params contra um schema Zod.
 */
export function validateQuery<T>(event: Parameters<typeof getQuery>[0], schema: z.ZodSchema<T>): T {
	const query = getQuery(event);
	const result = schema.safeParse(query);

	if (!result.success) {
		const errors: ValidationError[] = result.error.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));

		throw createError({
			statusCode: 400,
			statusMessage: "Parâmetros inválidos",
			data: { errors },
		});
	}

	return result.data;
}
