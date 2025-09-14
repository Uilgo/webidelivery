"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { MESSAGES } from "@/lib/constants/messages";
import { emailSchema } from "@/lib/validation/authValidation";

// Schema simples usando o schema compartilhado
const forgotSchema = z.object({
  email: emailSchema,
});

export type ForgotFormValues = z.infer<typeof forgotSchema>;

export type ForgotFormProps = {
  onSubmit?: (values: ForgotFormValues) => Promise<void> | void;
  defaultValues?: Partial<ForgotFormValues>;
};

export function ForgotForm({ onSubmit, defaultValues }: ForgotFormProps) {
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  const submit = async (values: ForgotFormValues) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await forgotPassword(values);
        toast.success(MESSAGES.AUTH.FORGOT_PASSWORD_SENT);
      }
    } catch (_error) {
      toast.error("Falha ao enviar instruções. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Enviando..." : "Enviar instruções"}
        </Button>
      </form>
    </Form>
  );
}

export default ForgotForm;
