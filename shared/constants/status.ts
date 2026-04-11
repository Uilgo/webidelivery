/**
 * Constantes de Status do Sistema
 *
 * Labels e cores para todos os status de entidades.
 * Os valores em si estão nos enums TypeScript (shared/types/database/enums.ts).
 */

type StatusLabelMap = Record<string, string>;

export const STATUS_PEDIDO = {
	PENDENTE: "pendente",
	CONFIRMADO: "confirmado",
	EM_PREPARO: "em_preparo",
	PRONTO: "pronto",
	SAIU_ENTREGA: "saiu_entrega",
	ENTREGUE: "entregue",
	CANCELADO: "cancelado",
	RECUSADO: "recusado",
} as const;

export const STATUS_PEDIDO_LABELS: StatusLabelMap = {
	[STATUS_PEDIDO.PENDENTE]: "Pendente",
	[STATUS_PEDIDO.CONFIRMADO]: "Confirmado",
	[STATUS_PEDIDO.EM_PREPARO]: "Em Preparo",
	[STATUS_PEDIDO.PRONTO]: "Pronto",
	[STATUS_PEDIDO.SAIU_ENTREGA]: "Saiu para Entrega",
	[STATUS_PEDIDO.ENTREGUE]: "Entregue",
	[STATUS_PEDIDO.CANCELADO]: "Cancelado",
	[STATUS_PEDIDO.RECUSADO]: "Recusado",
};

export const STATUS_PEDIDO_CORES: StatusLabelMap = {
	[STATUS_PEDIDO.PENDENTE]: "red",
	[STATUS_PEDIDO.CONFIRMADO]: "blue",
	[STATUS_PEDIDO.EM_PREPARO]: "orange",
	[STATUS_PEDIDO.PRONTO]: "purple",
	[STATUS_PEDIDO.SAIU_ENTREGA]: "cyan",
	[STATUS_PEDIDO.ENTREGUE]: "green",
	[STATUS_PEDIDO.CANCELADO]: "gray",
	[STATUS_PEDIDO.RECUSADO]: "red",
};

export const STATUS_LGPD = {
	PENDENTE: "pendente",
	EM_ANALISE: "em_analise",
	CONCLUIDA: "concluida",
	CANCELADA: "cancelada",
} as const;

export const STATUS_LGPD_LABELS: StatusLabelMap = {
	[STATUS_LGPD.PENDENTE]: "Pendente",
	[STATUS_LGPD.EM_ANALISE]: "Em Análise",
	[STATUS_LGPD.CONCLUIDA]: "Concluída",
	[STATUS_LGPD.CANCELADA]: "Cancelada",
};
