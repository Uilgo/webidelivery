# Tabela: `assinaturas`

Entidade central de monetização. Vincula uma empresa a um plano e controla o status operacional da mensalidade — é o portão principal verificado pelo middleware para liberar ou bloquear o acesso à plataforma.

---

## Propósito

- Une **1 Empresa a 1 Plano** — relação única: uma empresa nunca tem duas assinaturas simultâneas
- Mantém `renova_em` como a data-limite: quando `renova_em < now()`, o middleware bloqueia o acesso
- Identifica se a gestão é manual ou por qual gateway externo
- Upgrade/downgrade apenas trocam o `plano_id` — nunca cria nova linha

---

## Colunas

| Coluna                       | Tipo        | Nullable | Default             | Descrição                                                                                                            |
| ---------------------------- | ----------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `id`                         | uuid        | NO       | `gen_random_uuid()` | PK                                                                                                                   |
| `empresa_id`                 | uuid        | NO       | —                   | FK → `empresas.id` — UNIQUE: uma empresa tem exatamente uma assinatura                                               |
| `plano_id`                   | uuid        | NO       | —                   | FK → `planos.id` — plano atual contratado                                                                            |
| `ciclo`                      | text        | NO       | `'mensal'`          | Frequência de renovação associada à contratação (ex: `mensal`, `anual`). Crucial para calcular salto de `renova_em`. |
| `status`                     | text        | NO       | `'trial'`           | Status da assinatura — ver valores válidos                                                                           |
| `renova_em`                  | timestamptz | NO       | —                   | Data-limite: quando `renova_em < now()` o middleware bloqueia a plataforma                                           |
| `cancelada_em`               | timestamptz | YES      | —                   | Preenchido quando a assinatura é encerrada definitivamente                                                           |
| `gateway_provider`           | text        | NO       | `'manual'`          | Gateway responsável: `manual`, `cakto`, `asaas`, `stripe`                                                            |
| `gateway_customer_id`        | text        | YES      | —                   | ID do cliente no gateway (ex: `cus_xxxxxx`) para relacionar contas em cancelamentos e voltas                         |
| `gateway_subscription_id`    | text        | YES      | —                   | ID da assinatura no gateway externo (ex: `sub_xxxxxx`)                                                               |
| `tentativas_cobranca_falhas` | integer     | NO       | `0`                 | Contador de cobranças que ratearam. Útil para "grace periods" e retenção                                             |
| `gateway_metadata`           | jsonb       | YES      | `{}`                | Raw do payload de webhook — útil para auditoria e debugging                                                          |
| `created_at`                 | timestamptz | NO       | `now()`             | Data de criação                                                                                                      |
| `updated_at`                 | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger                                                                               |

---

## Constraints

| Nome                          | Tipo   | Colunas / Referência                                    |
| ----------------------------- | ------ | ------------------------------------------------------- |
| `assinaturas_pkey`            | PK     | `id`                                                    |
| `assinaturas_empresa_id_key`  | UNIQUE | `empresa_id` — uma empresa tem no máximo uma assinatura |
| `assinaturas_empresa_id_fkey` | FK     | `empresa_id` → `empresas(id)` ON DELETE CASCADE         |
| `assinaturas_plano_id_fkey`   | FK     | `plano_id` → `planos(id)` ON DELETE RESTRICT            |

> **Sobre `ciclo` e `status`**: Removido bloqueio hardcoded. Adições estratégicas em SaaS (como planos `trienais` ou staus `trial_expirado`) não dependem de DDL. A consistência flui apenas ao **schema Zod** da API responsável pelas transações.

---

## Índices

| Nome                         | Colunas      | Observação                                             |
| ---------------------------- | ------------ | ------------------------------------------------------ |
| `assinaturas_pkey`           | `id`         | PK                                                     |
| `assinaturas_empresa_id_key` | `empresa_id` | UNIQUE                                                 |
| `idx_assinaturas_status`     | `status`     | Filtro por status para listagem do admin_master        |
| `idx_assinaturas_renova_em`  | `renova_em`  | Crítico — varreduras do middleware e jobs de expiração |

---

## Valores válidos

> [!NOTE]
> A coluna `gateway_provider` **não possui** limitação/constraint no banco (`cakto, asaas, manual`). Ela é do tipo Type=Text de formato livre. **Por que?** Para permitir que o desenvolvedor conecte o MercadoPago ou Stripe hoje à tarde apenas configurando as variáveis via Backend/Node. A "cancela de segurança" que impede lixo ou gateways não-existentes passou integralmente para a Validação Zod/TypeScript na Sever API, livrando o DBA de ter que reescrever código SQL pesado diariamente para plugar novos serviços.

### `status`

| Valor       | Descrição                                                          |
| ----------- | ------------------------------------------------------------------ |
| `trial`     | Período de teste gratuito de 7 dias — acesso completo à plataforma |
| `ativa`     | Assinatura paga e vigente                                          |
| `atrasada`  | Pagamento vencido — middleware bloqueia, redireciona para billing  |
| `cancelada` | Encerrada definitivamente — `cancelada_em` preenchida              |

---

## Fluxo do Trial

A assinatura é criada automaticamente ao final do onboarding via `fn_rpc_criar_empresa_onboarding`:

```
signup → perfil criado → onboarding wizard → fn_rpc_criar_empresa_onboarding
  → empresa criada
  → loja matriz criada
  → assinatura criada:
      status       = 'trial'
      renova_em    = now() + 7 dias
      gateway      = 'manual'
```

Após os 7 dias, se não houver pagamento:

```
renova_em < now()
  → middleware detecta e bloqueia o painel
  → lojista acessa apenas a tela de billing
  → pagamento aprovado → status = 'ativa', renova_em avança
```

---

## Relacionamentos

```
empresas (1:1)
  └── assinaturas
        ├── planos (N:1)
        └── faturas (1:N)
```

---

## RLS (Row Level Security)

| Cargo                             | O que pode ver                                           |
| --------------------------------- | -------------------------------------------------------- |
| `admin_master` / `gerente_master` | Todas as assinaturas                                     |
| `admin_loja`                      | Apenas a própria assinatura (via `empresa_id` do perfil) |
| Demais cargos                     | Nenhum acesso                                            |

### Políticas

| Nome da Política                            | Operação | Descrição                                            |
| ------------------------------------------- | -------- | ---------------------------------------------------- |
| `admin_master_pode_visualizar_assinaturas`  | SELECT   | Master e Gerente Master veem todas as assinaturas    |
| `admin_loja_pode_visualizar_sua_assinatura` | SELECT   | Admin Loja vê apenas a assinatura da própria empresa |

> Toda escrita em `assinaturas` (`status`, `renova_em`, `plano_id`) ocorre exclusivamente via server routes — o cliente nunca escreve diretamente.

---

## Funções RPC

| Nome da Função                    | Quem pode chamar | Descrição                                                                                    |
| --------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_empresa_onboarding` | Autenticado      | Cria empresa + loja + assinatura trial atomicamente. Documentada em `../core/03-empresas.md` |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas acima, **não existe necessidade** de Server Routes para leitura (GET). O Frontend consome `assinaturas` via PostgREST direto:

- **Painel do Lojista:** `supabase.from('assinaturas').select('*, planos(*)')` retornará de forma segura unicamente a assinatura daquele usuário logado.
- **Painel Master:** O mesmo `.select('*')` trará a rede inteira. Filtros por "trial" ou "status" são feitos diretamente no client com recursos do SDK (`.eq('status', 'trial')`).

---

## Server Routes (Nitro)

| Route                                              | Método | Quem pode chamar           | Descrição                                                                                                    |
| -------------------------------------------------- | ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `server/api/admin/assinaturas/[id].put.ts`         | PUT    | admin_master               | Upgrade/downgrade de plano ou ajuste manual de `renova_em`                                                   |
| `server/api/assinatura/webhook/[provider].post.ts` | POST   | Público (chave de webhook) | Recebe webhooks de gateways externos (Cakto, Asaas) — orquestra faturas e atualiza a assinatura atomicamente |
