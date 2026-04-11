import { z } from "zod";

/**
 * Schema de validação do formulário de login.
 * Campos: email + senha.
 */
export const loginSchema = z.object({
	email: z.email("Informe um e-mail válido").min(1, "O e-mail é obrigatório"),
	senha: z.string().min(1, "A senha é obrigatória"),
});

export type LoginForm = z.infer<typeof loginSchema>;
