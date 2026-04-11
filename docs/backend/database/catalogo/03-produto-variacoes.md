# Tabela: `produto_variacoes`

Variações de um produto — tamanhos, sabores base, formatos. Cada variação tem seu próprio preço.

---

## Propósito

- É onde o preço do produto vive — o produto em si não tem preço, a variação tem
- Mínimo de 1 variação por produto (obrigatório)
- Quando há apenas 1 variação, o cliente não vê a seleção — o preço é exibido diretamente
- Quando há múltiplas variações, o cliente escolhe uma antes de adicionar ao carrinho
- O preço exibido no cardápio como "A partir de R$ X" é o menor `preco` entre as variações ativas

---

## Colunas

| Coluna       | Tipo        | Nullable | Default             | Descrição                                                                 |
| ------------ | ----------- | -------- | ------------------- | ------------------------------------------------------------------------- |
| `id`         | uuid        | NO       | `gen_random_uuid()` | PK                                                                        |
| `produto_id` | uuid        | NO       | —                   | FK → `produtos.id`                                                        |
| `nome`       | text        | NO       | —                   | Nome da variação (ex: "Pequena", "Média", "Grande", "Tradicional")        |
| `preco`      | numeric     | NO       | `0`                 | Preço base da variação                                                    |
| `ordem`      | integer     | NO       | `0`                 | Ordem de exibição                                                         |
| `ativo`      | boolean     | NO       | `true`              | Se está disponível para seleção                                           |
| `deleted_at` | timestamptz | YES      | —                   | Soft delete                                                               |
| `created_at` | timestamptz | NO       | `now()`             | Data de criação                                                           |
| `updated_at` | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_produto_variacoes_modtime` |

---

## Constraints

| Nome                                | Tipo  | Colunas / Referência                            |
| ----------------------------------- | ----- | ----------------------------------------------- |
| `produto_variacoes_pkey`            | PK    | `id`                                            |
| `produto_variacoes_produto_id_fkey` | FK    | `produto_id` → `produtos(id)` ON DELETE CASCADE |
| `check_produto_variacoes_preco`     | CHECK | `preco >= 0`                                    |

---

## Índices

| Nome                            | Colunas               | Observação                 |
| ------------------------------- | --------------------- | -------------------------- |
| `produto_variacoes_pkey`        | `id`                  | PK                         |
| `idx_produto_variacoes_produto` | `(produto_id, ordem)` | WHERE `deleted_at IS NULL` |

---

## Regras de Negócio

- Todo produto deve ter **ao menos uma variação ativa** — validado na RPC de criação e de deleção
- `preco = 0` é válido para produtos gratuitos ou brindes
- Ao desativar a última variação ativa de um produto, o produto também é automaticamente desativado via RPC em uma única transação
- Soft delete: `deleted_at` é preenchido em vez de deletar
- A RPC de soft delete bloqueia se a variação for a única do produto (produto ficaria sem preço)

---

## Relacionamentos

```
produtos (N:1)
  └── produto_variacoes

produto_variacoes
  └── combo_grupo_opcoes.variacao_id (opcional — fixa a variação em uma opção de combo)
```

---

## RLS (Row Level Security)

Acesso derivado do `produto_id` — quem pode ver o produto, pode ver suas variações.

| Cargo            | O que pode ver                        |
| ---------------- | ------------------------------------- |
| `admin_master`   | Todas as variações                    |
| `gerente_master` | Todas as variações                    |
| `admin_loja`     | Variações de produtos da própria loja |
| `gerente_loja`   | Variações de produtos da própria loja |
| `staff_loja`     | Variações de produtos da própria loja |
| `entregador`     | Sem acesso                            |
| Público (anon)   | Variações ativas de produtos ativos   |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                                   | Operação | Descrição                                                                                          |
| -------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_produto_variacoes`   | SELECT   | Master e Gerente Master veem todas                                                                 |
| `equipe_loja_pode_visualizar_produto_variacoes`    | SELECT   | Admin/Gerente/Staff via JOIN em `produtos.loja_id` (vinculado ao `perfis.loja_id`)                 |
| `publico_pode_visualizar_produto_variacoes_ativas` | SELECT   | Anon vê variações ativas (`ativo = true`, `deleted_at IS NULL`) de produtos ativos de lojas ativas |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** variações são incluídas no select de produtos via embedding: `select('*, produto_variacoes(*)')` — RLS garante apenas variações ativas
- **Painel da loja:** mesmo embedding — RLS filtra pela loja do usuário autenticado, retornando também variações inativas/deletadas para gestão

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `produto_id` pertence a uma loja do usuário autenticado antes de executar qualquer operação.

| Nome da Função                | Quem pode chamar         | Função                                                                                                                                                            |
| ----------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_variacao`       | admin_loja, gerente_loja | Valida ownership do `produto_id` via JOIN em `produtos.loja_id`. Valida `preco >= 0`. Cria a variação                                                             |
| `fn_rpc_atualizar_variacao`   | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual. Revalida `preco >= 0` após COALESCE         |
| `fn_rpc_reordenar_variacoes`  | admin_loja, gerente_loja | Valida ownership de todos os IDs do batch e que pertencem ao mesmo produto. Atualiza `ordem` em uma única transação                                               |
| `fn_rpc_desativar_variacao`   | admin_loja, gerente_loja | Valida ownership. Desativa a variação — se for a última ativa do produto, desativa o produto também em uma única transação. Não altera `deleted_at`               |
| `fn_rpc_soft_delete_variacao` | admin_loja               | Valida ownership. Bloqueia se for a única variação do produto (produto ficaria sem preço). Preenche `deleted_at` na variação. Operação irreversível via interface |
