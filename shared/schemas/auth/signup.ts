import { z } from "zod";
import { confirmarSenhaRefine, senhaSchema } from "../common/password";

/**
 * Schema de validação do formulário de cadastro (signup).
 * Campos: nome + sobrenome + email + senha + confirmarSenha.
 * Destinado ao fluxo de criação de admin_loja.
 */
export const signupSchema = z
	.object({
		nome: z
			.string()
			.min(1, "O nome é obrigatório")
			.min(2, "O nome deve ter pelo menos 2 caracteres")
			.max(100, "O nome deve ter no máximo 100 caracteres"),

		sobrenome: z
			.string()
			.min(1, "O sobrenome é obrigatório")
			.min(2, "O sobrenome deve ter pelo menos 2 caracteres")
			.max(100, "O sobrenome deve ter no máximo 100 caracteres"),

		email: z.email("Informe um e-mail válido").min(1, "O e-mail é obrigatório"),

		senha: senhaSchema,

		confirmarSenha: z.string().min(1, "Confirme sua senha"),
	})
	.superRefine(confirmarSenhaRefine);

export type SignupForm = z.infer<typeof signupSchema>;
