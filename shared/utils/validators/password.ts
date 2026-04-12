/**
 * 📌 Validador de Senha
 *
 * Valida senhas seguindo as regras de segurança do sistema.
 * Requisitos: mínimo 8 chars, maiúscula, minúscula, número e caractere especial.
 */

export interface PasswordStrength {
	/** Força da senha (0-5) */
	score: number;
	/** Mensagem descritiva */
	message: string;
	/** Se a senha atende os requisitos mínimos */
	isValid: boolean;
	/** Requisitos atendidos */
	requirements: {
		minLength: boolean;
		hasUppercase: boolean;
		hasLowercase: boolean;
		hasNumber: boolean;
		hasSpecialChar: boolean;
	};
}

/**
 * Valida se uma senha atende os requisitos mínimos
 *
 * @param password - Senha a ser validada
 * @returns true se a senha é válida
 *
 * @example
 * isValidPassword('Senha123!') // true
 * isValidPassword('senha123') // false (sem maiúscula e especial)
 */
export const isValidPassword = (password: string): boolean => {
	if (!password || typeof password !== "string") return false;
	if (password.length < 8) return false;
	if (!/[A-Z]/.test(password)) return false;
	if (!/[a-z]/.test(password)) return false;
	if (!/[0-9]/.test(password)) return false;
	if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false;

	return true;
};

/**
 * Calcula a força da senha
 *
 * @param password - Senha a ser analisada
 * @returns Objeto com score e detalhes da força
 *
 * @example
 * getPasswordStrength('123') // { score: 0, message: 'Muito fraca', isValid: false, ... }
 * getPasswordStrength('Senha123!') // { score: 5, message: 'Muito forte', isValid: true, ... }
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
	const requirements = {
		minLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
	};

	const score = Object.values(requirements).filter(Boolean).length;
	const messages = ["Muito fraca", "Fraca", "Razoável", "Forte", "Muito forte", "Muito forte"];

	return {
		score,
		message: messages[score] ?? "Muito fraca",
		isValid: score === 5,
		requirements,
	};
};

/**
 * Valida se duas senhas são iguais
 *
 * @example
 * passwordsMatch('Senha123!', 'Senha123!') // true
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
	return password === confirmPassword;
};

/**
 * Valida se a senha não contém informações pessoais
 *
 * @param password - Senha
 * @param personalInfo - Array com informações pessoais (nome, email, etc)
 * @returns true se a senha não contém informações pessoais
 *
 * @example
 * isPasswordSafe('Senha123!', ['João', 'joao@email.com']) // true
 * isPasswordSafe('João123!', ['João']) // false
 */
export const isPasswordSafe = (password: string, personalInfo: string[]): boolean => {
	const passwordLower = password.toLowerCase();
	for (const info of personalInfo) {
		if (info && passwordLower.includes(info.toLowerCase())) return false;
	}
	return true;
};

/** Senhas comuns que devem ser evitadas */
const COMMON_PASSWORDS = [
	"123456",
	"password",
	"12345678",
	"qwerty",
	"123456789",
	"12345",
	"1234",
	"111111",
	"1234567",
	"dragon",
	"123123",
	"baseball",
	"abc123",
	"football",
	"monkey",
	"letmein",
	"shadow",
	"master",
	"666666",
	"qwertyuiop",
	"123321",
	"mustang",
	"1234567890",
];

/**
 * Valida se a senha não é uma senha comum
 *
 * @example
 * isNotCommonPassword('Senha123!') // true
 * isNotCommonPassword('123456') // false
 */
export const isNotCommonPassword = (password: string): boolean => {
	return !COMMON_PASSWORDS.includes(password.toLowerCase());
};
