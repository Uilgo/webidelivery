"use client";

import { useMutation } from "@tanstack/react-query";

export type SignupData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupResponse = {
  user: {
    id: string;
    email: string;
    onboardingCompleted: boolean;
  };
  message: string;
};

// Função de cadastro que seria conectada ao Supabase posteriormente
const signupUser = async (data: SignupData): Promise<SignupResponse> => {
  // Simulação de delay de API
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Simulação de validação de e-mail único
  if (data.email === "existente@teste.com") {
    throw new Error("E-mail já cadastrado");
  }

  return {
    user: {
      id: "new-user-123",
      email: data.email,
      onboardingCompleted: false,
    },
    message: "Cadastro realizado com sucesso",
  };
};

export function useSignup() {
  return useMutation({
    mutationFn: signupUser,
    onSuccess: (_data: SignupResponse) => {},
    onError: (_error: Error) => {},
  });
}
