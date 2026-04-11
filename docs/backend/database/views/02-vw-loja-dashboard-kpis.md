# View: `vw_loja_dashboard_kpis`

Esta view consolida os KPIs transacionais da loja em agregados diários, permitindo que a tela inicial (Dashboard) do `admin_loja` renderize seus blocos de estatísticas em milissegundos, enviando apenas 1 linha por dia solicitado.

---

## Propósito

- Fornecer os contadores mastigados diários sem obrigar o backend (ou frontend) a iterar sobre milhares de registros de `pedidos` via JavaScript.
- Evitar sobrecarga de CPU nos painéis e facilitar a construção de Series para gráficos (Recharts/Chart.js).

---

## Colunas Extraídas e Sintetizadas

| Coluna                     | Tipo    | Descrição                                                                                        |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `loja_id`                  | uuid    | Retido para filtro RLS automático.                                                               |
| `data_referencia`          | date    | Data canônica extraída do `created_at` convertido ao timezone local. Traz 1 linha por data/loja. |
| `total_pedidos_concluidos` | numeric | `COUNT(*)` onde estado = 'concluido'.                                                            |
| `total_pedidos_cancelados` | numeric | `COUNT(*)` onde estado = 'cancelado'.                                                            |
| `faturamento_bruto`        | numeric | Cálculo do `SUM(total_pedido)` apenas dos concluídos.                                            |
| `taxas_entrega_somadas`    | numeric | Parcela das taxas pertencentes à via de Entrega.                                                 |
| `ticket_medio`             | numeric | Faturamento dividido pela quantidade de concluídos.                                              |

---

## RLS e Segurança

Padrão de Criação Obrigatório:

> Deverá ser gerada como `CREATE VIEW vw_loja_dashboard_kpis WITH (security_invoker = true)`

Com `security_invoker = true`, a view executa com as permissões do **chamador** (não do criador), herdando automaticamente as políticas RLS das tabelas subjacentes (`pedidos`). Isso garante:

- O `admin_loja` só vê KPIs dos pedidos da própria loja (filtrado pelo RLS de `pedidos`)
- O `admin_master` vê KPIs de todas as lojas
- Nenhuma política RLS adicional precisa ser criada na view — a herança é automática
- Ninguém (nem bots) consegue filtrar dados de lojistas vizinhos

---

## Como usar no Frontend (Nuxt/Supabase)

```typescript
// Gráfico de faturamento dos últimos 7 dias:
const { data: ultimos7Dias } = await client
	.from("vw_loja_dashboard_kpis")
	.select("data_referencia, faturamento_bruto")
	.order("data_referencia", { ascending: false })
	.limit(7);
```
