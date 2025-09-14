"use client";

import { useMutation } from "@tanstack/react-query";

export type ForgotPasswordData = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  sent: boolean;
};

// Função de recuperação de senha que seria conectada ao Supabase posteriormente
const forgotPassword = async (
  _data: ForgotPasswordData
): Promise<ForgotPasswordResponse> => {
  // Simulação de delay de API
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulação - sempre bem-sucedido por segurança
  return {
    message: "E-mail de recuperação enviado com sucesso",
    sent: true,
  };
};

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_data: ForgotPasswordResponse) => {},
    onError: (_error: Error) => {},
  });
}
