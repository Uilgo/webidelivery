# Tabela: `combos`

Combos de uma loja — agrupam produtos com preço especial.

---

## Propósito

- Representa um combo com preço fixo definido pelo admin
- O preço original (para exibir a economia) é calculado via query — não armazenado
- Suporta grupos de escolha onde o cliente seleciona os itens (ex: "Escolha 1 bebida")
- Grupos de escolha são gerenciados em `combo_grupos` e `combo_grupo_opcoes`

---

## Colunas

| Coluna             | Tipo        | Nullable | Default             | Descrição                                                          |
| ------------------ | ----------- | -------- | ------------------- | ------------------------------------------------------------------ |
| `id`               | uuid        | NO       | `gen_random_uuid()` | PK                                                                 |
| `loja_id`          | uuid        | NO       | —                   | FK → `lojas.id`                                                    |
| `nome`             | text        | NO       | —                   | Nome do combo (ex: "Combo Família")                                |
| `descricao`        | text        | YES      | —                   | Descrição exibida no cardápio                                      |
| `imagem_url_light` | text        | YES      | —                   | URL da imagem do combo otimizada para temas claros                 |
| `imagem_url_dark`  | text        | YES      | —                   | URL da imagem do combo otimizada para temas escuros                |
| `preco`            | numeric     | NO       | —                   | Preço do combo — definido pelo admin                               |
| `inicio`           | timestamptz | YES      | —                   | Início da disponibilidade — `null` = sem restrição de início       |
| `fim`              | timestamptz | YES      | —                   | Fim da disponibilidade — `null` = sem restrição (combo permanente) |
| `ativo`            | boolean     | NO       | `true`              | Se está visível no cardápio                                        |
| `deleted_at`       | timestamptz | YES      | —                   | Soft delete                                                        |
| `created_at`       | timestamptz | NO       | `now()`             | Data de criação                                                    |
| `updated_at`       | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_combos_modtime`     |

---

## Constraints

| Nome                   | Tipo  | Colunas / Referência                            |
| ---------------------- | ----- | ----------------------------------------------- |
| `combos_pkey`          | PK    | `id`                                            |
| `combos_loja_id_fkey`  | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE       |
| `check_combos_preco`   | CHECK | `preco > 0`                                     |
| `check_combos_periodo` | CHECK | `inicio IS NULL OR fim IS NULL OR fim > inicio` |

---

## Índices

| Nome                 | Colunas                  | Observação                            |
| -------------------- | ------------------------ | ------------------------------------- |
| `combos_pkey`        | `id`                     | PK                                    |
| `idx_combos_loja_id` | `loja_id`                | WHERE `deleted_at IS NULL`            |
| `idx_combos_ativos`  | `(loja_id, ativo)`       | WHERE `deleted_at IS NULL`            |
| `idx_combos_periodo` | `(loja_id, inicio, fim)` | Filtro de combos vigentes no cardápio |

---

## Regras de Negócio

- `preco_original` não é armazenado — calculado via `fn_rpc_calcular_economia_combo` somando os preços dos itens de cada grupo de escolha
- `inicio` e `fim` nulos = combo sempre disponível
- Um combo deve ter ao menos um grupo de escolha com ao menos uma opção — validado via RPC no momento da criação
- Soft delete: `deleted_at` é preenchido via RPC em cascata com todos os `combo_grupos` e `combo_grupo_opcoes`

---

## Relacionamentos

```
lojas (N:1)
  └── combos
        └── combo_grupos (1:N) — grupos de escolha do cliente
              └── combo_grupo_opcoes (1:N) — produtos disponíveis em cada grupo
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                           |
| ---------------- | ---------------------------------------- |
| `admin_master`   | Todos os combos                          |
| `gerente_master` | Todos os combos                          |
| `admin_loja`     | Combos da própria loja                   |
| `gerente_loja`   | Combos da própria loja                   |
| `staff_loja`     | Combos da própria loja                   |
| `entregador`     | Sem acesso                               |
| Público (anon)   | Combos ativos e vigentes de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                        | Operação | Descrição                                                                                       |
| --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_combos`   | SELECT   | Master e Gerente Master veem todos                                                              |
| `equipe_loja_pode_visualizar_combos`    | SELECT   | Admin/Gerente/Staff veem combos da própria loja (via `perfis.loja_id`)                          |
| `publico_pode_visualizar_combos_ativos` | SELECT   | Anon vê combos `ativo = true`, `deleted_at IS NULL` e dentro do período vigente de lojas ativas |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** `supabase.from('combos').select('*, combo_grupos(*, combo_grupo_opcoes(*))')` → RLS retorna apenas combos ativos e vigentes de lojas ativas
- **Painel da loja:** mesmo select → RLS filtra pela loja do usuário autenticado, incluindo inativos e com `deleted_at`
- **Painel master:** sem filtro — vê todos os combos de todas as lojas

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `loja_id` pertence ao usuário autenticado antes de executar qualquer operação.

| Nome da Função                   | Quem pode chamar         | Função                                                                                                                                                                                        |
| -------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_combo`             | admin_loja, gerente_loja | Valida ownership do `loja_id`. Valida `preco > 0` e período (`fim > inicio`). Cria combo, grupos e opções em uma única transação — bloqueia se nenhum grupo/opção for fornecido               |
| `fn_rpc_atualizar_combo`         | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual. Revalida `preco` e período após COALESCE antes de commitar              |
| `fn_rpc_ativar_desativar_combo`  | admin_loja, gerente_loja | Valida ownership. Alterna `ativo` — ao desativar, oculta o combo do cardápio sem alterar `deleted_at`                                                                                         |
| `fn_rpc_soft_delete_combo`       | admin_loja               | Valida ownership. Preenche `deleted_at` no combo e deleta em cascata todos os `combo_grupos` e `combo_grupo_opcoes` vinculados. Operação irreversível via interface                           |
| `fn_rpc_calcular_economia_combo` | admin_loja, gerente_loja | Valida ownership. Calcula e retorna o preço original (soma do menor preço de cada grupo de escolha) vs preço do combo para exibir a economia no painel — somente leitura via RPC, sem escrita |
