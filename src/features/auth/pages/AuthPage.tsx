"use client";

import { Building2, ChefHat, Globe, Smartphone, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { ForgotForm } from "@/features/auth/components/ForgotForm";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SignupForm } from "@/features/auth/components/SignupForm";

// Tipos permitidos para os modos de autenticação
type AuthMode = "login" | "signup" | "forgot-password";

// Componente interno que usa useSearchParams
function AuthPageContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "login") as AuthMode;

  return (
    <div className="h-screen max-h-[100svh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex overflow-hidden">
      {/* Coluna Esquerda - Informações do Sistema */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 p-12 flex-col justify-center relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-white/5 rounded-full"></div>

        {/* Conteúdo principal */}
        <div className="relative z-10">
          {/* Logo e Nome */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">WebiDelivery</h1>
              <p className="text-blue-100">Sua plataforma de delivery</p>
            </div>
          </div>

          {/* Título Principal */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Transforme seu negócio com delivery inteligente
          </h2>

          {/* Descrição */}
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Crie seu cardápio digital, gerencie pedidos e aumente suas vendas
            com nossa plataforma completa para restaurantes e estabelecimentos.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Cardápio Online
                </h3>
                <p className="text-blue-100">
                  Crie sua própria URL personalizada
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Mobile First
                </h3>
                <p className="text-blue-100">
                  Otimizado para todos os dispositivos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Gestão Completa
                </h3>
                <p className="text-blue-100">
                  Cardápio, promoções e configurações
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Fácil de Usar
                </h3>
                <p className="text-blue-100">Interface intuitiva e moderna</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Área dos Formulários */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 lg:bg-none lg:dark:bg-none overflow-y-auto">
        {/* Toggle de tema no canto superior direito */}
        <div className="absolute top-6 right-6 z-50">
          <ModeToggle />
        </div>

        <div className="w-full max-w-md py-4">
          {/* Card Container */}
          <Card className="shadow-xl border-0 bg-card text-card-foreground">
            <CardHeader className="text-center pb-8">
              {/* Logo mobile (visível apenas em telas pequenas) */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-card-foreground">
                    WebiDelivery
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Sua plataforma de delivery
                  </p>
                </div>
              </div>

              <CardTitle className="text-2xl font-bold">
                {mode === "login" && "Fazer Login"}
                {mode === "signup" && "Criar Conta"}
                {mode === "forgot-password" && "Recuperar Senha"}
              </CardTitle>

              {/* Descrição contextual */}
              <p className="text-muted-foreground mt-2">
                {mode === "login" &&
                  "Entre com suas credenciais para acessar sua conta"}
                {mode === "signup" &&
                  "Crie sua conta e comece a usar nossa plataforma"}
                {mode === "forgot-password" &&
                  "Enviaremos instruções para seu e-mail"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Renderização condicional dos formulários baseada no modo */}
              {mode === "login" && <LoginForm />}
              {mode === "signup" && <SignupForm />}
              {mode === "forgot-password" && <ForgotForm />}

              {/* Navegação entre modos */}
              <div className="pt-6 border-t border-gray-200">
                <AuthModeNavigation currentMode={mode} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente de navegação entre modos de autenticação (SPA)
function AuthModeNavigation({ currentMode }: { currentMode: AuthMode }) {
  const router = useRouter();

  // Função para navegar entre modos sem refresh da página
  const navigateToMode = (mode: AuthMode) => {
    router.replace(`/auth?mode=${mode}`);
  };

  return (
    <div className="text-center">
      {currentMode === "login" && (
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigateToMode("signup")}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Criar conta gratuita
          </button>
        </p>
      )}

      {currentMode === "signup" && (
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigateToMode("login")}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Fazer login
          </button>
        </p>
      )}

      {currentMode === "forgot-password" && (
        <p className="text-sm text-muted-foreground">
          Lembrou da senha?{" "}
          <button
            type="button"
            onClick={() => navigateToMode("login")}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Voltar para login
          </button>
        </p>
      )}
    </div>
  );
}

// Componente principal com Suspense para useSearchParams
export function AuthPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthPageContent />
    </Suspense>
  );
}

// Componente de carregamento usando o Skeleton do shadcn/ui
function AuthPageSkeleton() {
  return (
    <div className="h-screen max-h-[100svh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl border-0 bg-card">
          <CardHeader className="text-center pb-8">
            {/* Logo mobile skeleton */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Título principal skeleton */}
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />

            {/* Descrição skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Campos de formulário skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-12" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>

              {/* Botão skeleton */}
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Navegação entre modos skeleton */}
            <div className="pt-6 border-t border-gray-200">
              <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuthPage;
