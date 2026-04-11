# Tabela: `combo_grupos`

Grupos de escolha dentro de um combo — o cliente escolhe um ou mais produtos de cada grupo.

---

## Propósito

- Representa uma "etapa de escolha" dentro do combo (ex: "Escolha 1 bebida", "Escolha 1 acompanhamento")
- Cada grupo define quantos produtos o cliente deve/pode escolher
- Os produtos disponíveis em cada grupo ficam em `combo_grupo_opcoes`

---

## Colunas

| Coluna        | Tipo        | Nullable | Default             | Descrição                                                     |
| ------------- | ----------- | -------- | ------------------- | ------------------------------------------------------------- |
| `id`          | uuid        | NO       | `gen_random_uuid()` | PK                                                            |
| `combo_id`    | uuid        | NO       | —                   | FK → `combos.id`                                              |
| `nome`        | text        | NO       | —                   | Nome do grupo (ex: "Escolha sua bebida", "Escolha o tamanho") |
| `descricao`   | text        | YES      | —                   | Instrução exibida ao cliente                                  |
| `obrigatorio` | boolean     | NO       | `true`              | Se o cliente é obrigado a escolher ao menos uma opção         |
| `min_selecao` | integer     | NO       | `1`                 | Mínimo de opções que o cliente deve selecionar                |
| `max_selecao` | integer     | NO       | `1`                 | Máximo de opções que o cliente pode selecionar                |
| `ordem`       | integer     | NO       | `0`                 | Ordem de exibição no fluxo de montagem do combo               |
| `created_at`  | timestamptz | NO       | `now()`             | Data de criação                                               |

> Sem `updated_at` e sem `deleted_at` — gerenciado via RPC do combo pai. Sem soft delete.

---

## Constraints

| Nome                         | Tipo  | Colunas / Referência                                                   |
| ---------------------------- | ----- | ---------------------------------------------------------------------- |
| `combo_grupos_pkey`          | PK    | `id`                                                                   |
| `combo_grupos_combo_id_fkey` | FK    | `combo_id` → `combos(id)` ON DELETE CASCADE                            |
| `check_combo_grupos_selecao` | CHECK | `min_selecao >= 0 AND max_selecao >= min_selecao AND max_selecao >= 1` |

---

## Índices

| Nome                        | Colunas             | Observação                            |
| --------------------------- | ------------------- | ------------------------------------- |
| `combo_grupos_pkey`         | `id`                | PK                                    |
| `idx_combo_grupos_combo_id` | `(combo_id, ordem)` | Busca de grupos de um combo ordenados |

---

## Regras de Negócio

- `obrigatorio = true` implica `min_selecao >= 1` — validado via RPC
- `max_selecao = 1` → cliente escolhe exatamente 1 opção (radio button na UI)
- `max_selecao > 1` → cliente pode escolher múltiplas opções (checkboxes na UI)
- Sem soft delete — ao deletar o combo pai, os grupos são deletados em cascata via FK `ON DELETE CASCADE`
- Não há RPCs independentes — grupos são sempre manipulados no contexto do combo pai

---

## Relacionamentos

```
combos (N:1)
  └── combo_grupos
        └── combo_grupo_opcoes (1:N)
```

---

## RLS (Row Level Security)

Acesso derivado do `combo_id` — quem pode ver o combo, pode ver seus grupos.

| Cargo            | O que pode ver                          |
| ---------------- | --------------------------------------- |
| `admin_master`   | Todos os grupos                         |
| `gerente_master` | Todos os grupos                         |
| `admin_loja`     | Grupos de combos da própria loja        |
| `gerente_loja`   | Grupos de combos da própria loja        |
| `staff_loja`     | Grupos de combos da própria loja        |
| `entregador`     | Sem acesso                              |
| Público (anon)   | Grupos de combos ativos de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER** (gerenciado pelas RPCs de `combos`).

### Políticas

| Nome da Política                              | Operação | Descrição                                                                                                          |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `admin_master_pode_visualizar_combo_grupos`   | SELECT   | Master e Gerente Master veem todos                                                                                 |
| `equipe_loja_pode_visualizar_combo_grupos`    | SELECT   | Admin/Gerente/Staff via JOIN em `combos.loja_id` (vinculado ao `perfis.loja_id`)                                   |
| `publico_pode_visualizar_combo_grupos_ativos` | SELECT   | Anon via JOIN em `combos.loja_id` e `lojas.status = 'ativo'` e `combos.ativo = true` e `combos.deleted_at IS NULL` |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** incluído via embedding: `combos(*, combo_grupos(*, combo_grupo_opcoes(*)))` — RLS garante isolamento
- **Painel da loja:** mesmo embedding — RLS filtra pela loja do usuário autenticado

---

## Funções RPC

Gerenciado pelas RPCs de `combos` (`fn_rpc_criar_combo`, `fn_rpc_atualizar_combo`, `fn_rpc_soft_delete_combo`).

Não há RPCs independentes para esta tabela — grupos são sempre manipulados no contexto do combo pai via `SECURITY DEFINER`.
