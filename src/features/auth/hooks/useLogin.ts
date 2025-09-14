"use client";

import { useMutation } from "@tanstack/react-query";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    onboardingCompleted: boolean;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
};

// Função de login que seria conectada ao Supabase posteriormente
const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  // Simulação de delay de API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulação de validação
  if (
    credentials.email === "teste@teste.com" &&
    credentials.password === "123456Ab@"
  ) {
    return {
      user: {
        id: "user-123",
        email: credentials.email,
        onboardingCompleted: true,
      },
      session: {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
      },
    };
  }

  throw new Error("Credenciais inválidas");
};

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (_data: LoginResponse) => {},
    onError: (_error: Error) => {},
  });
}
