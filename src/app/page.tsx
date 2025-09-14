import { redirect } from "next/navigation";

// Página principal do WebiDelivery
// Redireciona para /auth conforme regras do middleware
export default function HomePage() {
  // Redirecionamento imediato para a página de autenticação
  redirect("/auth");
}
