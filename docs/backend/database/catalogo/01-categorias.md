# Tabela: `categorias`

Categorias do cardápio de uma loja. Organizadas em grupos visuais (ex: "Pizzas", "Bebidas").

---

## Propósito

- Agrupa produtos do cardápio em seções navegáveis
- O campo `grupo` define o agrupador visual de nível superior — texto livre, sem FK, sem recursão
- Categorias com mesmo `grupo` aparecem juntas no cardápio, ordenadas por `ordem_grupo` e `ordem`
- Controla disponibilidade por horário via `disponibilidade jsonb`

---

## Colunas

| Coluna             | Tipo        | Nullable | Default             | Descrição                                                                               |
| ------------------ | ----------- | -------- | ------------------- | --------------------------------------------------------------------------------------- |
| `id`               | uuid        | NO       | `gen_random_uuid()` | PK                                                                                      |
| `loja_id`          | uuid        | NO       | —                   | FK → `lojas.id`                                                                         |
| `nome`             | text        | NO       | —                   | Nome da categoria (ex: "Pizzas Tradicionais")                                           |
| `descricao`        | text        | YES      | —                   | Descrição exibida no cardápio                                                           |
| `imagem_url_light` | text        | YES      | —                   | URL da imagem da categoria otimizada para temas claros (light mode)                     |
| `imagem_url_dark`  | text        | YES      | —                   | URL da imagem da categoria otimizada para temas escuros (dark mode)                     |
| `grupo`            | text        | YES      | —                   | Agrupador visual (ex: "Pizzas") — texto livre, sem FK. `null` = categoria sem grupo     |
| `ordem_grupo`      | integer     | NO       | `0`                 | Ordem do grupo no cardápio — todas as categorias do mesmo grupo devem ter o mesmo valor |
| `ordem`            | integer     | NO       | `0`                 | Ordem da categoria dentro do grupo                                                      |
| `ativo`            | boolean     | NO       | `true`              | Se está visível no cardápio                                                             |
| `disponibilidade`  | jsonb       | NO       | `{}`                | Restrição de horário de exibição — vazio = sempre disponível                            |
| `deleted_at`       | timestamptz | YES      | —                   | Soft delete                                                                             |
| `created_at`       | timestamptz | NO       | `now()`             | Data de criação                                                                         |
| `updated_at`       | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_categorias_modtime`                      |

---

## Constraints

| Nome                      | Tipo | Colunas / Referência                      |
| ------------------------- | ---- | ----------------------------------------- |
| `categorias_pkey`         | PK   | `id`                                      |
| `categorias_loja_id_fkey` | FK   | `loja_id` → `lojas(id)` ON DELETE CASCADE |

---

## Índices

| Nome                        | Colunas                         | Observação                                  |
| --------------------------- | ------------------------------- | ------------------------------------------- |
| `categorias_pkey`           | `id`                            | PK                                          |
| `idx_categorias_loja_id`    | `loja_id`                       | WHERE `deleted_at IS NULL`                  |
| `idx_categorias_loja_ordem` | `(loja_id, ordem_grupo, ordem)` | Ordenação do cardápio completo              |
| `idx_categorias_grupo`      | `(loja_id, grupo)`              | Agrupamento visual e autocomplete no painel |

---

## JSONB: `disponibilidade`

Restringe a exibição da categoria a determinados horários ou dias. Vazio = sempre disponível.

```json
{
	"dias_semana": [1, 2, 3, 4, 5],
	"horario_inicio": "11:00",
	"horario_fim": "14:00"
}
```

> `dias_semana`: 0 = domingo, 1 = segunda, ..., 6 = sábado.

---

## Como o agrupamento funciona

O campo `grupo` é texto livre. O frontend agrupa as categorias pelo valor de `grupo` para renderizar o menu lateral e o scroll do cardápio.

```
grupo: "Pizzas"  ordem_grupo: 1
  └── "Pizzas Tradicionais"  ordem: 1
  └── "Pizzas Doces"         ordem: 2
  └── "Pizzas Especiais"     ordem: 3

grupo: "Bebidas"  ordem_grupo: 2
  └── "Sucos"                ordem: 1
  └── "Refrigerantes"        ordem: 2

grupo: null  (sem grupo)
  └── "Sobremesas"           ordem: 1
```

O painel admin sugere grupos já existentes via autocomplete ao criar/editar uma categoria, evitando duplicatas por erro de digitação. A listagem dos grupos disponíveis é feita via `fn_rpc_listar_grupos_da_loja`.

---

## Regras de Negócio

- `grupo` é texto livre — não é uma entidade separada, não tem FK
- Categorias com mesmo `grupo` devem ter o mesmo `ordem_grupo` — mantido via RPC
- `ativo = false` oculta a categoria e todos os seus produtos do cardápio público
- Soft delete: `deleted_at` é preenchido em vez de deletar; a RPC faz cascata em `produtos`

---

## Relacionamentos

```
lojas (N:1)
  └── categorias
        └── produtos (1:N)
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                                |
| ---------------- | --------------------------------------------- |
| `admin_master`   | Todas as categorias                           |
| `gerente_master` | Todas as categorias                           |
| `admin_loja`     | Categorias da própria loja                    |
| `gerente_loja`   | Categorias da própria loja                    |
| `staff_loja`     | Categorias da própria loja                    |
| `entregador`     | Sem acesso                                    |
| Público (anon)   | Categorias ativas de lojas com status `ativo` |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                            | Operação | Descrição                                                                  |
| ------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_categorias`   | SELECT   | Master e Gerente Master veem todas                                         |
| `equipe_loja_pode_visualizar_categorias`    | SELECT   | Admin/Gerente/Staff veem categorias da própria loja (via `perfis.loja_id`) |
| `publico_pode_visualizar_categorias_ativas` | SELECT   | Anon vê categorias ativas de lojas com `status = 'ativo'`                  |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** `supabase.from('categorias').select('*, produtos(*)')` → RLS retorna apenas categorias ativas de lojas ativas
- **Painel da loja:** mesmo select → RLS filtra pela `loja_id` do perfil autenticado, retornando todas (incluindo inativas)
- **Painel master:** sem filtro — vê todas as categorias de todas as lojas

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `loja_id` pertence ao usuário autenticado antes de executar qualquer operação.

| Nome da Função                      | Quem pode chamar         | Função                                                                                                                                                             |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fn_rpc_criar_categoria`            | admin_loja, gerente_loja | Valida ownership do `loja_id`. Cria categoria e sincroniza `ordem_grupo` de todas as categorias do mesmo grupo em uma única transação                              |
| `fn_rpc_atualizar_categoria`        | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual. Ressincroniza `ordem_grupo` se `grupo` mudou |
| `fn_rpc_ativar_desativar_categoria` | admin_loja, gerente_loja | Valida ownership. Alterna `ativo` — ao desativar, oculta a categoria e todos os produtos vinculados do cardápio público sem alterar `deleted_at`                   |
| `fn_rpc_reordenar_categorias`       | admin_loja, gerente_loja | Valida ownership de todos os IDs do batch. Atualiza `ordem` e `ordem_grupo` de múltiplas categorias em uma única transação                                         |
| `fn_rpc_soft_delete_categoria`      | admin_loja               | Valida ownership. Preenche `deleted_at` na categoria e em cascata em todos os produtos vinculados. Operação irreversível via interface                             |
| `fn_rpc_listar_grupos_da_loja`      | admin_loja, gerente_loja | Valida ownership do `loja_id`. Retorna valores distintos de `grupo` para autocomplete no painel — ignora registros com `deleted_at` preenchido                     |
