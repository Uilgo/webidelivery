# Tabela: `promocoes`

Promoções aplicadas a produtos ou categorias de uma loja.

---

## Propósito

- Centraliza todas as promoções em uma única tabela polimórfica
- Suporta dois tipos de entidades alvo: `produto` e `categoria`
- Quando aplicada a uma `categoria`, todos os produtos da categoria recebem o desconto no momento do pedido
- Combos **não recebem promoção** — combos já são um preço promocional fixo definido pelo admin
- `loja_id` é desnormalizado para permitir RLS direto sem JOIN

---

## Colunas

| Coluna          | Tipo        | Nullable | Default             | Descrição                                                             |
| --------------- | ----------- | -------- | ------------------- | --------------------------------------------------------------------- |
| `id`            | uuid        | NO       | `gen_random_uuid()` | PK                                                                    |
| `loja_id`       | uuid        | NO       | —                   | FK → `lojas.id` — desnormalizado para RLS direto sem JOIN             |
| `entidade_tipo` | text        | NO       | —                   | Tipo da entidade alvo: `produto`, `categoria`                         |
| `entidade_id`   | uuid        | NO       | —                   | ID da entidade alvo — sem FK (polimórfico)                            |
| `tipo`          | text        | NO       | —                   | Tipo de desconto: `percentual`, `valor_fixo`                          |
| `valor`         | numeric     | NO       | —                   | Valor do desconto — percentual (0–100) ou valor fixo em R$            |
| `inicio`        | timestamptz | YES      | —                   | Início da promoção — `null` = sem restrição de início                 |
| `fim`           | timestamptz | YES      | —                   | Fim da promoção — `null` = sem restrição de fim (promoção permanente) |
| `ativo`         | boolean     | NO       | `true`              | Se a promoção está ativa — permite pausar sem deletar                 |
| `deleted_at`    | timestamptz | YES      | —                   | Soft delete                                                           |
| `created_at`    | timestamptz | NO       | `now()`             | Data de criação                                                       |
| `updated_at`    | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_promocoes_modtime`     |

---

## Constraints

| Nome                         | Tipo  | Colunas / Referência                                   |
| ---------------------------- | ----- | ------------------------------------------------------ |
| `promocoes_pkey`             | PK    | `id`                                                   |
| `promocoes_loja_id_fkey`     | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE              |
| `check_promocoes_percentual` | CHECK | `tipo != 'percentual' OR (valor > 0 AND valor <= 100)` |
| `check_promocoes_valor_fixo` | CHECK | `tipo != 'valor_fixo' OR valor > 0`                    |
| `check_promocoes_periodo`    | CHECK | `inicio IS NULL OR fim IS NULL OR fim > inicio`        |

> **Sobre `entidade_tipo` e `tipo`**: O servidor Zod toma responsabilidade da qualificação estrutural (ex:`percentual`). Comportamentos operacionais como `valor <= 100` preservam a lógica de banco intacta como segurança blindada.

---

## Índices

| Nome                     | Colunas                         | Observação                                  |
| ------------------------ | ------------------------------- | ------------------------------------------- |
| `promocoes_pkey`         | `id`                            | PK                                          |
| `idx_promocoes_loja_id`  | `loja_id`                       | WHERE `deleted_at IS NULL`                  |
| `idx_promocoes_entidade` | `(entidade_tipo, entidade_id)`  | WHERE `deleted_at IS NULL AND ativo = true` |
| `idx_promocoes_ativas`   | `(loja_id, ativo, inicio, fim)` | Busca de promoções vigentes no cardápio     |

---

## Regras de Negócio

- Uma entidade pode ter múltiplas promoções ativas simultaneamente — a RPC de criação de pedido aplica a de maior desconto
- Promoção em `produto` tem precedência sobre promoção da `categoria` quando o desconto for igual — empate desempata por `produto`
- `inicio` e `fim` nulos significam sem restrição de período
- `ativo = false` pausa a promoção sem deletar — útil para promoções sazonais recorrentes
- Promoção em `categoria` afeta todos os produtos ativos da categoria no momento do pedido
- **Combos não recebem promoção** — o modelo de preço fixo do combo seria corrompido por um desconto adicional. O preço do combo já é o preço promocional
- Soft delete: `deleted_at` é preenchido via RPC em vez de deletar
- A RPC de criação verifica que `entidade_id` existe, é do tipo correto (`produto` ou `categoria`) e pertence à `loja_id` antes de criar

---

## Relacionamentos

```
lojas (N:1)
  └── promocoes
        ├── → produtos (via entidade_tipo = 'produto')
        └── → categorias (via entidade_tipo = 'categoria')
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                              |
| ---------------- | ------------------------------------------- |
| `admin_master`   | Todas as promoções                          |
| `gerente_master` | Todas as promoções                          |
| `admin_loja`     | Promoções da própria loja                   |
| `gerente_loja`   | Promoções da própria loja                   |
| `staff_loja`     | Promoções da própria loja                   |
| `entregador`     | Sem acesso                                  |
| Público (anon)   | Promoções ativas e vigentes de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                           | Operação | Descrição                                                                                                          |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `admin_master_pode_visualizar_promocoes`   | SELECT   | Master e Gerente Master veem todas                                                                                 |
| `equipe_loja_pode_visualizar_promocoes`    | SELECT   | Admin/Gerente/Staff veem promoções da própria loja (via `perfis.loja_id`)                                          |
| `publico_pode_visualizar_promocoes_ativas` | SELECT   | Anon vê promoções `ativo = true`, `deleted_at IS NULL` e dentro do período vigente de lojas com `status = 'ativo'` |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** `supabase.from('promocoes').select('*').eq('loja_id', lojaId)` → RLS retorna apenas promoções ativas e vigentes da loja ativa
- **Painel da loja:** mesmo select → RLS filtra pela loja do usuário autenticado, incluindo pausadas e com `deleted_at`
- **Painel master:** sem filtro — vê todas as promoções de todas as lojas

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `loja_id` pertence ao usuário autenticado antes de executar qualquer operação.

| Nome da Função                     | Quem pode chamar         | Função                                                                                                                                                                                                          |
| ---------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_promocao`            | admin_loja, gerente_loja | Valida ownership do `loja_id`. Valida que `entidade_tipo` é `produto` ou `categoria`. Valida valor do desconto e período (`fim > inicio`). Verifica que `entidade_id` existe e pertence à loja. Cria a promoção |
| `fn_rpc_atualizar_promocao`        | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual. Revalida valor e período após COALESCE antes de commitar                                  |
| `fn_rpc_ativar_desativar_promocao` | admin_loja, gerente_loja | Valida ownership. Alterna `ativo` — permite pausar/retomar promoções sazonais sem alterar `deleted_at`                                                                                                          |
| `fn_rpc_soft_delete_promocao`      | admin_loja               | Valida ownership. Preenche `deleted_at` na promoção. Operação irreversível via interface                                                                                                                        |
| `fn_rpc_listar_promocoes_ativas`   | Público (anon)           | Não requer autenticação. Retorna promoções vigentes de uma loja ativa — filtra `deleted_at IS NULL`, `ativo = true` e período atual: `(inicio <= now() OR inicio IS NULL) AND (fim >= now() OR fim IS NULL)`    |
