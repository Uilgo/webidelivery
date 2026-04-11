# View: `vw_master_kpi_assinaturas`

Métrica do topo de pirâmide B2B. Exclusiva para visualização do dono do sistema (WebiDelivery / `admin_master`). Ela encurta os KPIs pesados de Billing de forma tabular instantânea e permite gráficos sobre a esteira de pagamentos SaaS.

---

## Propósito

- Extrair MRR (Faturamento Mensal Recorrente) e Contagens ativas para renderizar uma página "Overview" Financeira no painel central instantaneamente.

---

## Colunas Sintetizadoras

| Coluna                         | Tipo    | Descrição                                                                                                                        |
| ------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `mrr_estimado`                 | numeric | Soma das faturas projetadas (ou captadas das assinaturas de Lojas não-arquivadas multiplicadas por seus valores na base mensal). |
| `total_planos_ativos`          | numeric | Quantas empresas estão transacionais dentro do SaaS hoje.                                                                        |
| `total_empresas_inadimplentes` | numeric | O montante de Lojas onde o estado bloqueou por falta do Pix.                                                                     |
| `volume_faturado_neste_mes`    | numeric | Cruza faturas recebidas confirmadas agrupando na data Mês.                                                                       |
| `plano_mais_vendido`           | text    | Nome do Plano que alavanca mais lojas no dia.                                                                                    |

---

## RLS e Segurança

Padrão de Criação Obrigatório:

> Deverá ser gerada como `CREATE VIEW vw_master_kpi_assinaturas WITH (security_invoker = true)`

Com `security_invoker = true`, a view herda automaticamente as políticas RLS das tabelas subjacentes (`assinaturas`, `faturas`, `planos`, `empresas`). Como essas tabelas só concedem SELECT para `admin_master` e `gerente_master`, **nenhum lojista, staff ou usuário não autenticado** consegue acessar esta view — a proteção é automática, sem necessidade de políticas RLS adicionais na view.
