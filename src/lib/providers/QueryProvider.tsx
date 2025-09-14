"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Configuração do QueryClient para o TanStack React Query
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tempo de cache de 5 minutos
        staleTime: 5 * 60 * 1000,
        // Retry automático em caso de erro
        retry: 1,
        // Refetch automático ao focar na janela
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Retry de mutações em caso de erro de rede
        retry: 1,
      },
    },
  });
}

// Provider do TanStack React Query para toda a aplicação
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Cria uma nova instância do QueryClient por sessão
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
