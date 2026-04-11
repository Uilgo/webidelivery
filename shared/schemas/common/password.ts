import { z } from "zod";

/**
 * Schema base de validação de senha do WebiDelivery.
 * Regras: mínimo 8 caracteres, ao menos 1 letra maiúscula e 1 número.
 * Reutilizado em signup, reset-password e first-access.
 */
export const senhaSchema = z
	.string()
	.min(1, "A senha é obrigatória")
	.min(8, "A senha deve ter pelo menos 8 caracteres")
	.regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
	.regex(/[0-9]/, "A senha deve conter ao menos um número");

/**
 * Schema de confirmação de senha — valida se confirmarSenha === senha.
 * Deve ser aplicado no refine/superRefine do schema pai.
 */
export const confirmarSenhaRefine = (
	data: { senha: string; confirmarSenha: string },
	ctx: z.RefinementCtx,
) => {
	if (data.senha !== data.confirmarSenha) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "As senhas não conferem",
			path: ["confirmarSenha"],
		});
	}
};
