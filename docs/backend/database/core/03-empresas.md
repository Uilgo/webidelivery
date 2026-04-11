# Tabela: `empresas`

Empresas/Tenants — contas principais que agrupam uma ou mais lojas.

---

## Propósito

- Representa o "dono" de um conjunto de lojas (ex: um grupo de restaurantes)
- É o nível de tenant principal — cada cliente seu tem uma empresa
- Controla o plano contratado e o status da assinatura
- O `slug` da empresa define a URL pública do cardápio e do painel admin
- Armazena permissões de impersonation para o Master

---

## Colunas

| Coluna                                   | Tipo        | Nullable | Default             | Descrição                                                                                                                       |
| ---------------------------------------- | ----------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                     | uuid        | NO       | `gen_random_uuid()` | PK                                                                                                                              |
| `plano_id`                               | uuid        | YES      | —                   | FK → `planos.id` — plano contratado                                                                                             |
| `nome`                                   | text        | NO       | —                   | Nome da empresa                                                                                                                 |
| `slug`                                   | text        | NO       | —                   | Slug único global — fonte da verdade para a URL pública (`/{slug}`). Espelhado automaticamente no `slug` da loja matriz via RPC |
| `status`                                 | text        | NO       | `ativa`             | `ativa`, `inativa`, `suspensa`, `cancelada`. Nasce como 'ativa' com a conclusão do onboarding sob trial livre.                  |
| `dominio_personalizado`                  | text        | YES      | —                   | Domínio próprio (ex: `pizzariadamaria.com.br`) — null se plano não permite                                                      |
| `dominio_ssl_ativo`                      | boolean     | NO       | `false`             | Se o SSL do domínio personalizado está ativo                                                                                    |
| `dominio_ssl_expira_em`                  | timestamptz | YES      | —                   | Data de expiração do certificado SSL                                                                                            |
| `dominio_verificado_em`                  | timestamptz | YES      | —                   | Quando o DNS foi verificado com sucesso                                                                                         |
| `configuracoes`                          | jsonb       | NO       | `{}`                | Configurações gerais da empresa                                                                                                 |
| `impersonation_cud_master`               | boolean     | NO       | `false`             | Se o Master tem permissão de CUD ativo                                                                                          |
| `impersonation_cud_master_concedido_em`  | timestamptz | YES      | —                   | Quando o acesso CUD do Master foi concedido                                                                                     |
| `impersonation_cud_master_concedido_por` | uuid        | YES      | —                   | FK → `perfis.id` — quem concedeu                                                                                                |
| `created_at`                             | timestamptz | NO       | `now()`             | Data de criação                                                                                                                 |
| `updated_at`                             | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger                                                                                          |

---

## Constraints

| Nome                                 | Tipo   | Colunas / Referência                                                                           |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------- |
| `empresas_pkey`                      | PK     | `id`                                                                                           |
| `empresas_plano_id_fkey`             | FK     | `plano_id` → `planos(id)` ON DELETE RESTRICT ON UPDATE NO ACTION                               |
| `fk_empresas_master_concedido_por`   | FK     | `impersonation_cud_master_concedido_por` → `perfis(id)` ON DELETE SET NULL ON UPDATE NO ACTION |
| `empresas_slug_key`                  | UNIQUE | `slug`                                                                                         |
| `empresas_dominio_personalizado_key` | UNIQUE | `dominio_personalizado`                                                                        |
| `check_empresas_slug_format`         | CHECK  | `slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'`                                                        |
| `check_empresas_slug_length`         | CHECK  | `length(slug) BETWEEN 3 AND 50`                                                                |

> **Sobre o `status`**: Segue a filosofia central de retirar a lógica de estado administrativo do Banco de Dados a favor de schemas da API (**Zod**). Flexibiliza para adição de suspensões tributárias instantâneas sem migrar o postgres.

---

## Índices

| Nome                   | Colunas                 | Observação                      |
| ---------------------- | ----------------------- | ------------------------------- |
| `empresas_pkey`        | `id`                    | PK                              |
| `empresas_slug_key`    | `slug`                  | UNIQUE                          |
| `idx_empresas_status`  | `status`                | Filtro por status de assinatura |
| `idx_empresas_dominio` | `dominio_personalizado` | UNIQUE                          |

---

## Valores válidos (Zod Schema)

### `status`

| Valor       | Descrição                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `pendente`  | Aguardando confirmação de pagamento — acesso bloqueado, middleware redireciona para página de pagamento |
| `ativa`     | Empresa operando normalmente                                                                            |
| `inativa`   | Conta desativada voluntariamente                                                                        |
| `suspensa`  | Suspensa por inadimplência ou violação                                                                  |
| `cancelada` | Conta encerrada                                                                                         |

---

## Estrutura de URLs

O `slug` da empresa é a fonte da verdade para as **URLs públicas do cardápio**. O painel admin possui uma rota fixa, independente do slug — os dados de cada usuário são carregados dinamicamente a partir da sessão autenticada.

### Sem domínio personalizado

| Recurso                        | URL                                                 |
| ------------------------------ | --------------------------------------------------- |
| Cardápio público (loja matriz) | `seudominio.com.br/pizzaria-da-maria`               |
| Cardápio público (filial)      | `seudominio.com.br/pizzaria-da-maria/filial-centro` |
| Painel admin                   | `seudominio.com.br/admin/dashboard`                 |

### Com domínio personalizado

| Recurso                        | URL                                      |
| ------------------------------ | ---------------------------------------- |
| Cardápio público (loja padrão) | `pizzariadamaria.com.br`                 |
| Cardápio público (filial)      | `pizzariadamaria.com.br/filial-centro`   |
| Painel admin                   | `pizzariadamaria.com.br/admin/dashboard` |
| Fallback via slug              | `seudominio.com.br/pizzaria-da-maria`    |

> O painel `/admin/dashboard` é único e serve todos os usuários da plataforma. O middleware de autenticação lê a sessão e carrega empresa/loja do perfil logado — o slug não interfere no roteamento do painel. Isso significa que trocar o slug de uma empresa não quebra nenhuma URL do painel.

## JSONB: `configuracoes`

```json
{
	"notas_internas": "Cliente veio via campanha Google Ads",
	"origem_cadastro": "landing_page",
	"responsavel_comercial": "João Silva"
}
```

---

## Impersonation

Apenas um nível de impersonation agora — apenas o Master pode solicitar acesso CUD.

**Fluxo:**

```
1. Master solicita acesso CUD a uma empresa
2. admin_loja aprova → impersonation_cud_master = true
3. Cada RPC de CUD verifica o flag antes de executar
4. Acesso expira (padrão 8h) → job zera o flag → false
5. Toda ação é registrada em logs de auditoria
```

---

## Regras de Negócio

- `slug` é único globalmente, apenas `a-z`, `0-9` e hífen, entre 3 e 50 caracteres
- `dominio_personalizado` é único globalmente — duas empresas não podem ter o mesmo domínio
- O número de lojas vinculadas não pode ultrapassar o limite do plano
- Ao suspender/cancelar uma empresa, todas as lojas vinculadas são suspensas em cascata
- A empresa é criada durante o onboarding do `admin_loja` (via RPC), não no signup

---

## Relacionamentos

```
planos (N:1)
  └── empresas
        ├── lojas (1:N)
        └── perfis (1:N) — admin_loja, gerente_loja, staff_loja, entregador
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                                    |
| ---------------- | ------------------------------------------------- |
| `admin_master`   | Todas as empresas                                 |
| `gerente_master` | Todas as empresas                                 |
| `admin_loja`     | Apenas a própria empresa (`empresa_id` do perfil) |
| `gerente_loja`   | Apenas a própria empresa                          |
| `staff_loja`     | Nenhum acesso                                     |
| `entregador`     | Nenhum acesso                                     |

### Políticas

| Nome da Política                         | Operação | Descrição                                             |
| ---------------------------------------- | -------- | ----------------------------------------------------- |
| `admin_master_pode_visualizar_empresas`  | SELECT   | Master e Gerente Master veem todas as empresas ativas |
| `admin_loja_pode_visualizar_sua_empresa` | SELECT   | Admin/Gerente Loja veem apenas a própria empresa      |

---

## Funções RPC

| Nome da Função                             | Quem pode chamar             | Descrição                                                                                                                                                                                                                               |
| ------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_empresa_onboarding`          | Autenticado (`anon`/`auth`)  | **Finalização PLG**: Chamada ao término do onboarding. Cria empresa + loja matriz + assinatura trial e marca `onboarding_status` do perfil como `'concluido'`.                                                                          |
| `fn_rpc_atualizar_empresa`                 | admin_master, admin_loja     | Atualiza qualquer campo da empresa (nome, domínio, configurações, etc). Usa `COALESCE` internamente — apenas os campos passados como argumento são alterados, os demais mantêm o valor atual.                                           |
| `fn_rpc_atualizar_status_empresa`          | admin_master                 | Ativa, suspende ou cancela a empresa — cascateia a alteração para todas as lojas vinculadas.                                                                                                                                            |
| `fn_rpc_verificar_slug_disponivel`         | Público (anon)               | Verifica se um slug está disponível globalmente — consulta `empresas.slug` e `lojas.slug` (matriz). Chamada em tempo real durante o onboarding para validação no formulário, antes da criação da empresa. Retorna `true` se disponível. |
| `fn_rpc_conceder_impersonation_cud_master` | admin_loja                   | Concede permissão de CUD ao Master para a própria empresa — define `impersonation_cud_master = true` e registra data e quem concedeu.                                                                                                   |
| `fn_rpc_revogar_impersonation_cud_master`  | admin_loja                   | Revoga permissão de CUD do Master — zera o flag e os campos de auditoria.                                                                                                                                                               |
| `fn_rpc_listar_empresas_com_metricas`      | admin_master, gerente_master | Lista todas as empresas com dados agregados (nº de lojas, status, plano) e paginação.                                                                                                                                                   |

---

## Server Routes (Nitro)

| Route                                      | Método | Quem pode chamar | Operações Auth Admin                  | Descrição                                                                         |
| ------------------------------------------ | ------ | ---------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| `server/api/admin/empresas/[id].delete.ts` | DELETE | admin_master     | `auth.admin.deleteUser()` (múltiplos) | **Hard Delete Total**: Remove empresa, todas as lojas e todos os usuários do Auth |
