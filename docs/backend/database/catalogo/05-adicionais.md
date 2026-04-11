# Tabela: `adicionais`

Itens individuais dentro de um grupo de adicionais.

---

## Propósito

- Representa cada opção selecionável dentro de um grupo (ex: "Borda de Catupiry", "Molho Barbecue")
- Tem preço próprio — pode ser R$ 0,00 para adicionais sem custo extra
- `max_unidades` controla quantas unidades do mesmo adicional o cliente pode escolher

---

## Colunas

| Coluna         | Tipo        | Nullable | Default             | Descrição                                                                  |
| -------------- | ----------- | -------- | ------------------- | -------------------------------------------------------------------------- |
| `id`           | uuid        | NO       | `gen_random_uuid()` | PK                                                                         |
| `grupo_id`     | uuid        | NO       | —                   | FK → `grupos_adicionais.id`                                                |
| `nome`         | text        | NO       | —                   | Nome do adicional (ex: "Borda de Catupiry", "Coca-Cola 350ml")             |
| `descricao`    | text        | YES      | —                   | Descrição exibida ao cliente                                               |
| `preco`        | numeric     | NO       | `0`                 | Preço do adicional — `0` para sem custo extra                              |
| `max_unidades` | integer     | NO       | `1`                 | Máximo de unidades que o cliente pode selecionar deste item — `1` = normal |
| `ordem`        | integer     | NO       | `0`                 | Ordem de exibição dentro do grupo                                          |
| `ativo`        | boolean     | NO       | `true`              | Se está disponível para seleção                                            |
| `deleted_at`   | timestamptz | YES      | —                   | Soft delete                                                                |
| `created_at`   | timestamptz | NO       | `now()`             | Data de criação                                                            |
| `updated_at`   | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_adicionais_modtime`         |

---

## Constraints

| Nome                       | Tipo  | Colunas / Referência                                   |
| -------------------------- | ----- | ------------------------------------------------------ |
| `adicionais_pkey`          | PK    | `id`                                                   |
| `adicionais_grupo_id_fkey` | FK    | `grupo_id` → `grupos_adicionais(id)` ON DELETE CASCADE |
| `check_adicionais_preco`   | CHECK | `preco >= 0`                                           |
| `check_adicionais_max_un`  | CHECK | `max_unidades >= 1`                                    |

---

## Índices

| Nome                      | Colunas             | Observação                 |
| ------------------------- | ------------------- | -------------------------- |
| `adicionais_pkey`         | `id`                | PK                         |
| `idx_adicionais_grupo_id` | `(grupo_id, ordem)` | WHERE `deleted_at IS NULL` |

---

## Regras de Negócio

- `preco = 0` é válido — adicional sem custo extra (ex: "Sem cebola")
- `max_unidades = 1` → comportamento padrão (checkbox simples)
- `max_unidades > 1` → cliente pode escolher mais de uma unidade (ex: "Queijo extra" até 3x)
- O total de unidades selecionadas de todos os adicionais de um grupo deve respeitar `grupos_adicionais.max_selecao` — validado no frontend e na RPC de criação de pedido
- Soft delete: `deleted_at` é preenchido via RPC em vez de deletar

---

## Relacionamentos

```
grupos_adicionais (N:1)
  └── adicionais
```

---

## RLS (Row Level Security)

Acesso derivado do `grupo_id` — quem pode ver o grupo, pode ver seus adicionais.

| Cargo            | O que pode ver                                     |
| ---------------- | -------------------------------------------------- |
| `admin_master`   | Todos os adicionais                                |
| `gerente_master` | Todos os adicionais                                |
| `admin_loja`     | Adicionais dos grupos da própria loja              |
| `gerente_loja`   | Adicionais dos grupos da própria loja              |
| `staff_loja`     | Adicionais dos grupos da própria loja              |
| `entregador`     | Sem acesso                                         |
| Público (anon)   | Adicionais ativos de grupos ativos de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                            | Operação | Descrição                                                                                         |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_adicionais`   | SELECT   | Master e Gerente Master veem todos                                                                |
| `equipe_loja_pode_visualizar_adicionais`    | SELECT   | Admin/Gerente/Staff via JOIN em `grupos_adicionais.loja_id` (vinculado ao `perfis.loja_id`)       |
| `publico_pode_visualizar_adicionais_ativos` | SELECT   | Anon vê adicionais ativos (`ativo = true`, `deleted_at IS NULL`) de grupos ativos de lojas ativas |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** adicionais são incluídos via embedding: `grupos_adicionais(*, adicionais(*))` — RLS garante apenas ativos
- **Painel da loja:** `supabase.from('adicionais').select('*').eq('grupo_id', grupoId)` → RLS filtra pela loja do usuário autenticado

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `grupo_id` pertence a uma loja do usuário autenticado antes de executar qualquer operação.

| Nome da Função                      | Quem pode chamar         | Função                                                                                                                                                                                  |
| ----------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_adicional`            | admin_loja, gerente_loja | Valida ownership do `grupo_id` via JOIN em `grupos_adicionais.loja_id`. Valida `preco >= 0` e `max_unidades >= 1`. Cria o adicional                                                     |
| `fn_rpc_atualizar_adicional`        | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual. Revalida `preco` e `max_unidades` após COALESCE antes de commitar |
| `fn_rpc_ativar_desativar_adicional` | admin_loja, gerente_loja | Valida ownership. Alterna `ativo` — staff também pode chamar para pausar disponibilidade do item. Não altera `deleted_at`                                                               |
| `fn_rpc_reordenar_adicionais`       | admin_loja, gerente_loja | Valida ownership de todos os IDs do batch e que pertencem ao mesmo grupo. Atualiza `ordem` em uma única transação                                                                       |
| `fn_rpc_soft_delete_adicional`      | admin_loja               | Valida ownership. Preenche `deleted_at` no adicional. Operação irreversível via interface                                                                                               |
