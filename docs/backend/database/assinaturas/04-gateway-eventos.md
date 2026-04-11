# Tabela: `gateway_eventos`

Registro dos webhooks brutos recebidos dos gateways de pagamento ativos (Stripe, Asaas, Cakto, etc). Garante idempotência blindada por banco de dados e serve como prova de pagamento intocável para auditorias e disputes.

---

## Propósito

- Armazena o payload bruto de cada evento recebido do gateway **antes** de tentar processar
- Garante idempotência — evita processar o mesmo evento duas vezes (gateways costumam disparar o mesmo evento múltiplas vezes em delays de internet)
- Serve como registro inalterável e agnóstico de provedor
- Transfere a complexidade de filas do Nuxt para o Supabase (RPCs cuidam do controle de status)
- É a espinha dorsal de qualquer sistema financeiro SaaS (PLG ou não)

---

## Colunas

| Coluna                 | Tipo        | Nullable | Default             | Descrição                                                                                 |
| ---------------------- | ----------- | -------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `id`                   | uuid        | NO       | `gen_random_uuid()` | PK interno                                                                                |
| `gateway_provider`     | text        | NO       | —                   | Gateway de origem — `stripe`, `asaas`, `cakto`, etc.                                      |
| `gateway_event_id`     | text        | NO       | —                   | ID oficial do evento no provedor externo — UNIQUE por provedor, garante a idempotência.   |
| `tipo`                 | text        | NO       | —                   | O tipo bruto original do gateway (ex: `invoice.payment_succeeded`, `PAYMENT_RECEIVED`)    |
| `tipo_normalizado`     | text        | YES      | —                   | O nosso tipo interno padrão (ex: `fatura.paga`, `assinatura.cancelada`)                   |
| `payload`              | jsonb       | NO       | —                   | O Payload JSON cru — sem filtros, exatamente da forma que chegou.                         |
| `status_processamento` | text        | NO       | `'pendente'`        | Estado do processamento: `pendente`, `sucesso`, `falha`, `ignorado`                       |
| `processado_em`        | timestamptz | YES      | —                   | Quando foi absorvido pelo sistema com sucesso (preenchido ao atingir `sucesso`)           |
| `tentativas`           | integer     | NO       | `0`                 | Quantidade de tentativas do Nuxt de triturar o evento                                     |
| `erro`                 | text        | YES      | —                   | Mensagem da stacktrace caso o servidor pipoque tentando atualizar a fatura/assinatura     |
| `empresa_id`           | uuid        | YES      | —                   | Identificado durante o processamento (opcional, util para admin cruzar dados rapidamente) |
| `created_at`           | timestamptz | NO       | `now()`             | Quando o nosso servidor deu 'hello' pro webhook                                           |

---

## Constraints

| Nome                           | Tipo   | Colunas / Referência                                                   |
| ------------------------------ | ------ | ---------------------------------------------------------------------- |
| `gateway_eventos_pkey`         | PK     | `id`                                                                   |
| `gateway_eventos_event_key`    | UNIQUE | `(gateway_provider, gateway_event_id)` — A GRANDE TRAVA IDEMPOTENTE    |
| `gateway_eventos_empresa_fkey` | FK     | `empresa_id` → `empresas(id)` ON DELETE SET NULL                       |
| `ck_gateway_eventos_status`    | CHECK  | `status_processamento IN ('pendente', 'sucesso', 'falha', 'ignorado')` |

## Valores válidos

> [!NOTE]
> Seguindo o comportamento principal do sistema (ver tabela assinaturas), a coluna `gateway_provider` **não possui** restrições fixas (CHECK constraint) no banco de dados. Os provedores aceitos são geridos a nível de Backend pela validação Zod da API, escalando horizontalmente sem requerer nenhuma migration para adoções fururas como Stripe, MP, etc.

> Esta tabela **nunca** leva DELETE (não possui soft delete ou updated_at). É um Log Append-Only por design.

---

## Índices

| Nome                                   | Colunas                                | Observação                                                                                    |
| -------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `gateway_eventos_pkey`                 | `id`                                   | PK                                                                                            |
| `gateway_eventos_event_key`            | `(gateway_provider, gateway_event_id)` | UNIQUE                                                                                        |
| `idx_gateway_eventos_tipo_normalizado` | `tipo_normalizado`                     | Filtro p/ reports                                                                             |
| `idx_gateway_eventos_status`           | `status_processamento`                 | WHERE `status_processamento IN ('pendente','falha')` — varreduras cron de eventos paralisados |

---

## Fluxo (Nuxt Server + Supabase RPC)

1. O gateway externo atira um POST para `/api/webhooks/asaas`.
2. O Nuxt verifica o segredo do Webhook (assinatura RSA/HMAC do cabeçalho) para validar se é o gateway real mesmo.
3. O Nuxt faz a inserção **bruta** via `fn_rpc_registrar_evento_gateway (provider, event_id, tipo, payload)`.
   - A RPC tem `ON CONFLICT (gateway_provider, gateway_event_id) DO NOTHING`.
   - Se já existia, a RPC avisa o Nuxt e ele retorna status `200 OK` pro provedor na hora sem quebrar a cabeça.
4. Se o evento é novo, o Nuxt roda o parser dele, entende o JSON, e chama as Server Routes ou RPCs necessárias (ex: gerar/pagar fatura em `03-faturas`, avançar `renova_em`).
5. Dando tudo verde, o Nuxt chama `fn_rpc_marcar_evento_sucesso (id)` que atualiza `status_processamento = 'sucesso'`, preenche `processado_em = now()` e marca a `empresa_id` referenciada.
6. Se der Catch Error, chama `fn_rpc_marcar_evento_erro (id, err.message)` que atualiza `status_processamento = 'falha'`.

---

## RLS (Row Level Security)

| Cargo          | O que pode ver       |
| -------------- | -------------------- |
| `admin_master` | Todos os eventos     |
| demais cargos  | Nenhum acesso direto |

> Os Inserts iniciais são injetados exclusivamente pelo Nuxt passando na RLS através do `service_role` (ignora RLS), logo, os usuários `admin_loja` nunca precisam nem sonhar que isso existe. Visibilidade disto é estritamente Master Boardering.

---

## Funções RPC

> Utiizam `SECURITY DEFINER` protegidas com tipagem estrita para segurança a nível de BD.

| Nome da Função                    | Quem pode chamar         | Descrição                                                                                                                                                                                                |
| --------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_registrar_evento_gateway` | Sistema (Server / Nitro) | Executa `INSERT ... ON CONFLICT (...) DO NOTHING`. Retorna o ID do evento (ou NULL se já existia). Não manipula lógica, só registra e devolve as chaves.                                                 |
| `fn_rpc_marcar_evento_sucesso`    | Sistema (Server / Nitro) | Seta `status_processamento = 'sucesso'`, preenche `processado_em = now()` e `tipo_normalizado`, seta também a `empresa_id` amarrando o dono oficial que gerou o log no momento de decodificar o payload. |
| `fn_rpc_marcar_evento_erro`       | Sistema (Server / Nitro) | Seta `status_processamento = 'falha'`, incrementa `tentativas = tentativas + 1` e popula o log descritivo de falha `erro`.                                                                               |
