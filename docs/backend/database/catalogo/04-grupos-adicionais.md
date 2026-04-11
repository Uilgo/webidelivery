# Tabela: `grupos_adicionais`

Grupos de complementos/adicionais de uma loja. Reutilizáveis entre múltiplos produtos.

---

## Propósito

- Agrupa adicionais relacionados (ex: "Bordas Recheadas", "Molhos", "Bebidas")
- É criado no nível da loja, não do produto — um grupo pode ser vinculado a vários produtos
- Define as regras de seleção: mínimo, máximo, obrigatoriedade
- O vínculo com produtos é feito via `produto_grupos_adicionais`

---

## Colunas

| Coluna        | Tipo        | Nullable | Default             | Descrição                                                                 |
| ------------- | ----------- | -------- | ------------------- | ------------------------------------------------------------------------- |
| `id`          | uuid        | NO       | `gen_random_uuid()` | PK                                                                        |
| `loja_id`     | uuid        | NO       | —                   | FK → `lojas.id`                                                           |
| `nome`        | text        | NO       | —                   | Nome do grupo (ex: "Bordas Recheadas", "Molhos")                          |
| `descricao`   | text        | YES      | —                   | Descrição exibida ao cliente                                              |
| `obrigatorio` | boolean     | NO       | `false`             | Se o cliente é obrigado a escolher ao menos um item                       |
| `min_selecao` | integer     | NO       | `0`                 | Mínimo de itens que o cliente deve selecionar                             |
| `max_selecao` | integer     | NO       | `1`                 | Máximo de itens que o cliente pode selecionar                             |
| `ordem`       | integer     | NO       | `0`                 | Ordem de exibição no modal do produto                                     |
| `ativo`       | boolean     | NO       | `true`              | Se está disponível para seleção                                           |
| `deleted_at`  | timestamptz | YES      | —                   | Soft delete                                                               |
| `created_at`  | timestamptz | NO       | `now()`             | Data de criação                                                           |
| `updated_at`  | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_grupos_adicionais_modtime` |

---

## Constraints

| Nome                              | Tipo  | Colunas / Referência                                                   |
| --------------------------------- | ----- | ---------------------------------------------------------------------- |
| `grupos_adicionais_pkey`          | PK    | `id`                                                                   |
| `grupos_adicionais_loja_id_fkey`  | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE                              |
| `check_grupos_adicionais_selecao` | CHECK | `min_selecao >= 0 AND max_selecao >= min_selecao AND max_selecao >= 1` |

---

## Índices

| Nome                            | Colunas   | Observação                 |
| ------------------------------- | --------- | -------------------------- |
| `grupos_adicionais_pkey`        | `id`      | PK                         |
| `idx_grupos_adicionais_loja_id` | `loja_id` | WHERE `deleted_at IS NULL` |

---

## Regras de Negócio

- `obrigatorio = true` implica `min_selecao >= 1` — validado via RPC antes do INSERT/UPDATE
- `max_selecao = 1` → seleção única (radio button na UI)
- `max_selecao > 1` → seleção múltipla (checkboxes na UI)
- Um grupo pode ser vinculado a zero ou mais produtos via `produto_grupos_adicionais`
- Ao desativar (`ativo = false`) um grupo, ele some do modal de todos os produtos vinculados sem alterar vínculos
- Soft delete: `deleted_at` é preenchido via RPC — cascata em `adicionais` e remoção de vínculos em `produto_grupos_adicionais`

---

## Relacionamentos

```
lojas (N:1)
  └── grupos_adicionais
        ├── adicionais (1:N)
        └── produto_grupos_adicionais (1:N) ──→ produtos
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                |
| ---------------- | ----------------------------- |
| `admin_master`   | Todos os grupos               |
| `gerente_master` | Todos os grupos               |
| `admin_loja`     | Grupos da própria loja        |
| `gerente_loja`   | Grupos da própria loja        |
| `staff_loja`     | Grupos da própria loja        |
| `entregador`     | Sem acesso                    |
| Público (anon)   | Grupos ativos de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                                   | Operação | Descrição                                                                                    |
| -------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_grupos_adicionais`   | SELECT   | Master e Gerente Master veem todos                                                           |
| `equipe_loja_pode_visualizar_grupos_adicionais`    | SELECT   | Admin/Gerente/Staff veem grupos da própria loja (via `perfis.loja_id`)                       |
| `publico_pode_visualizar_grupos_adicionais_ativos` | SELECT   | Anon vê grupos ativos (`ativo = true`, `deleted_at IS NULL`) de lojas com `status = 'ativo'` |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** grupos são incluídos via embedding no select de produtos: `produto_grupos_adicionais(grupo_adicional_id(*,adicionais(*)))` — RLS garante isolamento
- **Painel da loja:** `supabase.from('grupos_adicionais').select('*, adicionais(*)')` → RLS filtra pela loja do usuário autenticado
- **Painel master:** sem filtro — vê todos os grupos de todas as lojas

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `loja_id` pertence ao usuário autenticado antes de executar qualquer operação.

| Nome da Função                            | Quem pode chamar         | Função                                                                                                                                                                                        |
| ----------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_grupo_adicional`            | admin_loja, gerente_loja | Valida ownership do `loja_id`. Valida que `obrigatorio = true` implica `min_selecao >= 1` e que `max_selecao >= min_selecao`. Cria o grupo em uma única transação                             |
| `fn_rpc_atualizar_grupo_adicional`        | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual. Revalida regras de min/max após aplicar COALESCE antes de commitar      |
| `fn_rpc_ativar_desativar_grupo_adicional` | admin_loja, gerente_loja | Valida ownership. Alterna `ativo` — ao desativar, o grupo some do modal de todos os produtos vinculados sem alterar `deleted_at` nem remover vínculos                                         |
| `fn_rpc_reordenar_grupos_adicionais`      | admin_loja, gerente_loja | Valida ownership de todos os IDs do batch e que pertencem à mesma loja. Atualiza `ordem` em uma única transação                                                                               |
| `fn_rpc_soft_delete_grupo_adicional`      | admin_loja               | Valida ownership. Preenche `deleted_at` no grupo e em cascata em todos os adicionais vinculados. Remove todos os vínculos em `produto_grupos_adicionais`. Operação irreversível via interface |
