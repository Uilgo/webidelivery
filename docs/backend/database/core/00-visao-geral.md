# 🏗️ Core do Banco de Dados — Visão Geral

> Arquitetura simplificada do WebiDelivery — sem whitelabel, com 2 painéis e 6 roles.

---

## 🎯 Premissas do Novo Sistema

### O que mudou em relação ao projeto antigo

| Aspecto          | Antigo                                  | Novo                                               |
| ---------------- | --------------------------------------- | -------------------------------------------------- |
| Multi-tenant     | Master → Whitelabel → Empresa → Loja    | Master → Empresa → Loja                            |
| Cargos           | 8 cargos (incluindo whitelabel)         | 6 cargos (sem whitelabel)                          |
| Painéis          | 3 painéis (Master, Whitelabel, Loja)    | 2 painéis (Master, Loja)                           |
| Permissões       | `cargo` ENUM + `cargo_permissoes` JSONB | `roles` + `permissoes` + `role_permissoes` (N:N)   |
| Whitelabel       | Tabela `whitelabels` com franqueados    | ❌ Removido — não existe mais                      |
| Impersonation WL | Flags em `empresas` e `lojas` para WL   | ❌ Removido — apenas impersonation do Master       |
| Soft delete      | `deleted_at` em várias tabelas          | ❌ Removido — `status` cumpre o papel de bloqueio  |
| Writes do banco  | RPCs chamadas pelo cliente              | Server routes (`server/api/`) — nunca RPC direta   |
| Deleção de conta | Soft delete via RPC                     | Hard delete em cascata com confirmação obrigatória |

### Hierarquia Final

```
Plataforma Master (você, dono do sistema)
  ├── admin_master      → acesso total à plataforma
  ├── gerente_master    → equipe da plataforma (permissões configuráveis)
  │
  └── Empresas (tenants — cada cliente seu)
        └── Lojas (1:N por empresa)
              ├── admin_loja      → dono do delivery
              ├── gerente_loja    → administrador do painel do delivery
              ├── staff_loja      → equipe operacional (caixa, cozinha)
              └── entregador      → motoboy (acesso restrito a entregas)
```

---

## 📊 Tabelas Core

| #   | Tabela     | Propósito                                         |
| --- | ---------- | ------------------------------------------------- |
| 1   | `roles`    | Catálogo fixo de cargos (6 registros via seed)    |
| 2   | `perfis`   | Perfis de usuários, vinculados ao `auth.users`    |
| 3   | `empresas` | Tenants — contas dos clientes (donos de delivery) |
| 4   | `lojas`    | Estabelecimentos físicos vinculados a uma empresa |

---

## 🔑 Sistema de Permissões — Arquitetura

### Filosofia

O sistema adota **RBAC (Role-Based Access Control)** baseado em cargos fixos. As permissões não são mais armazenadas em tabelas de catálogo dinâmicas no banco (para evitar JOINs desnecessários em cada request), mas sim definidas via constantes no código (middleware/hooks) e validadas por RLS.

```
roles (6 cargos fixos)
  └── perfis (usuários vinculados a um cargo)
```

### Cargos com acesso total implícito

| Cargo          | Comportamento                         |
| -------------- | ------------------------------------- |
| `admin_master` | Acesso total à plataforma e tenants   |
| `admin_loja`   | Acesso total aos dados da sua empresa |
| demais cargos  | Acesso restrito via RLS / Middleware  |

---

## 📁 Diagrama de Relacionamentos

```
auth.users (Supabase Auth)
  └── perfis (1:1)
        ├── roles (N:1) — cargo do usuário
        ├── empresas (N:1) — tenant
        └── lojas (N:1) — estabelecimento

empresas
  └── lojas (1:N)
```

---

## 🔒 Princípios de Segurança e Escrita

### PostgREST / Supabase Client vs. Server Route

> [!IMPORTANT]
> A escolha do meio de invocação define onde uma operação será processada e com que nível de privilégio. Nós abandonamos o uso indiscriminado de RPCs! O cliente nativo agora resolve as leituras.

| Camada               | Invocada por              | Chave usada        | Quando usar                                                                      |
| -------------------- | ------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| **Pós-gREST Nativo** | Supabase JS (Browser)     | `anon` key         | Toda Leitura (GET), listas públicas, filtragens de relatórios com RLS atuando    |
| **Server Route**     | Servidor Nuxt (Fetch API) | `service_role` key | Ações Críticas (POST/PUT/DELETE) em `perfis`, permissões, validação de Pagamento |

**Regra Crítica:** Todas e quaisquer operações de manipulação sensível (INSERT / UPDATE / DELETE) em `perfis`, `empresas`, `lojas` bem como rotas financeiras, devem trafegar pelas Server Routes. O cliente JS nunca terá permissão de manipulação de dados de alto nível diretamente contra o DB.

### RLS Universal

Todo usuário autenticado sempre enxerga o **próprio perfil** — garantido pela política `usuario_pode_visualizar_proprio_perfil` (`id = auth.uid()`). Sem esta política o app dá erro 403 no primeiro request após o login.

---

## 🗑️ Deleção de Dados

### Por que não há `deleted_at` nas tabelas core

O campo `status` em `perfis` (`ativo`, `inativo`, `bloqueado`), `empresas` e `lojas` já cumpre o papel de controle de acesso:

- `inativo` → conta desativada voluntariamente — acesso bloqueado, dados preservados
- `bloqueado` → suspenso por violação ou inadimplência
- `cancelado` → encerrado definitivamente (antes da exclusão física)

Adicionar `deleted_at` exigiria `WHERE deleted_at IS NULL` em **todas** as queries, RLSs e índices — complexidade sem benefício real.

### Deleção física: permanente e com confirmação obrigatória

A deleção real é **irreversível e em cascata via FK**. Sempre exige:

```
1. GET preview   → servidor retorna resumo exato do que será apagado
2. Frontend exibe modal com os dados + campo de confirmação (email ou slug)
3. DELETE        → servidor valida, deleta do Auth Admin API, cascade apaga o banco
```

O mecanismo central de cascade é a FK `perfis.id → auth.users.id ON DELETE CASCADE` — quando o Auth deleta o usuário, o banco apaga tudo em cadeia via FKs.

> Todo delete físico é feito via **server route** com `service_role` key — nunca via RPC chamada do cliente.

---

## 🎭 Valores Válidos e Restrições (Sem uso de ENUM)

> Restrição de Projeto: Absolutamente nenhum tipo `ENUM` nativo do PostgreSQL será usado no Webidelivery. Todos os campos de estados ou categorias limitadas são do tipo `text`, com validações implementadas no lado Servidor (Zod/Nuxt) ou através de `CHECK constraints` muito simples no Postgre.

| Tabela       | Campo (text)        | Valores válidos / esperados                             |
| ------------ | ------------------- | ------------------------------------------------------- |
| `permissoes` | `tipo_painel`       | `master`, `loja`                                        |
| `perfis`     | `status`            | `ativo`, `inativo`, `bloqueado`                         |
| `perfis`     | `onboarding_status` | `pendente`, `em_progresso`, `concluido`, ou `null`      |
| `empresas`   | `status`            | `pendente`, `ativa`, `inativa`, `suspensa`, `cancelada` |
| `lojas`      | `status`            | `rascunho`, `ativo`, `inativo`, `suspenso`              |

---

## 📝 Convenções de Nomenclatura

> Todas as convenções do projeto antigo se mantêm. Consultar `database/convencoes-nomenclatura.md`.

**Resumo rápido:**

- Tabelas: `snake_case` plural
- Colunas: `snake_case` singular
- PKs: `id`
- FKs: `tabela_id`
- RLS: `[nivel]_pode_[acao]_[contexto]`
- RPCs: `fn_rpc_[verbo]_[substantivo]`
- Índices: `idx_[tabela]_[colunas]`
- Triggers: `update_[tabela]_modtime`

---

## 🔄 Ordem de Seed (obrigatória)

```
1. roles              → 6 registros fixos (admin_master, admin_loja, etc)
```

---

## 📂 Estrutura desta pasta

```
backend/core/
├── 00-visao-geral.md          ← este arquivo
├── 01-roles.md                ← tabela roles (cargos)
├── 02-perfis.md               ← tabela perfis (usuários da plataforma)
├── 03-empresas.md             ← tabela empresas (tenants master)
├── 04-lojas.md                ← tabela lojas (estabelecimentos secundários)
└── 05-vw-master-empresas.md   ← View achatada para o Admin Master Dashboard
```
