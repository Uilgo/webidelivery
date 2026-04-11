/**
 * Tipos JSONB — Configurações de Loja
 *
 * Shapes fortemente tipados para todos os campos JSONB
 * da tabela `lojas`. Evita `any` e `Record<string, unknown>`.
 */

// =============================================
// Endereço da loja (lojas.endereco)
// =============================================

export interface LojaEndereco {
	rua: string;
	numero: string;
	complemento?: string;
	bairro: string;
	cidade: string;
	estado: string; // UF (ex: 'SP')
	cep: string;
	latitude?: number;
	longitude?: number;
}

// =============================================
// Horários de funcionamento (lojas.horarios)
// Array de objetos — um por dia da semana
// =============================================

export interface LojaHorario {
	dia_semana: number; // 0 = Domingo, 1 = Segunda ... 6 = Sábado
	abertura: string; // formato HH:mm (ex: '18:00')
	fechamento: string; // formato HH:mm (ex: '23:30')
	ativo: boolean; // se a loja abre nesse dia
}

// =============================================
// Configuração operacional (lojas.config_operacao)
// =============================================

export interface LojaConfigOperacao {
	aceita_retirada: boolean;
	aceita_delivery: boolean;
	aceita_mesa: boolean;
	tempo_preparo_min: number; // minutos estimados
	pedido_minimo: number; // valor mínimo do pedido
	raio_entrega_km: number; // raio máximo de entrega
	auto_aceitar_pedidos: boolean; // se aceita automaticamente
	som_notificacao: boolean; // tocar som ao receber pedido
	imprimir_automatico: boolean; // imprimir pedido ao aceitar
	mostrar_tempo_estimado: boolean; // exibir tempo no cardápio público
}

// =============================================
// Configuração de tema/marca (lojas.config_tema)
// =============================================

export interface LojaConfigTema {
	cor_primaria: string; // hex (ex: '#FF5722')
	cor_secundaria: string;
	cor_fundo: string;
	cor_texto: string;
	modo_escuro: boolean;
	border_radius: string; // ex: 'rounded', 'sharp'
	font_familia: string; // ex: 'Inter', 'Roboto'
	banner_hero_url?: string; // banner principal do cardápio
	estilo_cards: string; // ex: 'minimal', 'shadow', 'bordered'
}

// =============================================
// Configuração de pagamentos (lojas.config_pagamentos)
// =============================================

export interface LojaConfigPagamentos {
	aceita_pix: boolean;
	aceita_cartao_credito: boolean;
	aceita_cartao_debito: boolean;
	aceita_dinheiro: boolean;
	aceita_vale_refeicao: boolean;
	chave_pix?: string; // chave PIX para exibição
	tipo_chave_pix?: string; // cpf, cnpj, email, telefone, aleatoria
	instrucoes_pagamento?: string; // texto livre para observações
}

// =============================================
// Configuração de entrega (lojas.config_entrega)
// =============================================

export interface ZonaEntrega {
	nome: string; // ex: 'Centro', 'Zona Norte'
	taxa: number; // valor da taxa nessa zona
	raio_km: number; // limite em km
	tempo_estimado_min: number; // minutos para entrega
	ativo: boolean;
}

export interface LojaConfigEntrega {
	tipo_taxa: string; // 'fixa', 'por_zona', 'por_km'
	taxa_fixa?: number; // valor fixo (se tipo = 'fixa')
	valor_por_km?: number; // valor por km (se tipo = 'por_km')
	entrega_gratis_acima?: number; // pedido acima desse valor = frete grátis (null = nunca)
	zonas: ZonaEntrega[]; // zonas de entrega configuradas
	tempo_estimado_padrao_min: number; // fallback se zona não define
}
