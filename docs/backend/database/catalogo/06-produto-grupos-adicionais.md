# Tabela: `produto_grupos_adicionais`

Vínculo N:N entre produtos e grupos de adicionais.

---

## Propósito

- Permite que um grupo de adicionais seja reutilizado em múltiplos produtos
- Controla a ordem de exibição dos grupos no modal de cada produto individualmente
- Sem esta tabela, cada produto teria seus próprios grupos — impossibilitando reutilização

---

## Colunas

| Coluna               | Tipo        | Nullable | Default             | Descrição                                                       |
| -------------------- | ----------- | -------- | ------------------- | --------------------------------------------------------------- |
| `id`                 | uuid        | NO       | `gen_random_uuid()` | PK                                                              |
| `produto_id`         | uuid        | NO       | —                   | FK → `produtos.id`                                              |
| `grupo_adicional_id` | uuid        | NO       | —                   | FK → `grupos_adicionais.id`                                     |
| `ordem`              | integer     | NO       | `0`                 | Ordem de exibição deste grupo no modal deste produto específico |
| `created_at`         | timestamptz | NO       | `now()`             | Data de criação                                                 |

> Sem `updated_at` — esta tabela registra apenas vínculos. Alterações viram delete + insert.

---

## Constraints

| Nome                             | Tipo   | Colunas / Referência                                             |
| -------------------------------- | ------ | ---------------------------------------------------------------- |
| `produto_grupos_adicionais_pkey` | PK     | `id`                                                             |
| `pga_produto_id_fkey`            | FK     | `produto_id` → `produtos(id)` ON DELETE CASCADE                  |
| `pga_grupo_adicional_id_fkey`    | FK     | `grupo_adicional_id` → `grupos_adicionais(id)` ON DELETE CASCADE |
| `pga_produto_grupo_unique`       | UNIQUE | `(produto_id, grupo_adicional_id)`                               |

---

## Índices

| Nome                             | Colunas               | Observação                                          |
| -------------------------------- | --------------------- | --------------------------------------------------- |
| `produto_grupos_adicionais_pkey` | `id`                  | PK                                                  |
| `idx_pga_produto_id`             | `(produto_id, ordem)` | Busca de grupos de um produto ordenados             |
| `idx_pga_grupo_adicional_id`     | `grupo_adicional_id`  | Verificar em quais produtos um grupo está vinculado |

---

## Regras de Negócio

- Um produto pode ter zero ou mais grupos vinculados
- Um grupo pode estar vinculado a zero ou mais produtos
- A combinação `(produto_id, grupo_adicional_id)` é única — não pode vincular o mesmo grupo duas vezes ao mesmo produto (garantido pela UNIQUE constraint)
- `ordem` é por vínculo — o mesmo grupo pode ter ordem diferente em produtos diferentes
- Sem soft delete — ao remover o vínculo, o registro é deletado fisicamente. O grupo e o produto continuam existindo
- A RPC de soft delete de `grupos_adicionais` remove automaticamente todos os vínculos desta tabela

---

## Relacionamentos

```
produtos (N:1)
grupos_adicionais (N:1)
  └── produto_grupos_adicionais (tabela de junção N:N)
```

---

## RLS (Row Level Security)

Acesso derivado do `produto_id` — quem pode ver o produto, pode ver seus vínculos.

| Cargo            | O que pode ver                              |
| ---------------- | ------------------------------------------- |
| `admin_master`   | Todos os vínculos                           |
| `gerente_master` | Todos os vínculos                           |
| `admin_loja`     | Vínculos de produtos da própria loja        |
| `gerente_loja`   | Vínculos de produtos da própria loja        |
| `staff_loja`     | Vínculos de produtos da própria loja        |
| `entregador`     | Sem acesso                                  |
| Público (anon)   | Vínculos de produtos ativos de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                                           | Operação | Descrição                                                                          |
| ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_produto_grupos_adicionais`   | SELECT   | Master e Gerente Master veem todos                                                 |
| `equipe_loja_pode_visualizar_produto_grupos_adicionais`    | SELECT   | Admin/Gerente/Staff via JOIN em `produtos.loja_id` (vinculado ao `perfis.loja_id`) |
| `publico_pode_visualizar_produto_grupos_adicionais_ativos` | SELECT   | Anon via JOIN em `produtos.loja_id` e `lojas.status = 'ativo'`                     |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** incluído via embedding no select de produtos: `produto_grupos_adicionais(*, grupo_adicional_id(*, adicionais(*)))` — RLS garante isolamento
- **Painel da loja:** mesmo embedding — RLS filtra pela loja do usuário autenticado

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `produto_id` pertence a uma loja do usuário autenticado antes de executar qualquer operação.

| Nome da Função                       | Quem pode chamar         | Função                                                                                                                                                                        |
| ------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_vincular_grupo_adicional`    | admin_loja, gerente_loja | Valida ownership do `produto_id` e do `grupo_adicional_id`, garantindo que ambos pertencem à mesma loja. Bloqueia vínculo duplicado via constraint `pga_produto_grupo_unique` |
| `fn_rpc_desvincular_grupo_adicional` | admin_loja, gerente_loja | Valida ownership. Remove o registro de junção (hard delete do vínculo) — o grupo e o produto continuam existindo                                                              |
| `fn_rpc_reordenar_grupos_do_produto` | admin_loja, gerente_loja | Valida ownership de todos os IDs do batch e que pertencem ao mesmo produto. Atualiza `ordem` dos vínculos em uma única transação                                              |
