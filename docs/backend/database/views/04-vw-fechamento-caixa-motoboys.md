# View: `vw_fechamento_caixa_motoboys`

Como mapeado no arquivo `/logistica/00-visao-geral.md`, as Caixas da frota dependem de um cruzamento prático entre os pedidos expedidos na Via Delivery e a tabela de entregadores. Esta view sintetiza todos os dias do entregador para processar um acerto ou extrato em apenas clique.

---

## Propósito

- Compilar a produtividade diária de um motoboy.
- Centralizar o volume repassado a ele (Ex: a corrida era R$5.00 e o lojista ficou devendo pagar ele) vs volume pago fisicamente pelo cliente ao longo do balcão.

---

## Colunas (Estrutura de Fechamento Cruzado)

| Coluna                  | Tipo    | Descrição                                                                                                                  |
| ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `data_fechamento`       | date    | Ex: `2024-05-18`.                                                                                                          |
| `loja_id`               | uuid    | Isolamento da franquia.                                                                                                    |
| `entregador_id`         | uuid    | O ID do entregador vinculado à loja.                                                                                       |
| `nome_entregador`       | text    | Nome do motoboy extraído de `perfil_logistico` no JSONB de seu cadastro.                                                   |
| `total_corridas`        | numeric | Soma bruta da quantidade de entregas concluídas neste dia (através do tracking do JSON de logísitica em pedidos).          |
| `valor_liquido_taxas`   | numeric | Soma das taxas de entrega (parcela que o motoboy recebe pela corrida em sí).                                               |
| `valor_retido_dinheiro` | numeric | Se ele transacionou `tipo_pagamento = Dinheiro` na rua, ele precisa devolver este valor na tela de Fechamento da pizzaria. |
| `saldo_do_dia`          | numeric | O quanto a loja lhe deve (ou ele deve à loja no fim da noite).                                                             |

---

## RLS e Segurança

Padrão de Criação Obrigatório:

> Deverá ser gerada como `CREATE VIEW vw_fechamento_caixa_motoboys WITH (security_invoker = true)`

Com `security_invoker = true`, a view herda automaticamente as políticas RLS das tabelas subjacentes (`pedidos`, `entregadores`). O campo `loja_id` retido garante isolamento multi-tenant — `admin_loja` e `gerente_loja` veem apenas os fechamentos dos motoboys da própria loja. Nenhuma política RLS adicional precisa ser criada na view.

---

## Integração

Na tabela nativa de fechamento de caixa/acertos (`backend/logistica/02-entregador-acertos.md`), bastará ao gerente "dar check" nesse resumo provido pela view, cimentando o valor acordado transferido com registro permanente por RPC.
