# Tabela: `lgpd_solicitacoes_exclusao`

Solicitações de exclusão de dados pessoais — direito ao esquecimento previsto no Art. 18 da LGPD.

---

## Propósito

- Registra pedidos formais de exclusão de dados feitos por usuários
- Permite rastrear o ciclo de vida de cada solicitação (`pendente` → `em_analise` → `concluida`)
- Preserva snapshot do email e nome mesmo após exclusão do perfil — para fins de auditoria
- Garante conformidade com o prazo legal de resposta (15 dias úteis — LGPD Art. 18 §3º)

---

## Colunas

| Coluna           | Tipo        | Nullable | Default             | Descrição                                                                          |
| ---------------- | ----------- | -------- | ------------------- | ---------------------------------------------------------------------------------- |
| `id`             | uuid        | NO       | `gen_random_uuid()` | PK                                                                                 |
| `perfil_id`      | uuid        | YES      | —                   | FK → `perfis.id` — quem solicitou (`null` após exclusão do perfil)                 |
| `usuario_email`  | text        | NO       | —                   | Email snapshot — preservado mesmo após exclusão do perfil                          |
| `usuario_nome`   | text        | NO       | —                   | Nome snapshot — preservado mesmo após exclusão do perfil                           |
| `status`         | text        | NO       | `pendente`          | Status atual: `pendente`, `em_analise`, `concluida`, `cancelada`                   |
| `motivo`         | text        | YES      | —                   | Motivo informado pelo usuário (opcional)                                           |
| `observacoes`    | text        | YES      | —                   | Observações internas do admin — **nunca exibido ao usuário solicitante**           |
| `processada_por` | uuid        | YES      | —                   | FK → `perfis.id` — admin que processou a solicitação                               |
| `processada_em`  | timestamptz | YES      | —                   | Quando foi processada — `null` se ainda pendente                                   |
| `created_at`     | timestamptz | NO       | `now()`             | Data da solicitação — marco legal para contagem do prazo de 15 dias úteis          |
| `updated_at`     | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_lgpd_solicitacoes_exclusao_modtime` |

---

## Constraints

| Nome                                    | Tipo  | Colunas / Referência                                             |
| --------------------------------------- | ----- | ---------------------------------------------------------------- |
| `lgpd_solicitacoes_exclusao_pkey`       | PK    | `id`                                                             |
| `lgpd_solicitacoes_perfil_fkey`         | FK    | `perfil_id` → `perfis(id)` ON DELETE SET NULL                    |
| `lgpd_solicitacoes_processada_por_fkey` | FK    | `processada_por` → `perfis(id)` ON DELETE SET NULL               |
| `check_lgpd_solicitacoes_status`        | CHECK | `status IN ('pendente', 'em_analise', 'concluida', 'cancelada')` |

> `ON DELETE SET NULL` em `perfil_id` — se o perfil for deletado, o registro da solicitação é preservado com `perfil_id = null`, mas `usuario_email` e `usuario_nome` continuam como prova.

---

## Índices

| Nome                               | Colunas           | Observação                               |
| ---------------------------------- | ----------------- | ---------------------------------------- |
| `lgpd_solicitacoes_exclusao_pkey`  | `id`              | PK                                       |
| `idx_lgpd_solicitacoes_perfil_id`  | `perfil_id`       | Busca de solicitações por usuário        |
| `idx_lgpd_solicitacoes_status`     | `status`          | Filtro por status — monitorar pendentes  |
| `idx_lgpd_solicitacoes_created_at` | `created_at DESC` | Ordenação cronológica, controle de prazo |

---

## Status

| Valor        | Descrição                                                         |
| ------------ | ----------------------------------------------------------------- |
| `pendente`   | Solicitação recebida, ainda não analisada                         |
| `em_analise` | Admin iniciou a análise                                           |
| `concluida`  | Dados excluídos conforme solicitado                               |
| `cancelada`  | Solicitação cancelada (pelo usuário ou por impossibilidade legal) |

**Fluxo:**

```
pendente → em_analise → concluida
                      → cancelada
```

---

## Fluxo de Processamento

```
1. Usuário solicita exclusão via painel (Perfil → Segurança → Excluir minha conta)
2. RPC cria registro com status = pendente, salva snapshot de email e nome
3. Admin Master recebe notificação no painel
4. Admin muda para em_analise, verifica pendências (assinatura ativa, pedidos em aberto)
5. Se aprovado: RPC executa soft delete em cascata nos dados pessoais do perfil
6. Registro atualizado: status = concluida, processada_em, processada_por
7. Se recusado (ex: assinatura ativa): status = cancelada, observacoes preenchido
```

---

## Regras de Negócio

- Um usuário só pode ter **uma solicitação ativa** por vez (`status IN ('pendente', 'em_analise')`) — validado via RPC
- `usuario_email` e `usuario_nome` são snapshots obrigatórios — copiados de `perfis` no momento da criação
- Solicitação com `status = concluida` não pode ser revertida
- Assinatura ativa pode ser motivo de recusa — usuário deve cancelar antes
- **Prazo legal: 15 dias úteis** (LGPD Art. 18 §3º) — monitorado pelo painel master via `created_at`
- Após conclusão, o sistema executa soft delete nos dados pessoais — nunca exclusão física imediata
- `observacoes` é campo interno — **nunca exibido ao usuário solicitante**

---

## Relacionamentos

```
perfis (N:1) — solicitante
perfis (N:1) — quem processou
  └── lgpd_solicitacoes_exclusao
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver               |
| ---------------- | ---------------------------- |
| `admin_master`   | Todas as solicitações        |
| `gerente_master` | Todas as solicitações        |
| `admin_loja`     | Apenas a própria solicitação |
| demais cargos    | Apenas a própria solicitação |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política               | Operação | Descrição                                                                  |
| ------------------------------ | -------- | -------------------------------------------------------------------------- |
| `lgpd_exclusao_select_master`  | SELECT   | Master e Gerente Master veem todas as solicitações                         |
| `lgpd_exclusao_select_proprio` | SELECT   | Demais cargos veem apenas a própria solicitação (`perfil_id = auth.uid()`) |

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente o cargo do chamador via `auth.uid()`.

| Nome da Função                         | Quem pode chamar             | Função                                                                                                                                                                                                                                                                |
| -------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_solicitacao_exclusao`    | Próprio usuário              | Valida que não existe solicitação ativa (`status IN ('pendente', 'em_analise')`) para o mesmo `perfil_id` — bloqueia duplicata. Copia `usuario_email` e `usuario_nome` de `perfis` como snapshot imutável. Insere com `status = 'pendente'` em transação única        |
| `fn_rpc_cancelar_solicitacao_exclusao` | Próprio usuário              | Valida que `perfil_id = auth.uid()`. Bloqueia cancelamento se `status = 'concluida'` ou `'cancelada'`. Atualiza `status = 'cancelada'` apenas se `status IN ('pendente', 'em_analise')` — transação única                                                             |
| `fn_rpc_iniciar_analise_exclusao`      | admin_master, gerente_master | Valida cargo do chamador. Bloqueia se `status != 'pendente'`. Atualiza `status = 'em_analise'`, preenche `processada_por` e `processada_em` — transação única                                                                                                         |
| `fn_rpc_concluir_exclusao`             | admin_master                 | Valida cargo `admin_master` exclusivamente. Bloqueia se `status != 'em_analise'`. Executa soft delete em cascata nos dados pessoais do perfil (nullifica campos sensíveis em `perfis`, marca `deleted_at`). Atualiza `status = 'concluida'` — tudo em transação única |
| `fn_rpc_recusar_exclusao`              | admin_master, gerente_master | Valida cargo do chamador. Bloqueia se `status = 'concluida'`. Atualiza `status = 'cancelada'` e preenche `observacoes` com o motivo da recusa — campo interno, nunca exibido ao usuário. Transação única                                                              |
| `fn_rpc_listar_solicitacoes_exclusao`  | admin_master, gerente_master | Valida cargo do chamador. Retorna solicitações com filtros de `status` e período (`created_at`). Inclui dias decorridos desde `created_at` para monitorar o prazo legal de 15 dias úteis (LGPD Art. 18 §3º). Suporta paginação via `p_limit` e `p_offset`             |
