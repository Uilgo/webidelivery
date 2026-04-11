/**
 * Tipos JSONB — Dados do Cliente
 *
 * Shapes para os campos JSONB da tabela `clientes`.
 * Endereços salvos e perfil CRM.
 */

// =============================================
// Endereço salvo do cliente (clientes.enderecos_salvos → array)
// =============================================

export interface ClienteEnderecoSalvo {
	apelido: string; // ex: 'Casa', 'Trabalho'
	rua: string;
	numero: string;
	complemento?: string;
	bairro: string;
	cidade: string;
	referencia?: string; // ex: 'Próximo ao mercado'
	cep?: string;
	latitude?: number;
	longitude?: number;
	padrao: boolean; // se é o endereço principal
}

// =============================================
// Perfil CRM do cliente (clientes.perfil_crm)
// Dados opcionais para marketing e fidelização
// =============================================

export interface ClientePerfilCRM {
	cpf?: string;
	data_nascimento?: string; // formato YYYY-MM-DD
	opt_in_marketing_email?: boolean;
	opt_in_marketing_whatsapp?: boolean;
	pontos_fidelidade?: number;
	notas_internas?: string; // observações do lojista sobre o cliente
	tags?: string[]; // ex: ['vip', 'frequente', 'problema']
}
