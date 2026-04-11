/**
 * Constantes de RBAC (Role-Based Access Control)
 *
 * Define a hierarquia de cargos e permissões do sistema.
 * Baseado no PRD — Sistema RBAC (6 níveis)
 */

type RbacLabelMap = Record<string, string>;

/**
 * Hierarquia de Cargos (6 níveis)
 * admin_master → gerente_master → admin_loja → gerente_loja → staff_loja → entregador
 */
export const CARGOS = {
	ADMIN_MASTER: "admin_master",
	GERENTE_MASTER: "gerente_master",
	ADMIN_LOJA: "admin_loja",
	GERENTE_LOJA: "gerente_loja",
	STAFF_LOJA: "staff_loja",
	ENTREGADOR: "entregador",
} as const;

export const CARGO_LABELS: RbacLabelMap = {
	[CARGOS.ADMIN_MASTER]: "Admin Master",
	[CARGOS.GERENTE_MASTER]: "Gerente Master",
	[CARGOS.ADMIN_LOJA]: "Admin Loja",
	[CARGOS.GERENTE_LOJA]: "Gerente Loja",
	[CARGOS.STAFF_LOJA]: "Staff",
	[CARGOS.ENTREGADOR]: "Entregador",
};

export const CARGOS_PLATAFORMA = [CARGOS.ADMIN_MASTER, CARGOS.GERENTE_MASTER] as const;

export const CARGOS_LOJA = [
	CARGOS.ADMIN_LOJA,
	CARGOS.GERENTE_LOJA,
	CARGOS.STAFF_LOJA,
	CARGOS.ENTREGADOR,
] as const;

export const CARGOS_ADMIN = [
	CARGOS.ADMIN_MASTER,
	CARGOS.GERENTE_MASTER,
	CARGOS.ADMIN_LOJA,
	CARGOS.GERENTE_LOJA,
] as const;

export const CARGOS_OPERACIONAIS = [CARGOS.STAFF_LOJA, CARGOS.ENTREGADOR] as const;

/**
 * Hierarquia de permissões (ordem decrescente de poder).
 * Índice menor = mais poder.
 */
export const HIERARQUIA_CARGOS = [
	CARGOS.ADMIN_MASTER,
	CARGOS.GERENTE_MASTER,
	CARGOS.ADMIN_LOJA,
	CARGOS.GERENTE_LOJA,
	CARGOS.STAFF_LOJA,
	CARGOS.ENTREGADOR,
] as const;

/**
 * Verifica se cargo1 tem permissão superior a cargo2.
 *
 * @example
 * temPermissaoSuperior('admin_master', 'admin_loja') // true
 * temPermissaoSuperior('staff_loja', 'gerente_loja') // false
 */
export const temPermissaoSuperior = (cargo1: string, cargo2: string): boolean => {
	const indexA = HIERARQUIA_CARGOS.indexOf(cargo1 as (typeof HIERARQUIA_CARGOS)[number]);
	const indexB = HIERARQUIA_CARGOS.indexOf(cargo2 as (typeof HIERARQUIA_CARGOS)[number]);
	return indexA < indexB;
};

/**
 * Verifica se cargo1 pode gerenciar cargo2.
 *
 * @example
 * podeGerenciar('admin_loja', 'gerente_loja') // true
 * podeGerenciar('gerente_loja', 'admin_loja') // false
 */
export const podeGerenciar = (cargo1: string, cargo2: string): boolean => {
	return temPermissaoSuperior(cargo1, cargo2);
};
