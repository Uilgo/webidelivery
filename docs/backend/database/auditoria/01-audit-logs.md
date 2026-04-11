# Tabela: `audit_logs`

Registro imutável de ações sensíveis de nível de plataforma. Trilha de auditoria global do sistema.

---

## Propósito

- Registra toda ação relevante feita por usuários autenticados em contexto de plataforma (login, signup, disputes, impersonation)
- Armazena IP e user_agent de cada ação — prova de uso em disputes (chargebacks)
- Nunca é deletado — registro imutável append-only
- Alimentado exclusivamente via RPC com SECURITY DEFINER — nunca pelo cliente

> Ações do painel da loja ficam em `logs_lojas`, não aqui.

---

## Colunas

| Coluna         | Tipo        | Nullable | Default             | Descrição                                                                                                                                                  |
| -------------- | ----------- | -------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | uuid        | NO       | `gen_random_uuid()` | PK                                                                                                                                                         |
| `perfil_id`    | uuid        | YES      | —                   | FK → `perfis.id` — quem executou a ação (`null` se sistema/webhook)                                                                                        |
| `acao`         | text        | NO       | —                   | Ação executada (ex: `login`, `cancelar_assinatura`, `impersonation_inicio`)                                                                                |
| `tabela`       | text        | YES      | —                   | Tabela afetada — `null` se ação sem tabela                                                                                                                 |
| `registro_id`  | uuid        | YES      | —                   | ID do registro afetado                                                                                                                                     |
| `dados_antes`  | jsonb       | YES      | —                   | Estado anterior do registro (apenas campos alterados — sem dados sensíveis)                                                                                |
| `dados_depois` | jsonb       | YES      | —                   | Estado posterior do registro                                                                                                                               |
| `ip`           | text        | YES      | —                   | IP da requisição — extraído no servidor (Nuxt), nunca no frontend                                                                                          |
| `user_agent`   | text        | YES      | —                   | User-Agent do cliente — prova de dispositivo/navegador em disputes                                                                                         |
| `origem`       | text        | NO       | `sistema`           | Origem da ação: `usuario`, `sistema`, `webhook_gateway`, `impersonation` — não tem CHECK constraint no banco, valores controlados via Zod no servidor Nuxt |
| `contexto`     | jsonb       | NO       | `{}`                | Metadados extras livres (motivo, stripe_event_id, session_id, etc)                                                                                         |
| `created_at`   | timestamptz | NO       | `now()`             | Data do evento — imutável                                                                                                                                  |

> Sem `updated_at` e sem `deleted_at` — registro imutável, nunca atualizado nem deletado.

---

## Constraints

| Nome                        | Tipo | Colunas / Referência                          |
| --------------------------- | ---- | --------------------------------------------- |
| `audit_logs_pkey`           | PK   | `id`                                          |
| `audit_logs_perfil_id_fkey` | FK   | `perfil_id` → `perfis(id)` ON DELETE SET NULL |

> **Sem CHECK constraint em `origem`** — seguindo o mesmo padrão de `gateway_provider` em `gateway_eventos`: o banco aceita qualquer texto; os valores permitidos são validados pelo **Zod no servidor Nuxt** antes do INSERT. Isso garante que trocar de gateway (Stripe → Asaas → Pix Manual) ou adicionar novas origens não exige migration.

---

## Índices

| Nome                             | Colunas                 | Observação                                    |
| -------------------------------- | ----------------------- | --------------------------------------------- |
| `audit_logs_pkey`                | `id`                    | PK                                            |
| `idx_audit_logs_perfil_id`       | `perfil_id`             | Busca de ações por usuário                    |
| `idx_audit_logs_tabela_registro` | `(tabela, registro_id)` | Histórico de um registro específico           |
| `idx_audit_logs_acao`            | `acao`                  | Filtro por tipo de ação                       |
| `idx_audit_logs_origem`          | `origem`                | Filtro por origem (webhook, impersonation...) |
| `idx_audit_logs_created_at`      | `created_at DESC`       | Ordenação cronológica (mais recente primeiro) |

---

## Valores de `acao` (referência)

Não é um ENUM — é `text` livre para permitir evolução sem migration. Convenção: `verbo_substantivo` em snake_case.

| Ação                       | Descrição                                                 |
| -------------------------- | --------------------------------------------------------- |
| `login`                    | Usuário fez login                                         |
| `logout`                   | Usuário fez logout                                        |
| `signup`                   | Novo cadastro                                             |
| `aceite_termos`            | Usuário aceitou os termos de uso                          |
| `update_perfil`            | Dados do perfil alterados                                 |
| `cancelar_assinatura`      | Assinatura cancelada                                      |
| `suspender_empresa`        | Empresa suspensa por inadimplência                        |
| `reativar_empresa`         | Empresa reativada                                         |
| `impersonation_inicio`     | Início de sessão de impersonation                         |
| `impersonation_fim`        | Fim de sessão de impersonation                            |
| `webhook_gateway_recebido` | Webhook de qualquer gateway processado (Asaas, Stripe...) |
| `dispute_recebida`         | Chargeback / disputa recebida do gateway                  |
| `dispute_ganha`            | Disputa contestada com sucesso                            |
| `dispute_perdida`          | Disputa perdida                                           |

---

## Valores de `origem` (referência — validados via Zod no Nuxt)

> Sem CHECK constraint no banco — novos valores podem ser adicionados apenas atualizando o schema Zod do servidor. Sem migration, sem lock de tabela.

| Valor             | Quando usar                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `usuario`         | Ação iniciada por um usuário autenticado via UI                                                       |
| `sistema`         | Ação automática (job, trigger, cron)                                                                  |
| `webhook_gateway` | Evento recebido via webhook de qualquer gateway de pagamento (Asaas, Stripe, Cakto, Pix manual, etc.) |
| `impersonation`   | Ação feita por Master acessando como outro usuário                                                    |

> O gateway específico não fica em `origem` — fica em `contexto.gateway_provider` (ex: `"asaas"`, `"stripe"`). Se o evento já existe em `gateway_eventos`, o `contexto` pode referenciar o `gateway_event_id` para rastreabilidade cruzada.

---

## JSONB: `contexto`

Campo livre para metadados adicionais que variam por tipo de ação.

```json
// login
{ "session_id": "abc123", "metodo": "email_senha" }

// impersonation_inicio
{ "impersonator_id": "uuid-do-master", "modo": "leitura", "loja_id": "uuid-da-loja" }
// ou modo CUD:
{ "impersonator_id": "uuid-do-master", "modo": "cud", "loja_id": "uuid-da-loja", "justificativa": "Suporte ativo aprovado pelo titular" }

// webhook_gateway — Asaas
{ "gateway_provider": "asaas", "gateway_event_id": "pay_xxx", "gateway_event_type": "PAYMENT_RECEIVED" }

// webhook_gateway — Stripe (se migrar)
{ "gateway_provider": "stripe", "gateway_event_id": "evt_xxx", "gateway_event_type": "invoice.payment_succeeded" }

// dispute / chargeback — agnóstico de provedor
{ "gateway_provider": "asaas", "gateway_event_id": "pay_xxx", "valor": 9990, "motivo": "fraude" }
```

> O campo `gateway_provider` dentro de `contexto` espelha o `gateway_provider` de `gateway_eventos` — permite JOIN semântico mesmo sem FK.

---

## Uso em Disputes (Chargebacks)

Ao receber uma disputa do gateway, o `audit_logs` cobre as provas exigidas:

| Prova exigida           | Onde está no banco                                                             |
| ----------------------- | ------------------------------------------------------------------------------ |
| Email do cliente        | `perfis.email`                                                                 |
| Data de cadastro        | `perfis.created_at`                                                            |
| IP no aceite dos termos | `audit_logs` WHERE `acao = 'aceite_termos'` + `lgpd_consentimentos.ip_address` |
| Logs de uso             | `audit_logs` WHERE `perfil_id = X` ORDER BY `created_at`                       |
| Evento do gateway       | `gateway_eventos` WHERE `gateway_event_id = contexto->>'gateway_event_id'`     |
| User-Agent              | `audit_logs.user_agent`                                                        |

> O `contexto.gateway_event_id` funciona como ponte semântica para `gateway_eventos` — os dois registros ficam sincronizados sem FK formal, preservando o design append-only.

---

## Regras de Negócio

- Registro **nunca é atualizado nem deletado** — append-only
- `perfil_id = null` é válido para ações do sistema (webhooks, jobs automáticos)
- `ip` e `user_agent` são **obrigatórios** para ações de `origem = 'usuario'` — crítico para disputes
- `dados_antes` e `dados_depois` devem omitir campos sensíveis (senhas, tokens) — apenas campos relevantes
- Toda ação de impersonation deve gerar dois registros: `impersonation_inicio` e `impersonation_fim`
- `ip` e `user_agent` são coletados **no servidor Nuxt** — nunca no frontend

---

## Relacionamentos

```
perfis (N:1, opcional)
  └── audit_logs (append-only)
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                                   |
| ---------------- | ------------------------------------------------ |
| `admin_master`   | Todos os logs                                    |
| `gerente_master` | Todos os logs                                    |
| `admin_loja`     | Sem acesso — ações de loja ficam em `logs_lojas` |
| demais cargos    | Sem acesso                                       |

> Apenas INSERT via **RPC com SECURITY DEFINER** — nunca UPDATE ou DELETE.

### Políticas

| Nome da Política           | Operação | Descrição                                  |
| -------------------------- | -------- | ------------------------------------------ |
| `audit_logs_select_master` | SELECT   | Master e Gerente Master veem todos os logs |

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER`. A função `fn_rpc_registrar_audit_log` é chamada internamente pelas RPCs de CUD críticas e pelo servidor Nuxt — nunca diretamente pelo cliente.

| Nome da Função                     | Quem pode chamar             | Função                                                                                                                                                                                                                 |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_registrar_audit_log`       | Sistema (todas RPCs + Nuxt)  | Insere um registro de auditoria. Chamada internamente — nunca exposta ao cliente. Valida que `ip` e `user_agent` estão presentes quando `origem = 'usuario'`. Omite campos sensíveis de `dados_antes` e `dados_depois` |
| `fn_rpc_listar_audit_logs`         | admin_master, gerente_master | Retorna logs com filtros opcionais de `perfil_id`, `acao`, `tabela`, `origem` e intervalo de `created_at`. Valida cargo antes de retornar. Suporta paginação via `p_limit` e `p_offset`                                |
| `fn_rpc_buscar_historico_registro` | admin_master, gerente_master | Retorna todos os logs de um par `(tabela, registro_id)` em ordem cronológica crescente — reconstrói o histórico completo de alterações de um registro. Valida cargo antes de retornar                                  |
