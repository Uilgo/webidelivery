# Módulo: `assinaturas`

Gerencia a monetização do sistema num modelo agnóstico, desenhado para a estratégia PLG (Product-Led Growth). Permite entrada livre com trial de 7 dias e escala de pagamentos manuais diretos (PIX/painel) até integrações completas via webhooks (Cakto, Asaas) usando as mesmas entidades de banco.

---

## Tabelas

| Arquivo                 | Tabela            | Propósito                                                                        |
| ----------------------- | ----------------- | -------------------------------------------------------------------------------- |
| `01-planos.md`          | `planos`          | Vitrine de pacotes — define nomes, valores e limites via JSONB                   |
| `02-assinaturas.md`     | `assinaturas`     | Entidade central — vincula Empresa a Plano e guarda status e data de renovação   |
| `03-faturas.md`         | `faturas`         | Histórico financeiro — registra eventos de cobrança, manual ou automático        |
| `04-fluxo-plg-admin.md` | -                 | Manual operacional de Fluxo do Administrador e Lifecycles                        |
| `05-gateway-eventos.md` | `gateway_eventos` | Tabela Log centralizada, com Unique (provider, evt_id) garantindo a idempotência |

---

## Fluxo PLG (Product-Led Growth)

```
1. Signup → auth.users + perfis criados (sem empresa/loja ainda)
2. Usuário acessa /admin/onboarding → wizards guiados
3. Ao final do wizard → Server Route (`POST /api/onboarding/finalizar`)
   → Cria nativamente com service_role: empresa + loja matriz + assinatura (status='trial', renova_em = now() + 7 dias)
4. Durante o trial → acesso completo à plataforma
5. Ao expirar (renova_em < now()) → middleware bloqueia, redireciona para tela de billing
6. Pagamento via PIX manual ou gateway externo → fatura aprovada → renova_em avança
7. Empresa inativa por longo período → admin_master executa hard delete via server route
```

---

## Separação de Gateways

O sistema é agnóstico a gateway — a coluna `gateway_provider` **não possui Foreign Keys ou Checks ingessados**. Ela apenas identifica a origem do payload, delegando a trava e segurança lógica para os Validadores (`Zod / TypeScript`) no Backend Nuxt:

| Gateway          | Como funciona                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `manual`         | PIX estático — lojista envia comprovante, `admin_master` aprova manualmente no painel                                           |
| `stripe`/`cakto` | Webhook POST externo validado em API — aprovação via server route que lê o payload garantindo idempotência antes de dar UPDATE. |
| `* custom *`     | Lojista no futuro pode plugar PagSeguro sem tocar na arquitetura de banco, ajustando a API.                                     |

---

## Regras Gerais

- Uma empresa possui **exatamente uma** assinatura (`UNIQUE empresa_id`)
- Upgrade/downgrade muda apenas o `plano_id` — nunca cria nova linha
- O middleware verifica `assinaturas.renova_em < now()` para bloquear o acesso
- Toda escrita em `assinaturas` e `faturas` ocorre exclusivamente via server routes
