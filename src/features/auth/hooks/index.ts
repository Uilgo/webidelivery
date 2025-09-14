// Exportações centralizadas dos hooks de autenticação

export type {
  ForgotPasswordData,
  ForgotPasswordResponse,
} from "./useForgotPassword";
export { useForgotPassword } from "./useForgotPassword";
// Exportações de tipos para facilitar uso
export type { LoginCredentials, LoginResponse } from "./useLogin";
export { useLogin } from "./useLogin";
export type { SignupData, SignupResponse } from "./useSignup";
export { useSignup } from "./useSignup";
