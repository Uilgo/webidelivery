# Tabela: `cupons`

Cupons de desconto de uma loja — aplicados no checkout pelo cliente.

---

## Propósito

- Permite criar cupons de desconto por código digitado pelo cliente no checkout
- Suporta desconto percentual, valor fixo ou frete grátis
- Controla uso por cliente e uso total via contadores
- Diferente de `promocoes` — cupom exige código, promoção é automática na visualização do cardápio

---

## Colunas

| Coluna               | Tipo        | Nullable | Default             | Descrição                                                          |
| -------------------- | ----------- | -------- | ------------------- | ------------------------------------------------------------------ |
| `id`                 | uuid        | NO       | `gen_random_uuid()` | PK                                                                 |
| `loja_id`            | uuid        | NO       | —                   | FK → `lojas.id`                                                    |
| `codigo`             | text        | NO       | —                   | Código do cupom (ex: "PROMO10") — único por loja, case-insensitive |
| `tipo`               | text        | NO       | —                   | Tipo: `percentual`, `valor_fixo`, `frete_gratis`                   |
| `valor`              | numeric     | YES      | —                   | Valor do desconto — null para `frete_gratis`                       |
| `valor_minimo`       | numeric     | YES      | —                   | Valor mínimo do pedido para aplicar o cupom — null = sem mínimo    |
| `limite_total`       | integer     | YES      | —                   | Máximo de usos totais — null = ilimitado                           |
| `limite_por_cliente` | integer     | YES      | `1`                 | Máximo de usos por cliente — null = ilimitado                      |
| `usos`               | integer     | NO       | `0`                 | Contador de usos totais — incrementado via RPC de pedido           |
| `inicio`             | timestamptz | YES      | —                   | Início da validade — null = válido imediatamente                   |
| `fim`                | timestamptz | YES      | —                   | Fim da validade — null = sem expiração                             |
| `ativo`              | boolean     | NO       | `true`              | Se o cupom está ativo — permite pausar sem deletar                 |
| `deleted_at`         | timestamptz | YES      | —                   | Soft delete                                                        |
| `created_at`         | timestamptz | NO       | `now()`             | Data de criação                                                    |
| `updated_at`         | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_cupons_modtime`     |

---

## Constraints

| Nome                        | Tipo   | Colunas / Referência                                   |
| --------------------------- | ------ | ------------------------------------------------------ |
| `cupons_pkey`               | PK     | `id`                                                   |
| `cupons_loja_id_fkey`       | FK     | `loja_id` → `lojas(id)` ON DELETE CASCADE              |
| `cupons_codigo_loja_unique` | UNIQUE | `(loja_id, lower(codigo))` WHERE `deleted_at IS NULL`  |
| `check_cupons_valor`        | CHECK  | `tipo = 'frete_gratis' OR valor > 0`                   |
| `check_cupons_percentual`   | CHECK  | `tipo != 'percentual' OR (valor > 0 AND valor <= 100)` |
| `check_cupons_periodo`      | CHECK  | `inicio IS NULL OR fim IS NULL OR fim > inicio`        |
| `check_cupons_usos`         | CHECK  | `usos >= 0`                                            |

> **Sobre `tipo`**: Retirado limite estrito (antes `percentual`/`valor_fixo`). Pode assumir `brinde` futuramente bastando liberar o domínio no servidor Zod. As restrições financeiras acima permanecem atuando de forma inteligente.

---

## Índices

| Nome                     | Colunas                    | Observação                                                |
| ------------------------ | -------------------------- | --------------------------------------------------------- |
| `cupons_pkey`            | `id`                       | PK                                                        |
| `idx_cupons_loja_id`     | `loja_id`                  | WHERE `deleted_at IS NULL`                                |
| `idx_cupons_codigo_loja` | `(loja_id, lower(codigo))` | WHERE `deleted_at IS NULL` — validação rápida no checkout |
| `idx_cupons_ativos`      | `(loja_id, ativo, fim)`    | Filtro de cupons válidos                                  |

---

## Regras de Negócio

- `codigo` é normalizado para lowercase na validação — "PROMO10" e "promo10" são o mesmo cupom
- `usos` é incrementado atomicamente via RPC de pedido — nunca atualizado diretamente (se falhar, há compensação dependente do módulo de pedidos)
- Se `limite_total` for atingido, o cupom é automaticamente desativado via RPC
- `frete_gratis` não usa `valor` — o desconto é dinâmico e corresponde à taxa de entrega total do pedido na hora da finalização
- Um cliente não pode usar o mesmo cupom mais de `limite_por_cliente` vezes — verificado em histórico de pedidos
- Soft delete: `deleted_at` é preenchido em vez de deletar

---

## Relacionamentos

```
lojas (N:1)
  └── cupons
        └── pedidos (1:N via cupom_id)
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                            |
| ---------------- | ----------------------------------------- |
| `admin_master`   | Todos os cupons                           |
| `gerente_master` | Todos os cupons                           |
| `admin_loja`     | Cupons da própria loja                    |
| `gerente_loja`   | Cupons da própria loja                    |
| `staff_loja`     | Cupons da própria loja                    |
| `entregador`     | Sem acesso                                |
| Público (anon)   | Nenhum — validação via RPC exclusivamente |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política                      | Operação | Descrição                                                        |
| ------------------------------------- | -------- | ---------------------------------------------------------------- |
| `admin_master_pode_visualizar_cupons` | SELECT   | Master e Gerente Master veem todos                               |
| `equipe_loja_pode_visualizar_cupons`  | SELECT   | Admin/Gerente/Staff veem cupons da própria loja (perfis.loja_id) |

> Público não tem política SELECT — a validação do cupom pelo usuário no fluxo de carrinho é feita exclusivamente via RPC.

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam o ownership a partir de `auth.uid()`.

| Nome da Função             | Quem pode chamar         | Função                                                                                                                                                                                                                                   |
| -------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_cupom`       | admin_loja, gerente_loja | Valida ownership da `loja_id`, verifica consistência de `tipo`/`valor` (percentual 1–100, valor_fixo > 0, frete_gratis sem valor), valida período (`fim > inicio`), insere em transação única                                            |
| `fn_rpc_atualizar_cupom`   | admin_loja, gerente_loja | Valida ownership do cupom, atualiza apenas os campos fornecidos via `COALESCE`, revalida consistência de `tipo`/`valor` e período após merge — bloqueia se `usos > 0` e `tipo` for alterado                                              |
| `fn_rpc_soft_delete_cupom` | admin_loja               | Valida ownership do cupom, preenche `deleted_at = now()` — bloqueia se cargo for `gerente_loja`                                                                                                                                          |
| `fn_rpc_validar_cupom`     | Público (anon)           | Recebe `loja_id`, `codigo` e metadados de subtotal — verifica `ativo`, período (`inicio`/`fim`), `limite_total` vs `usos`, limites individuais, `valor_minimo` — retorna payload de sucesso com desconto pronto pra engate no `ordem_id` |
