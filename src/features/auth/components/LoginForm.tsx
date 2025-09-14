"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputWithIcon } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { MESSAGES } from "@/lib/constants/messages";
import { emailSchema, passwordSchema } from "@/lib/validation/authValidation";

// Schema de validação usando os schemas compartilhados
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginFormProps = {
  // Callback opcional para submissão customizada
  onSubmit?: (values: LoginFormValues) => Promise<void> | void;
  // Valores iniciais opcionais
  defaultValues?: Partial<LoginFormValues>;
};

export function LoginForm({ onSubmit, defaultValues }: LoginFormProps) {
  const { mutateAsync: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // useForm com zodResolver e integração com shadcn/ui Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  // Handler de submissão integrado com useLogin e toasts
  const submit = async (values: LoginFormValues) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await login(values);
        toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      if (errorMessage.includes("Credenciais inválidas")) {
        toast.error(MESSAGES.AUTH.INVALID_CREDENTIALS);
      } else {
        toast.error("Falha ao realizar login. Tente novamente.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        {/* Campo de E-mail */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de Senha */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <InputWithIcon
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  autoComplete="current-password"
                  rightIcon={
                    showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {!form.formState.errors.password && (
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, com letra, número e caractere especial.
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Botão de ação */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>

        {/* Link "Esqueci minha senha" - posicionado após o botão */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.replace("/auth?mode=forgot-password")}
            className="text-sm text-muted-foreground hover:text-blue-600 underline transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>
      </form>
    </Form>
  );
}

export default LoginForm;
