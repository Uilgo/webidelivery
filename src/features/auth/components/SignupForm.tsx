"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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
import { useSignup } from "@/features/auth/hooks/useSignup";
import { MESSAGES } from "@/lib/constants/messages";
import {
  emailSchema,
  passwordWithConfirmationSchema,
} from "@/lib/validation/authValidation";

// Schema de cadastro usando schemas compartilhados - seguindo PRD WebiDelivery
const signupSchema = z.object({
  // Campos obrigatórios conforme PRD
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: z
    .string()
    .min(1, "Sobrenome é obrigatório")
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: emailSchema,
  ...passwordWithConfirmationSchema.shape,
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export type SignupFormProps = {
  onSubmit?: (values: SignupFormValues) => Promise<void> | void;
  defaultValues?: Partial<SignupFormValues>;
};

export function SignupForm({ onSubmit, defaultValues }: SignupFormProps) {
  const { mutateAsync: signup, isPending } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      password: "",
      confirmPassword: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const submit = async (values: SignupFormValues) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await signup(values);
        toast.success(MESSAGES.AUTH.REGISTER_SUCCESS);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      if (errorMessage.includes("E-mail já cadastrado")) {
        toast.error(MESSAGES.AUTH.EMAIL_EXISTS);
      } else {
        toast.error("Falha ao criar conta. Tente novamente.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        {/* Nome e Sobrenome na mesma linha */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="given-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sobrenome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Seu sobrenome"
                    autoComplete="family-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* E-mail */}
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

        {/* Senha */}
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
                  autoComplete="new-password"
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

        {/* Confirmar senha */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <InputWithIcon
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  autoComplete="new-password"
                  rightIcon={
                    showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )
                  }
                  onRightIconClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </Form>
  );
}

export default SignupForm;
