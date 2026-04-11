# Tabela: `roles`

Catálogo fixo de cargos do sistema. Cada registro define um nível de acesso e a qual painel o usuário pertence. Populada via seed — não editável pelo usuário.

---

## Propósito

- Substitui o antigo ENUM `cargo` — agora os cargos são registros em tabela, facilitando extensibilidade futura
- Define a hierarquia de acesso e o painel onde cada cargo opera
- É a referência para `perfis.role_id` e `role_permissoes.role_id`
- Permite adicionar novos cargos sem `ALTER TYPE` — basta inserir um novo registro

---

## Colunas

| Coluna         | Tipo        | Nullable | Default             | Descrição                                                                 |
| -------------- | ----------- | -------- | ------------------- | ------------------------------------------------------------------------- |
| `id`           | uuid        | NO       | `gen_random_uuid()` | PK                                                                        |
| `slug`         | text        | NO       | —                   | Identificador único do cargo — usado no código (`admin_master`, etc.)     |
| `nome`         | text        | NO       | —                   | Nome legível para exibir na UI (ex: "Administrador Master")               |
| `descricao`    | text        | YES      | —                   | Descrição do cargo                                                        |
| `permissoes`   | jsonb       | NO       | `'[]'::jsonb`       | Matriz de permissões embutida (Array de strings, ex: `["pedidos:ler"]`)   |
| `painel`       | text        | NO       | —                   | Painel onde o cargo opera — `master` ou `loja`                            |
| `nivel`        | integer     | NO       | —                   | Nível hierárquico (1 = mais alto). Usado para impedir escalação de cargo  |
| `acesso_total` | boolean     | NO       | `false`             | Se `true`, `temPermissao()` sempre retorna `true` — sem consulta ao banco |
| `ativo`        | boolean     | NO       | `true`              | Permite desativar um cargo sem remover do banco                           |
| `created_at`   | timestamptz | NO       | `now()`             | Data de criação                                                           |
| `updated_at`   | timestamptz | NO       | `now()`             | Atualizado via trigger quando o nome, descrição ou status ativo mudar     |

---

## Constraints

| Nome              | Tipo   | Colunas / Referência           |
| ----------------- | ------ | ------------------------------ |
| `roles_pkey`      | PK     | `id`                           |
| `roles_slug_key`  | UNIQUE | `slug`                         |
| `ck_roles_painel` | CHECK  | `painel IN ('master', 'loja')` |
| `ck_roles_nivel`  | CHECK  | `nivel >= 1`                   |

---

## Índices

| Nome               | Colunas  | Observação                                |
| ------------------ | -------- | ----------------------------------------- |
| `roles_pkey`       | `id`     | PK                                        |
| `roles_slug_key`   | `slug`   | UNIQUE — lookup por slug no código        |
| `idx_roles_painel` | `painel` | Filtra cargos por painel                  |
| `idx_roles_ativos` | `ativo`  | WHERE `ativo = true` — cargos disponíveis |

---

## Seed (6 registros fixos)

| slug             | nome                  | painel   | nivel | acesso_total | descricao                                         |
| ---------------- | --------------------- | -------- | ----- | ------------ | ------------------------------------------------- |
| `admin_master`   | Administrador Master  | `master` | 1     | `true`       | Dono da plataforma — acesso total ao sistema      |
| `gerente_master` | Gerente Master        | `master` | 2     | `false`      | Equipe interna da plataforma                      |
| `admin_loja`     | Administrador da Loja | `loja`   | 3     | `true`       | Dono do delivery — acesso total ao painel da loja |
| `gerente_loja`   | Gerente da Loja       | `loja`   | 4     | `false`      | Administrador operacional da loja                 |
| `staff_loja`     | Equipe da Loja        | `loja`   | 5     | `false`      | Funcionário (caixa, cozinha)                      |
| `entregador`     | Entregador            | `loja`   | 6     | `false`      | Motoboy — acesso restrito às suas entregas        |

---

## Hierarquia e Nível

O campo `nivel` define a hierarquia:

```
nivel 1 → admin_master       (pode gerenciar todos abaixo)
nivel 2 → gerente_master     (pode ser gerenciado pelo admin_master)
nivel 3 → admin_loja         (pode gerenciar todos de nível >= 4 na sua empresa)
nivel 4 → gerente_loja       (pode ser gerenciado pelo admin_loja)
nivel 5 → staff_loja         (pode ser gerenciado por admin_loja e gerente_loja)
nivel 6 → entregador         (pode ser gerenciado por admin_loja e gerente_loja)
```

**Regra anti-escalação:** nenhum usuário pode criar ou promover outro para um cargo com `nivel` menor ou igual ao seu.

---

## Regras de Negócio

- Os registros são fixos — apenas o `admin_master` pode criar novos cargos (via seed ou painel futuro)
- O `slug` é usado como referência no código (ex: `if (role.slug === 'admin_master')`)
- `acesso_total = true` dispensa a consulta ao array de permissões, dando passe livre.
- `ativo = false` impede que novos perfis sejam criados com essa role — perfis existentes mantêm o cargo
- Não tem `deleted_at` — roles nunca são deletadas, apenas desativadas

---

## Relacionamentos

```
roles
  └── perfis.role_id (1:N) — cada perfil tem uma role, herdando seu array de permissões JSONB
```

---

## Server Routes (Nitro)

| Route                                   | Método | Quem pode chamar | Descrição                                                           |
| --------------------------------------- | ------ | ---------------- | ------------------------------------------------------------------- |
| `server/api/admin/roles/index.get.ts`   | GET    | admin_master     | Lista todos os cargos e suas permissões JSONB                       |
| `server/api/admin/roles/index.post.ts`  | POST   | admin_master     | Cria um novo cargo definindo o JSONB de permissões                  |
| `server/api/admin/roles/[id].put.ts`    | PUT    | admin_master     | Atualiza `nome`, `descricao`, `ativo` ou o array JSONB `permissoes` |
| `server/api/admin/roles/[id].delete.ts` | DELETE | admin_master     | Desativa um cargo (nunca deleta se houver perfis vinculados)        |

---

## RLS (Row Level Security)

| Política                            | Operação | Descrição                             |
| ----------------------------------- | -------- | ------------------------------------- |
| `autenticado_pode_visualizar_roles` | SELECT   | Qualquer usuário autenticado pode ler |

> Sem políticas de escrita — tabela é readonly via seed/RPC do `admin_master`.
