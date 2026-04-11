# Módulo: Auditoria

Módulo responsável pelo registro imutável e rastreabilidade de todas as ações sensíveis do sistema.

---

## Propósito

Garantir conformidade, segurança e rastreabilidade completa de:

- Ações críticas de plataforma (login, signup, disputes, impersonation)
- Ações operacionais no painel das lojas (pedidos, catálogo, configurações)
- Consentimentos LGPD dos usuários
- Solicitações de exclusão de dados (direito ao esquecimento)

---

## Tabelas

| Arquivo                            | Tabela                       | Responsabilidade                                                                     |
| ---------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `01-audit-logs.md`                 | `audit_logs`                 | Log global de plataforma — ações críticas de Master, signup, disputes, impersonation |
| `02-logs-lojas.md`                 | `logs_lojas`                 | Log operacional de loja — ações no painel `/admin/*`                                 |
| `03-lgpd-consentimentos.md`        | `lgpd_consentimentos`        | Consentimentos LGPD — aceites de termos, política, marketing                         |
| `04-lgpd-solicitacoes-exclusao.md` | `lgpd_solicitacoes_exclusao` | Solicitações de exclusão de dados — direito ao esquecimento                          |
| `05-impersonation-solicitacoes.md` | `impersonation_solicitacoes` | Workflow de permissão para o Suporte injetar/update nos painéis da loja              |

> Não existe `logs_plataforma` separado — no nosso sistema, ações de plataforma feitas pelo Master são todas registradas em `audit_logs`. A separação em dois logs (`plataforma` vs `lojas`) só existia no legado para separar ações Master/Whitelabel. Aqui o Master não tem whitelabel, então um único log de plataforma cobre tudo.

---

## Arquitetura de Logs

### Divisão por contexto

| Contexto          | Tabela                       | Quem gera                                            |
| ----------------- | ---------------------------- | ---------------------------------------------------- |
| Plataforma global | `audit_logs`                 | Master (ambos cargos), sistema, webhooks             |
| Painel de loja    | `logs_lojas`                 | Admin/Gerente/Staff da loja, Master em impersonation |
| Consentimento     | `lgpd_consentimentos`        | Qualquer usuário autenticado                         |
| Exclusão LGPD     | `lgpd_solicitacoes_exclusao` | Qualquer usuário autenticado                         |

### Princípios imutáveis

- Todos os logs são **append-only** — nunca UPDATE, nunca DELETE
- INSERT exclusivamente via **RPC com SECURITY DEFINER** — nunca direto pelo cliente
- Snapshots de `usuario_email`, `usuario_nome` e `usuario_cargo` preservados mesmo após exclusão do perfil
- `ip` e `user_agent` coletados **no servidor (Nuxt)** — nunca no frontend

---

## Impersonation no novo sistema

No sistema atual (sem whitelabel), o fluxo de impersonation é simplificado:

### Quem pode acessar como quem

| Solicitante      | Alvo          | Modo                                   |
| ---------------- | ------------- | -------------------------------------- |
| `admin_master`   | Qualquer loja | Leitura (silencioso, titular não vê)   |
| `admin_master`   | Qualquer loja | CUD (requer aprovação do `admin_loja`) |
| `gerente_master` | Qualquer loja | Leitura (silencioso)                   |

> Sem whitelabel, sem hierarquia intermediária.

### Logs de impersonation

- **Modo leitura:** registrado em `logs_lojas` com `tipo_impersonation = 'master'` e `tinha_permissao_cud = false` — **visível apenas para o Master, não para o `admin_loja`**
- **Modo CUD:** registrado com `tinha_permissao_cud = true` — **visível tanto para o Master quanto para o `admin_loja`**

---

## LGPD

### Obrigações cobertas

| Artigo LGPD                       | Cobertura                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| Art. 7º e 8º — Consentimento      | `lgpd_consentimentos` — registro imutável com IP, user_agent e versão do documento |
| Art. 18 — Direito ao esquecimento | `lgpd_solicitacoes_exclusao` — ciclo completo de criação, análise e conclusão      |

### Prazo legal

- Solicitações de exclusão devem ser respondidas em **15 dias úteis** (LGPD Art. 18 §3º)
- O campo `created_at` em `lgpd_solicitacoes_exclusao` serve como marco de contagem

---

## Segurança

| Camada        | Como é protegida                                                                      |
| ------------- | ------------------------------------------------------------------------------------- |
| Escrita       | RPC com `SECURITY DEFINER` — cliente nunca insere direto                              |
| Leitura       | RLS restritivo — cada cargo vê apenas o que lhe pertence                              |
| IP/User-Agent | Coletados no servidor Nuxt — nunca no frontend                                        |
| Snapshots     | Email, nome e cargo salvos no momento da ação — imunes a alterações futuras no perfil |
| Imutabilidade | `updated_at` e `deleted_at` ausentes em todas as tabelas de log                       |
