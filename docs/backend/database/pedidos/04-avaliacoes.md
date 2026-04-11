# Tabela: `pedido_avaliacoes` (CSAT de Loja)

A estrutura limpa de Feedback após a vida útil de uma venda, alimentando algorítmos de Relevância de produtos.

---

## Propósito

- Centralizar a pontuação e revisão de experiência daquele Pedido e entregador específico.
- Manter Relação 1:1, nunca gerando poluição ou duplicate spam.

---

## Colunas

| Coluna                 | Tipo        | Nullable | Descrição                                                        |
| ---------------------- | ----------- | -------- | ---------------------------------------------------------------- |
| `pedido_id`            | uuid        | NO       | PK e FK simultânea → `pedidos.id` CASCADE (1:1)                  |
| `loja_id`              | uuid        | NO       | FK (herdada do log transacional por clareza RLS)                 |
| `cliente_id`           | uuid        | NO       | Quem proferiu a nota                                             |
| `nota`                 | integer     | NO       | Rating de Experiência (1 a 5)                                    |
| `comentarios_internos` | text        | YES      | Observação textual para controle de qualidade                    |
| `tags_problema`        | jsonb       | YES      | Ex: `["demora", "embalagem_vazada"]` (Restrito / Opções via CMS) |
| `criado_em`            | timestamptz | NO       | Timestamp da Avaliação                                           |

---

## Constraints

| Nome                                | Tipo  | Expressão de Avaliação                                            |
| ----------------------------------- | ----- | ----------------------------------------------------------------- |
| `pedido_avaliacoes_pkey`            | PK    | `pedido_id` — PK simultânea que garante relação 1:1 com `pedidos` |
| `pedido_avaliacoes_pedido_id_fkey`  | FK    | `pedido_id` → `pedidos(id)` ON DELETE CASCADE                     |
| `pedido_avaliacoes_loja_id_fkey`    | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE                         |
| `pedido_avaliacoes_cliente_id_fkey` | FK    | `cliente_id` → `clientes(id)` ON DELETE SET NULL                  |
| `check_avaliacao_nota`              | CHECK | `nota BETWEEN 1 AND 5`                                            |

## Índices

| Nome                     | Colunas     | Observação                           |
| ------------------------ | ----------- | ------------------------------------ |
| `pedido_avaliacoes_pkey` | `pedido_id` | PK (1:1 com pedidos)                 |
| `idx_avaliacoes_loja_id` | `loja_id`   | Performance nos filtros RLS por loja |

---

## RLS (Row Level Security)

| Cargo            | O que pode ver             |
| ---------------- | -------------------------- |
| `admin_master`   | Todas as avaliações        |
| `gerente_master` | Todas as avaliações        |
| `admin_loja`     | Avaliações da própria loja |
| `gerente_loja`   | Avaliações da própria loja |
| `staff_loja`     | Avaliações da própria loja |
| Público (anon)   | Nenhum acesso              |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política                          | Operação | Descrição                                                                  |
| ----------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_avaliacoes` | SELECT   | Master e Gerente Master veem todas                                         |
| `equipe_loja_pode_visualizar_avaliacoes`  | SELECT   | Admin/Gerente/Staff veem avaliações da própria loja (via `perfis.loja_id`) |

---

## Funções RPC

| Nome da Função                      | Quem Pode Acionar                              | Transação (SECURITY DEFINER)                                                                                                                                                                                          |
| ----------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_avaliar_entrega_finalizada` | Clientes Logados ou Token de Avaliacao Anonimo | Escaneia via FK se o Status local do `estado_atual` em `pedidos` acopla o encerramento do trajeto da Moto (para prevenir avaliações em pedidos `pendentes` ou em preparo fantasma). Trava a row pra insert exclusivo. |
