```typescript
/**
 * Tipos JSONB — Perfil Logístico do Entregador
 *
 * Shapes para o campo JSONB `entregadores.perfil_logistico`
 * e `entregador_acertos.registro_pagamento`.
 */

// =============================================
// Conta bancária do entregador (subcampo)
// =============================================

export interface ContaBancaria {
	banco: string; // ex: 'Nubank', 'Bradesco'
	agencia?: string;
	conta?: string;
	tipo_conta?: string; // 'corrente', 'poupanca'
	chave_pix?: string; // chave PIX preferencial
	tipo_chave_pix?: string; // cpf, telefone, email, aleatoria
}

// =============================================
// Perfil logístico (entregadores.perfil_logistico)
// =============================================

export interface PerfilLogistico {
	veiculo: string; // 'moto', 'bicicleta', 'carro', 'a_pe'
	placa?: string; // placa do veículo (obrigatório se moto/carro)
	modelo_veiculo?: string; // ex: 'Honda CG 160'
	cor_veiculo?: string;
	cnh?: string; // número da CNH
	cnh_validade?: string; // formato YYYY-MM-DD
	conta_bancaria?: ContaBancaria;
	foto_url?: string; // foto do entregador
	observacoes?: string;
}

// =============================================
// Registro de pagamento de acerto (entregador_acertos.registro_pagamento)
// =============================================

export interface RegistroPagamentoAcerto {
	metodo: string; // 'pix', 'dinheiro', 'transferencia'
	comprovante_url?: string; // URL do comprovante
	observacoes?: string;
	pago_em: string; // ISO 8601
}
```
