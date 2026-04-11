# Tabela: `tickets`

Conversas/tickets de suporte entre uma loja e a equipe Master (Suporte da Plataforma).

---

## Propósito

- Centraliza todas as interações de suporte B2B (Loja <-> Plataforma)
- Suporta interfaces de chat dinâmico ou ticket clássico formal
- Roteamento simples: quem atende é sempre a equipe Master
- CSAT nativo de avaliação pós-resolução

---

## Colunas

| Coluna               | Tipo        | Nullable | Default             | Descrição                                                                   |
| -------------------- | ----------- | -------- | ------------------- | --------------------------------------------------------------------------- |
| `id`                 | uuid        | NO       | `gen_random_uuid()` | PK                                                                          |
| `loja_id`            | uuid        | NO       | —                   | FK → `lojas.id` — loja que precisa de suporte                               |
| `aberto_por`         | uuid        | NO       | —                   | FK → `perfis.id` — loja_id member que abriu o ticket                        |
| `atribuido_a`        | uuid        | YES      | —                   | FK → `perfis.id` — membro da equipe master responsável (null = fila global) |
| `numero`             | integer     | NO       | —                   | Número sequencial global — gerado via sequence/trigger                      |
| `titulo`             | text        | NO       | —                   | Título resumido do problema                                                 |
| `categoria`          | text        | YES      | —                   | Categoria do ticket — opcional                                              |
| `prioridade`         | text        | NO       | `'normal'`          | Prioridade do ticket                                                        |
| `status`             | text        | NO       | `'aberto'`          | Status atual do ticket                                                      |
| `resolvido_em`       | timestamptz | YES      | —                   | Quando o ticket foi marcado como resolvido — para cálculo de SLA            |
| `fechado_em`         | timestamptz | YES      | —                   | Quando o ticket foi fechado definitivamente                                 |
| `csat_nota`          | integer     | YES      | —                   | Nota de satisfação (1–5) dada pelo `aberto_por`                             |
| `csat_comentario`    | text        | YES      | —                   | Comentário opcional da nota CSAT                                            |
| `csat_respondido_em` | timestamptz | YES      | —                   | Timestamp da resposta logada                                                |
| `canal`              | text        | NO       | `'chat'`            | Canal de origem — define como o frontend entende e renderiza                |
| `ultima_mensagem_em` | timestamptz | YES      | —                   | Timestamp que reordena as rows do chat inbox para a mais recente            |
| `nao_lidas_cliente`  | integer     | NO       | `0`                 | Mensagens ignoradas pelo `admin_loja` (exibe selo 🔴)                       |
| `nao_lidas_suporte`  | integer     | NO       | `0`                 | Mensagens ignoradas pelo suporte master                                     |
| `metadata`           | jsonb       | NO       | `{}`                | Contexto técnico dinâmico de onde o erro ocorreu (sys info/browser/url)     |
| `deleted_at`         | timestamptz | YES      | —                   | Soft delete                                                                 |
| `created_at`         | timestamptz | NO       | `now()`             | Data de abertura                                                            |
| `updated_at`         | timestamptz | NO       | `now()`             | Trigger de update natural                                                   |

---

## Constraints

| Nome                       | Tipo   | Colunas / Referência                                |
| -------------------------- | ------ | --------------------------------------------------- |
| `tickets_pkey`             | PK     | `id`                                                |
| `tickets_loja_id_fkey`     | FK     | `loja_id` → `lojas(id)` ON DELETE CASCADE           |
| `tickets_aberto_por_fkey`  | FK     | `aberto_por` → `perfis(id)`                         |
| `tickets_atribuido_a_fkey` | FK     | `atribuido_a` → `perfis(id)`                        |
| `tickets_numero_key`       | UNIQUE | `numero`                                            |
| `check_tickets_csat_nota`  | CHECK  | `csat_nota IS NULL OR csat_nota BETWEEN 1 AND 5`    |
| `check_tickets_nao_lidas`  | CHECK  | `nao_lidas_cliente >= 0 AND nao_lidas_suporte >= 0` |

> **Sobre `categoria`, `prioridade`, `status` e `canal`**: Para máxima flexibilidade na adição de novos fluxos amizavelmente, essas colunas textuais não possuem `CHECK constraint`. As validações de domínio (ex: `aberto`, `fechado`, ticket de `sugestao`) são garantidas modernamente por schemas **Zod no Nuxt**.

> **Geração automática do `numero`:** Utiliza uma sequence PostgreSQL global `CREATE SEQUENCE tickets_numero_seq` vinculada via DEFAULT `nextval('tickets_numero_seq')`. Como o número é global (não por loja), uma sequence simples resolve sem concorrência.

---

## Índices

| Nome                      | Colunas                              | Observação                                |
| ------------------------- | ------------------------------------ | ----------------------------------------- |
| `tickets_pkey`            | `id`                                 | PK                                        |
| `tickets_numero_key`      | `numero`                             | UNIQUE                                    |
| `idx_tickets_status`      | `status`                             | WHERE `deleted_at IS NULL`                |
| `idx_tickets_atribuido_a` | `atribuido_a`                        | Filtrar painel de um atendente específico |
| `idx_tickets_loja_id`     | `loja_id`                            | Histórico de uma loja                     |
| `idx_tickets_ultima_msg`  | `(loja_id, ultima_mensagem_em DESC)` | Inbox emulando ordem WhatsApp             |

---

## Valores Válidos para Interfaces

> O banco protege a consistência por CHECK. Adições exigem pequeno patch na migrate.

### `status`

1. `aberto` (cai na fila global do Master)
2. `em_andamento` (foi pego via `atribuido_a`)
3. `aguardando` (pausado, pendendo do lojista mandar infos)
4. `resolvido` (Suporte crê que resolveu, esperando timeout ou ok com CSAT)
5. `fechado` (Arquivado)

---

## Regras de Negócio

- `atribuido_a` só pode portar UUIDs cuja origin role seja de Suporte (`admin_master`, `gerente_master`).
- Uma vez resolvido, o sistema envia RPC de Notificação push para a Loja dar a nota (pesquisa de balcão).

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                         |
| ---------------- | -------------------------------------- |
| `admin_master`   | Todos os tickets de qualquer loja      |
| `gerente_master` | Todos os tickets                       |
| `admin_loja`\*   | Tickets originados pela `loja_id` dele |
| Público (anon)   | Nenhum acesso                          |

_(Equipe da Loja)_

### Políticas Livres (Select direto)

| Nome da Política        | Operação | Descrição                                                      |
| ----------------------- | -------- | -------------------------------------------------------------- |
| `tickets_select_master` | SELECT   | Master veem todos os tickets                                   |
| `tickets_select_loja`   | SELECT   | Membros de Loja veem estritamente `loja_id = auth->minha_loja` |

---

## Funções RPC (Security Definer)

> Escritas exigem empacotamento em RPC para blindar escalada de prioridade desautorizada e proteger triggers orgânicas (incremento `nao_lida`).

| Nome da Função                  | Quem pode chamar                | Função                                                                                                                                         |
| ------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_ticket`           | Cargos da Loja, Masters         | Valida ownership (`loja_id`), auto-atribui remetente na chave `aberto_por`, preenche config de canais                                          |
| `fn_rpc_atualizar_ticket`       | Equipe Master                   | Valida acesso e atualiza as metas sensíveis (mudança de prioridade urgente, assumir ticket, alterar Categoria)                                 |
| `fn_rpc_resolver_ticket`        | Equipe Master                   | Congela interações, manda feedback Push, bate data em `resolvido_em`                                                                           |
| `fn_rpc_responder_csat`         | Cargos da Loja (aberto_por)     | Se ticket estiver Fechado/Resolvido, injeta no banco a pontuação garantida que não foi burlada.                                                |
| `fn_rpc_marcar_mensagens_lidas` | Qualquer membro atrelado no RLS | Zera os crachás numéricos de notificação do frontend dependendo do Lado do chamador (master ou cliente), para limpar `badge count` sem stress. |
