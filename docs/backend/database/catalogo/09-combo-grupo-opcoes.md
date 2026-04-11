# Tabela: `combo_grupo_opcoes`

Produtos disponíveis para escolha dentro de um grupo de combo.

---

## Propósito

- Lista os produtos que o cliente pode escolher dentro de um `combo_grupo`
- Vincula um produto (e opcionalmente uma variação específica) como opção de escolha
- Permite definir um acréscimo de preço para opções premium dentro do combo

---

## Colunas

| Coluna        | Tipo        | Nullable | Default             | Descrição                                                                     |
| ------------- | ----------- | -------- | ------------------- | ----------------------------------------------------------------------------- |
| `id`          | uuid        | NO       | `gen_random_uuid()` | PK                                                                            |
| `grupo_id`    | uuid        | NO       | —                   | FK → `combo_grupos.id`                                                        |
| `produto_id`  | uuid        | NO       | —                   | FK → `produtos.id`                                                            |
| `variacao_id` | uuid        | YES      | —                   | FK → `produto_variacoes.id` — `null` = cliente escolhe a variação no checkout |
| `preco_extra` | numeric     | NO       | `0`                 | Acréscimo ao preço do combo para esta opção — `0` = sem acréscimo             |
| `ordem`       | integer     | NO       | `0`                 | Ordem de exibição dentro do grupo                                             |
| `ativo`       | boolean     | NO       | `true`              | Se esta opção está disponível para seleção                                    |
| `created_at`  | timestamptz | NO       | `now()`             | Data de criação                                                               |

> Sem `updated_at` e sem `deleted_at` — gerenciado via RPC do combo pai. Sem soft delete.

---

## Constraints

| Nome                       | Tipo   | Colunas / Referência                              |
| -------------------------- | ------ | ------------------------------------------------- |
| `combo_grupo_opcoes_pkey`  | PK     | `id`                                              |
| `cgo_grupo_id_fkey`        | FK     | `grupo_id` → `combo_grupos(id)` ON DELETE CASCADE |
| `cgo_produto_id_fkey`      | FK     | `produto_id` → `produtos(id)`                     |
| `cgo_variacao_id_fkey`     | FK     | `variacao_id` → `produto_variacoes(id)`           |
| `cgo_grupo_produto_unique` | UNIQUE | `(grupo_id, produto_id, variacao_id)`             |
| `check_cgo_preco_extra`    | CHECK  | `preco_extra >= 0`                                |

---

## Índices

| Nome                      | Colunas             | Observação                                   |
| ------------------------- | ------------------- | -------------------------------------------- |
| `combo_grupo_opcoes_pkey` | `id`                | PK                                           |
| `idx_cgo_grupo_id`        | `(grupo_id, ordem)` | Busca de opções de um grupo ordenadas        |
| `idx_cgo_produto_id`      | `produto_id`        | Verificar em quais combos um produto aparece |

---

## Regras de Negócio

- `variacao_id = null` → o produto tem apenas 1 variação ou o cliente escolhe a variação no checkout
- `variacao_id` preenchido → a variação já está fixada para esta opção do combo
- `preco_extra = 0` → opção sem custo adicional ao preço do combo
- `preco_extra > 0` → opção premium (ex: "Suco Natural +R$3,00")
- A combinação `(grupo_id, produto_id, variacao_id)` é única — não pode duplicar a mesma opção no grupo (garantido pela UNIQUE constraint)
- Sem soft delete — gerenciado pelas RPCs do combo pai; ao deletar o combo, cascata apaga tudo

---

## Relacionamentos

```
combo_grupos (N:1)
produtos (N:1)
produto_variacoes (N:1, opcional)
  └── combo_grupo_opcoes
```

---

## RLS (Row Level Security)

Acesso derivado do `grupo_id` → `combo_id` → `loja_id`.

| Cargo            | O que pode ver                                 |
| ---------------- | ---------------------------------------------- |
| `admin_master`   | Todas as opções                                |
| `gerente_master` | Todas as opções                                |
| `admin_loja`     | Opções de combos da própria loja               |
| `gerente_loja`   | Opções de combos da própria loja               |
| `staff_loja`     | Opções de combos da própria loja               |
| `entregador`     | Sem acesso                                     |
| Público (anon)   | Opções ativas de combos ativos de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER** (gerenciado pelas RPCs de `combos`).

### Políticas

| Nome da Política                                    | Operação | Descrição                                                                                                            |
| --------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_combo_grupo_opcoes`   | SELECT   | Master e Gerente Master veem todas                                                                                   |
| `equipe_loja_pode_visualizar_combo_grupo_opcoes`    | SELECT   | Admin/Gerente/Staff via JOIN em `combo_grupos → combos.loja_id` (vinculado ao `perfis.loja_id`)                      |
| `publico_pode_visualizar_combo_grupo_opcoes_ativas` | SELECT   | Anon via JOIN em `combo_grupos → combos.loja_id` e `lojas.status = 'ativo'` e `combos.ativo = true` e `ativo = true` |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** incluído via embedding: `combo_grupos(*, combo_grupo_opcoes(*, produto_id(*), variacao_id(*)))` — RLS garante isolamento
- **Painel da loja:** mesmo embedding — RLS filtra pela loja do usuário autenticado

---

## Funções RPC

Gerenciado pelas RPCs de `combos` (`fn_rpc_criar_combo`, `fn_rpc_atualizar_combo`, `fn_rpc_soft_delete_combo`).

Não há RPCs independentes para esta tabela — opções são sempre manipuladas no contexto do combo pai via `SECURITY DEFINER`.
