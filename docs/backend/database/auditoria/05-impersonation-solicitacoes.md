# Tabela: `impersonation_solicitacoes`

Solicitações formais de acesso impersonation em modo CUD (Create/Update/Delete). Quando a equipe de Suporte (`admin_master`) precisa operar ativamente e alterar dados no painel da Loja para ajudar na configuração (em vez de apenas olhar), o `admin_loja` titular deve aprovar a entrada formalmente.

---

## Propósito

- Registra pedidos de acesso CUD feitos pela Plataforma à uma Loja.
- Exige aprovação explícita via Botão "Autorizar Suporte" pelo dono da loja.
- Gera trilha de auditoria legal (quem pediu assistência, quem foi o analista e vigência).
- **Atenção:** Modo leitura (read-only) do master continua não precisando de consentimento para diagnóstico invisível, conforme nossa topologia de segurança atual.

---

## Colunas

| Coluna             | Tipo        | Nullable | Default             | Descrição                                                                    |
| ------------------ | ----------- | -------- | ------------------- | ---------------------------------------------------------------------------- |
| `id`               | uuid        | NO       | `gen_random_uuid()` | PK                                                                           |
| `solicitante_id`   | uuid        | NO       | —                   | FK → `perfis.id` (O analista da plataforma que pediu).                       |
| `loja_id`          | uuid        | NO       | —                   | FK → `lojas.id` (A loja sendo acessada).                                     |
| `motivo`           | text        | YES      | —                   | Justificativa exibida pro cliente (ex: "Para corrigir cadastro de frete").   |
| `status`           | text        | NO       | `'pendente'`        | Valores válidos: `pendente`, `aprovada`, `recusada`, `expirada`, `revogada`. |
| `respondido_por`   | uuid        | YES      | —                   | FK → `perfis.id` (Dono da loja que clicou em aprovar/recusar).               |
| `respondido_em`    | timestamptz | YES      | —                   | Data da ação do cliente.                                                     |
| `expira_em`        | timestamptz | NO       | `now() + 24h`       | Carencia pra loja aceitar o ticket antes de caducar sozinho.                 |
| `acesso_expira_em` | timestamptz | YES      | —                   | Se aprovado, prazo de segurança (Ex: cai automaticamente após 8h).           |
| `created_at`       | timestamptz | NO       | `now()`             | -                                                                            |

---

## RLS (Row Level Security)

Adequado à nossa arquitetura multi-tenant limpa e sem hierarquias intermediárias (Whitelabel):

| Cargo          | O que pode ver                                             |
| -------------- | ---------------------------------------------------------- |
| `admin_master` | Enxerga toda a rede de solicitações para auditar o suporte |
| `admin_loja`   | Vê somente os chamados de sua própria loja (`loja_id`)     |
| Demais cargos  | Bloqueado completamente.                                   |

### Políticas

| Nome da Política                             | Operação | Descrição                                                                         |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_impersonation` | SELECT   | Root da plataforma acessando todo histórico de chamados de suporte/impersonation. |
| `equipe_loja_pode_visualizar_impersonation`  | SELECT   | Filtro isolando o acesso do cliente garantindo sua proteção via `perfis.loja_id`. |

---

## Server Rules & RPCs Mapeadas

O controle transacional que permite `admin_master` atuar temporariamente nos domínios da loja será gerido pelas RPC estritas (evitando injeções clientes):

1. **`fn_rpc_impersonation_solicitar(p_loja_id, p_motivo)`**
   Gera o aviso para o cliente, valida que este perfil que chama é realmente da base da Plataforma Master.

2. **`fn_rpc_impersonation_responder(p_id, p_status_novo)`**
   Quando a loja aprova, a função muda o status pra "aprovado", e ativa o switch virtual `impersonation_cud_master_ativo = true` no cadastro daquela loja para o Node Server liberar as rotas.

3. **`fn_rpc_impersonation_job_cleanup()`**
   Worker/Script rodando no servidor externo (Node/Nuxt) chama essa RPC pelo Supabase Client (com service_role) para rebaixar para `expirada` os chamados que não foram respondidos a tempo, e dropar a flag da loja quando as 8h de manutenção do suporte estouraram o prazo. Não usamos pg_cron interno do Supabase.
