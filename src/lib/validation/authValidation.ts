import { z } from "zod";

// Validação de e-mail com regras específicas do projeto WebiDelivery
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) return "E-mail é obrigatório";
  if (!emailRegex.test(email)) return "Formato de e-mail inválido";

  return null;
};

// Validação de senha com critérios rigorosos conforme regras do projeto
export const validatePassword = (password: string): string | null => {
  if (!password) return "Senha é obrigatória";
  if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
  if (!/[a-zA-Z]/.test(password)) return "Senha deve conter pelo menos 1 letra";
  if (!/\d/.test(password)) return "Senha deve conter pelo menos 1 número";
  if (!/[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Senha deve conter pelo menos 1 caractere especial";
  }

  return null;
};

// Validação de confirmação de senha
export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): string | null => {
  if (password !== confirmation) return "As senhas não coincidem";
  return null;
};

// Verificação de unicidade de e-mail via API
export const checkEmailUnique = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase() }),
    });

    const { exists } = await response.json();
    return !exists;
  } catch {
    // Em caso de erro na API, assumimos que o e-mail está disponível
    return true;
  }
};

// Schema Zod para e-mail reutilizável
export const emailSchema = z
  .string()
  .min(1, "E-mail é obrigatório")
  .email("Formato de e-mail inválido");

// Schema Zod para senha reutilizável com validação customizada
export const passwordSchema = z
  .string()
  .min(1, "Senha é obrigatória")
  .superRefine((value, ctx) => {
    const error = validatePassword(value);
    if (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error,
      });
    }
  });

// Schema para formulários com confirmação de senha
export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    const error = validatePasswordConfirmation(password, confirmPassword);
    if (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: error,
      });
    }
  });
