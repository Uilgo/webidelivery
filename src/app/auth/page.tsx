import { AuthPage } from "@/features/auth/pages/AuthPage";

// Página de autenticação do WebiDelivery
// Rota: /auth com query params (?mode=login|signup|forgot-password)
export default function AuthPageRoute() {
  return <AuthPage />;
}
