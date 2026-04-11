import { z } from "zod";
import { confirmarSenhaRefine, senhaSchema } from "../common/password";

/**
 * Schema de validação do formulário de redefinição de senha.
 * Usado após clicar no link de recuperação enviado por e-mail (fluxo PKCE).
 * Campos: nova senha + confirmação.
 */
export const resetPasswordSchema = z
	.object({
		senha: senhaSchema,
		confirmarSenha: z.string().min(1, "Confirme sua nova senha"),
	})
	.superRefine(confirmarSenhaRefine);

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
