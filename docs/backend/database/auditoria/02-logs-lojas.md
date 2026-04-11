# Tabela: `logs_lojas`

Log de auditoria imutável de ações realizadas no contexto de uma loja — painel `/admin/*`.

---

## Propósito

- Rastreia todas as ações relevantes feitas por usuários no painel admin da loja
- Registra impersonation — quando o Master opera em nome da loja
- Armazena snapshots de nome, email e cargo do usuário no momento da ação
- Imutável — nunca atualizado nem deletado

---

## Colunas

| Coluna                | Tipo        | Nullable | Default             | Descrição                                                                               |
| --------------------- | ----------- | -------- | ------------------- | --------------------------------------------------------------------------------------- |
| `id`                  | uuid        | NO       | `gen_random_uuid()` | PK                                                                                      |
| `loja_id`             | uuid        | NO       | —                   | FK → `lojas.id` — loja onde a ação ocorreu                                              |
| `perfil_id`           | uuid        | YES      | —                   | FK → `perfis.id` — quem executou (`null` se sistema/job)                                |
| `usuario_email`       | text        | YES      | —                   | Email snapshot — preservado mesmo após exclusão do perfil                               |
| `usuario_nome`        | text        | YES      | —                   | Nome snapshot                                                                           |
| `usuario_cargo`       | text        | YES      | —                   | Cargo snapshot no momento da ação                                                       |
| `acao`                | text        | NO       | —                   | Ação executada (ex: `atualizar_status_pedido`, `criar_produto`, `editar_loja`)          |
| `tabela`              | text        | YES      | —                   | Tabela afetada — `null` se ação sem tabela                                              |
| `registro_id`         | uuid        | YES      | —                   | ID do registro afetado                                                                  |
| `dados_antes`         | jsonb       | YES      | —                   | Estado anterior do registro (apenas campos alterados — sem dados sensíveis)             |
| `dados_depois`        | jsonb       | YES      | —                   | Estado posterior do registro                                                            |
| `ip`                  | text        | YES      | —                   | IP da requisição — coletado no servidor, nunca no frontend                              |
| `user_agent`          | text        | YES      | —                   | User-Agent do cliente                                                                   |
| `tipo_impersonation`  | text        | YES      | —                   | `null` = ação normal / `master` = ação feita pelo Master em impersonation               |
| `tinha_permissao_cud` | boolean     | NO       | `true`              | Se o usuário tinha permissão CUD no momento — relevante para impersonation modo leitura |
| `contexto`            | jsonb       | NO       | `{}`                | Metadados extras livres                                                                 |
| `created_at`          | timestamptz | NO       | `now()`             | Data da ação — imutável                                                                 |

> Sem `updated_at` e sem `deleted_at` — registro imutável, append-only.

---

## Constraints

| Nome                             | Tipo  | Colunas / Referência                                          |
| -------------------------------- | ----- | ------------------------------------------------------------- |
| `logs_lojas_pkey`                | PK    | `id`                                                          |
| `logs_lojas_loja_id_fkey`        | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE                     |
| `logs_lojas_perfil_id_fkey`      | FK    | `perfil_id` → `perfis(id)` ON DELETE SET NULL                 |
| `check_logs_lojas_impersonation` | CHECK | `tipo_impersonation = 'master' OR tipo_impersonation IS NULL` |

---

## Índices

| Nome                             | Colunas                 | Observação                                 |
| -------------------------------- | ----------------------- | ------------------------------------------ |
| `logs_lojas_pkey`                | `id`                    | PK                                         |
| `idx_logs_lojas_loja_id`         | `loja_id`               | Busca de logs por loja                     |
| `idx_logs_lojas_perfil_id`       | `perfil_id`             | Busca de logs por usuário                  |
| `idx_logs_lojas_acao`            | `(loja_id, acao)`       | Filtro por tipo de ação dentro de uma loja |
| `idx_logs_lojas_tabela_registro` | `(tabela, registro_id)` | Histórico de um registro específico        |
| `idx_logs_lojas_impersonation`   | `tipo_impersonation`    | WHERE `tipo_impersonation IS NOT NULL`     |
| `idx_logs_lojas_created_at`      | `created_at DESC`       | Ordenação cronológica                      |

---

## Valores de `acao` (referência)

Não é um ENUM — é `text` livre. Convenção: `verbo_substantivo` em snake_case.

| Ação                      | Descrição                           |
| ------------------------- | ----------------------------------- |
| `criar_produto`           | Produto criado no catálogo          |
| `atualizar_produto`       | Dados do produto alterados          |
| `desativar_produto`       | Produto desativado no cardápio      |
| `soft_delete_produto`     | Produto excluído (soft delete)      |
| `criar_categoria`         | Categoria criada                    |
| `reordenar_cardapio`      | Ordem do cardápio alterada          |
| `atualizar_loja`          | Configurações da loja alteradas     |
| `atualizar_horarios`      | Horários de funcionamento alterados |
| `atualizar_status_pedido` | Status de um pedido alterado        |
| `cancelar_pedido`         | Pedido cancelado                    |
| `criar_promocao`          | Promoção criada                     |
| `desativar_promocao`      | Promoção desativada                 |
| `convidar_membro`         | Membro convidado para a equipe      |
| `remover_membro`          | Membro removido da equipe           |

---

## Visibilidade de logs de impersonation

### Modo Leitura (`tinha_permissao_cud = false`)

O Master navega pelo painel sem fazer escritas. O log é registrado mas **visível apenas para o Master** — o `admin_loja` não sabe que está sendo observado.

| Quem acessa          | Quem é acessado | Quem vê o log           |
| -------------------- | --------------- | ----------------------- |
| `admin_master` (R)   | qualquer loja   | Apenas `admin_master`   |
| `gerente_master` (R) | qualquer loja   | Apenas `gerente_master` |

### Modo CUD (`tinha_permissao_cud = true`)

O Master tem permissão de escrita aprovada pelo titular. O log é **visível para ambos**.

| Quem acessa            | Quem é acessado | Quem vê o log                   |
| ---------------------- | --------------- | ------------------------------- |
| `admin_master` (CUD)   | qualquer loja   | `admin_master` + `admin_loja`   |
| `gerente_master` (CUD) | qualquer loja   | `gerente_master` + `admin_loja` |

> `tinha_permissao_cud` registra o modo no momento da ação — nunca alterado.

---

## Regras de Negócio

- Registro **nunca é atualizado nem deletado** — append-only
- `perfil_id = null` é válido para ações automáticas do sistema (jobs, triggers)
- `usuario_email`, `usuario_nome` e `usuario_cargo` são snapshots obrigatórios quando `perfil_id` está preenchido
- `dados_antes` e `dados_depois` omitem campos sensíveis
- `ip` e `user_agent` são **obrigatórios** para ações de usuários autenticados — coletados no servidor Nuxt
- `ON DELETE CASCADE` em `loja_id` — logs de uma loja excluída são removidos junto

---

## Relacionamentos

```
lojas (N:1)
perfis (N:1, opcional)
  └── logs_lojas (append-only)
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                                                                     |
| ---------------- | ---------------------------------------------------------------------------------- |
| `admin_master`   | Todos os logs (incluindo logs de impersonation modo leitura onde é o solicitante)  |
| `gerente_master` | Todos os logs                                                                      |
| `admin_loja`     | Logs da própria loja onde `tipo_impersonation IS NULL` + logs CUD onde é o titular |
| `gerente_loja`   | Logs da própria loja onde `tipo_impersonation IS NULL`                             |
| `staff_loja`     | Sem acesso                                                                         |
| `entregador`     | Sem acesso                                                                         |

> Logs de impersonation em **modo leitura** (`tinha_permissao_cud = false`) são visíveis **apenas para o solicitante** — o `admin_loja` não os vê.

> Apenas INSERT via **RPC com SECURITY DEFINER** — nunca UPDATE ou DELETE.

### Políticas

| Nome da Política           | Operação | Descrição                                                                                                                                                  |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logs_lojas_select_master` | SELECT   | Master e Gerente Master veem todos os logs                                                                                                                 |
| `logs_lojas_select_loja`   | SELECT   | Admin/Gerente Loja veem logs da própria loja sem impersonation (`tipo_impersonation IS NULL`) + logs CUD onde são o titular (`tinha_permissao_cud = true`) |

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER`. A função `fn_rpc_registrar_log_loja` é chamada internamente pelas RPCs de CUD da loja — nunca diretamente pelo cliente.

| Nome da Função                          | Quem pode chamar                                       | Função                                                                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_registrar_log_loja`             | Sistema (todas RPCs)                                   | Insere um registro append-only com snapshot de `usuario_email`, `usuario_nome` e `usuario_cargo` copiados de `perfis` no momento da chamada. Preenche `tipo_impersonation` e `tinha_permissao_cud` conforme contexto da sessão. Nunca exposta ao cliente |
| `fn_rpc_listar_logs_loja`               | admin_loja, gerente_loja, admin_master, gerente_master | Valida que o chamador pertence à loja (ou é Master). Retorna logs com filtros de `acao`, `perfil_id`, `tabela` e período. Exclui automaticamente logs de impersonation modo leitura quando o chamador é o `admin_loja`                                   |
| `fn_rpc_buscar_historico_registro_loja` | admin_loja, admin_master                               | Valida ownership da loja. Retorna todos os logs de um par `(tabela, registro_id)` dentro da loja, ordenados por `created_at ASC` — reconstrói o histórico completo de alterações de um registro                                                          |
