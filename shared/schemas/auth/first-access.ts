import { z } from "zod";
import { confirmarSenhaRefine, senhaSchema } from "../common/password";

/**
 * Schema de validação do formulário de primeiro acesso.
 * Usado quando o perfil tem `senha_temporaria = true`.
 * O usuário já está autenticado — apenas define uma nova senha permanente.
 */
export const firstAccessSchema = z
	.object({
		senha: senhaSchema,
		confirmarSenha: z.string().min(1, "Confirme sua nova senha"),
	})
	.superRefine(confirmarSenhaRefine);

export type FirstAccessForm = z.infer<typeof firstAccessSchema>;
