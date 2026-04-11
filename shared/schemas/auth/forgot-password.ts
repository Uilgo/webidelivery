import { z } from "zod";

/**
 * Schema de validação do formulário de recuperação de senha.
 * Campo: email para envio do link de redefinição.
 */
export const forgotPasswordSchema = z.object({
	email: z.email("Informe um e-mail válido").min(1, "O e-mail é obrigatório"),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
