# Tabela: `faturas`

Histórico financeiro de cobranças. Cada assinatura acumula N faturas ao longo do tempo. O status de uma fatura (`paga`) é o gatilho que avança `assinaturas.renova_em` e reativa o acesso à plataforma.

---

## Propósito

- Registra todos os eventos de cobrança — um por ciclo de renovação
- Suporta dois fluxos: aprovação manual pelo `admin_master` (PIX + comprovante) e aprovação automática via webhook de gateway externo
- Quando aprovada, a server route atualiza `assinaturas.renova_em` e define `status = 'ativa'`

---

## Colunas

| Coluna               | Tipo          | Nullable | Default             | Descrição                                                          |
| -------------------- | ------------- | -------- | ------------------- | ------------------------------------------------------------------ |
| `id`                 | uuid          | NO       | `gen_random_uuid()` | PK                                                                 |
| `assinatura_id`      | uuid          | NO       | —                   | FK → `assinaturas.id`                                              |
| `valor`              | numeric(10,2) | NO       | `0.00`              | Valor cobrado nesta fatura (reflete o plano no momento da geração) |
| `status`             | text          | NO       | `'pendente'`        | Status da cobrança — ver valores válidos                           |
| `data_vencimento`    | timestamptz   | NO       | —                   | Data-limite para pagamento                                         |
| `data_pagamento`     | timestamptz   | YES      | —                   | Preenchido ao aprovar (manual ou webhook)                          |
| `metodo`             | text          | YES      | —                   | Modo de pagamento: `pix`, `cartao`, `boleto`, `manual`             |
| `url_pagamento`      | text          | YES      | —                   | Link de checkout gerado pelo gateway ou server route               |
| `comprovante_url`    | text          | YES      | —                   | URL do comprovante no Storage — fluxo PIX manual                   |
| `gateway_provider`   | text          | NO       | `'manual'`          | Gateway responsável: `manual`, `cakto`, `asaas`, `stripe`          |
| `gateway_invoice_id` | text          | YES      | —                   | ID da fatura no gateway externo                                    |
| `gateway_metadata`   | jsonb         | YES      | `{}`                | Raw do payload do gateway — auditoria e debugging                  |
| `created_at`         | timestamptz   | NO       | `now()`             | Data de criação                                                    |
| `updated_at`         | timestamptz   | NO       | `now()`             | Atualizado automaticamente via trigger                             |

---

## Constraints

| Nome                          | Tipo   | Colunas / Referência                                                               |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `faturas_pkey`                | PK     | `id`                                                                               |
| `faturas_gateway_invoice_key` | UNIQUE | `(gateway_provider, gateway_invoice_id)` — Garante idempotência blindada por banco |
| `faturas_assinatura_id_fkey`  | FK     | `assinatura_id` → `assinaturas(id)` ON DELETE CASCADE                              |
| `ck_faturas_valor`            | CHECK  | `valor >= 0`                                                                       |

> **Sobre `status`**: A tabela retira validações como 'pendente' / 'paga', alocando ao **Zod/Nuxt** essa inspeção. Adaptações de cobrança com intermediadores (novo status `chargeback_analise`) entram em produção imediatas sem tocar em schemas do postgres.

---

## Índices

| Nome                          | Colunas           | Observação                                                   |
| ----------------------------- | ----------------- | ------------------------------------------------------------ |
| `faturas_pkey`                | `id`              | PK                                                           |
| `idx_faturas_assinatura_id`   | `assinatura_id`   | Busca de faturas por assinatura                              |
| `idx_faturas_status`          | `status`          | Filtro rápido — admin_master localiza pendentes de aprovação |
| `idx_faturas_data_vencimento` | `data_vencimento` | Jobs de vencimento e listagens ordenadas                     |

---

## Valores válidos

> [!NOTE]
> A coluna `metodo` (método de pagamento) **não possui** constraint de validação no banco de dados. Isso existe para suportar a fluidez moderna onde `apple_pay`, `crypto` ou variações dos Gateways possam ser processados diretamente. A barreira de proteção de tipagem fica encarregada à camada Backend TypeScript / Zod, protegendo o DBA de precisar abrir migrations recorrentes.

### `status`

| Valor       | Descrição                                                    |
| ----------- | ------------------------------------------------------------ |
| `pendente`  | Aguardando pagamento ou aprovação do comprovante             |
| `paga`      | Pagamento confirmado — `assinaturas.renova_em` foi avançada  |
| `recusada`  | Pagamento negado (gateway) ou comprovante rejeitado (manual) |
| `estornada` | Pagamento revertido após confirmação                         |

---

## Fluxo de Aprovação Manual (PIX)

```
1. Sistema gera fatura com status = 'pendente'
2. Lojista acessa tela de billing → vê chave PIX / QR Code estático
3. Lojista paga no banco e faz upload do comprovante
   → POST /api/faturas/comprovante → grava URL no Storage em faturas.comprovante_url
4. admin_master visualiza fila de faturas pendentes com comprovante
5. Valida comprovante visualmente → clica em "Aprovar"
   → POST /api/admin/faturas/[id]/aprovar
   → faturas.status        = 'paga'
   → faturas.data_pagamento = now()
   → assinaturas.status    = 'ativa'
   → assinaturas.renova_em += intervalo do ciclo (ex: +1 month, +1 year)
```

---

## Relacionamentos

```
assinaturas (N:1)
  └── faturas (1:N)
```

---

## RLS (Row Level Security)

| Cargo                             | O que pode ver                                                               |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `admin_master` / `gerente_master` | Todas as faturas                                                             |
| `admin_loja`                      | Faturas da própria assinatura (via `assinatura_id` → `empresa_id` do perfil) |
| Demais cargos                     | Nenhum acesso                                                                |

### Políticas

| Nome da Política                          | Operação | Descrição                                     |
| ----------------------------------------- | -------- | --------------------------------------------- |
| `admin_master_pode_visualizar_faturas`    | SELECT   | Master e Gerente Master veem todas as faturas |
| `admin_loja_pode_visualizar_suas_faturas` | SELECT   | Admin Loja vê faturas da própria assinatura   |

> Toda escrita em `faturas` ocorre via server routes. O upload de comprovante grava apenas a URL no Storage — nunca altera `status` diretamente. A aprovação e o avanço de `renova_em` são operações atômicas feitas exclusivamente pelo servidor.

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, não utilizamos Server Routes (APIs) para leitura. O componente da tela dispara direto pelo cliente Supabase:

- **Painel Lojista (Extrato):** `supabase.from('faturas').select('*').order('created_at', { ascending: false })` — RLS retorna apenas o histórico dele.
- **Painel Master (Validação):** `supabase.from('faturas').select('*').eq('status', 'pendente').not('comprovante_url', 'is', null)` — Retorna listagem exata da fila do Pix Manual para o Master.

---

## Server Routes (Nitro)

Exclusivo para operações transacionais sensíveis ou upload:

| Route                                           | Método | Quem pode chamar | Descrição                                                                                                      |
| ----------------------------------------------- | ------ | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `server/api/admin/faturas/[id]/aprovar.post.ts` | POST   | admin_master     | Aprova fatura (PIX manual) — atualiza `status`, `data_pagamento` e avança `assinaturas.renova_em` atomicamente |
| `server/api/faturas/comprovante.post.ts`        | POST   | admin_loja       | Upload do comprovante PIX para o Storage — grava a URL em `comprovante_url` (ou usamos SDK do Storage com RLS) |
