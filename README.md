# 🍕 WebiDelivery

**Plataforma SaaS Multi-tenant de Delivery e Gestão de Estabelecimentos**

Sistema completo para donos de estabelecimentos (restaurantes, lanchonetes, pizzarias) criarem seus cardápios digitais, gerenciarem pedidos em tempo real e controlarem toda a operação do negócio — com um painel administrativo centralizado para a equipe da plataforma.

---

## 🎯 Proposta de Valor

O WebiDelivery opera em **2 níveis distintos**:

### 🏢 Nível 1: Plataforma WebiDelivery (Você)

Equipe interna que desenvolve, mantém e administra a plataforma:

- **Visão Global** — Acesso a todos os estabelecimentos e dados
- **Gestão de Empresas** — Onboarding e controle de clientes
- **Assinaturas e Planos** — Gestão de mensalidades recorrentes
- **Suporte** — Atendimento a todos os estabelecimentos
- **Auditoria** — Logs completos de todas as operações

### 🍕 Nível 2: Admin Loja (Cliente Final)

Donos e equipe de estabelecimentos que usam a plataforma:

- **Cardápio Digital** — URL única `/{slug}` com tema customizado
- **Gestão de Pedidos** — Controle em tempo real do fluxo completo
- **Marketing** — Cupons, banners e promoções
- **Logística** — Gestão de entregadores e acertos financeiros
- **Relatórios** — Analytics de vendas e desempenho

---

## 🚀 Tecnologias e Arquitetura

### Stack Principal

- **Nuxt 4** — Framework Vue.js com renderização híbrida e TypeScript rigoroso
- **Vue 3** — Composition API com `<script setup>`
- **Supabase** — PostgreSQL, autenticação JWT e RLS multi-tenant
- **Tailwind CSS v4** — Design system moderno com variáveis CSS semânticas
- **TypeScript** — Tipagem rigorosa em modo strict

### Ferramentas de Desenvolvimento

- **Pinia** — State management
- **VueUse** — Composables utilitários
- **VeeValidate + Zod** — Validação de formulários robusta
- **ESLint + Prettier** — Qualidade e formatação de código
- **Husky + Lint-staged** — Git hooks para qualidade
- **Nuxt Icon (Lucide)** — Ícones otimizados
- **Nuxt Image** — Otimização automática de imagens
- **Nuxt Fonts** — Gerenciamento de fontes (Inter Variable)

---

## 🔒 Arquitetura de Segurança

### Estratégia de Acesso ao Banco

O WebiDelivery implementa **duas camadas obrigatórias** de segurança:

| Operação                           | Mecanismo                        | Motivo                             |
| ---------------------------------- | -------------------------------- | ---------------------------------- |
| **Leitura (SELECT)**               | RLS (Row Level Security)         | Isolamento automático multi-tenant |
| **Escrita (INSERT/UPDATE/DELETE)** | RPC Functions (SECURITY DEFINER) | Validações rigorosas server-side   |

#### 🔐 RLS — Leitura com isolamento automático

As políticas RLS garantem que cada usuário veja **apenas os dados do seu tenant** (empresa/loja). Um `admin_loja` nunca consegue ler dados de outro estabelecimento, mesmo que tente via API diretamente.

#### ⚙️ RPC — Escrita centralizada e validada

**Toda escrita no banco ocorre exclusivamente via funções RPC.** Nenhuma tabela possui políticas `FOR INSERT`, `FOR UPDATE` ou `FOR DELETE`. Isso garante:

- ✅ Validações server-side rigorosas (sem depender do cliente)
- ✅ UPDATE parcial seguro com `COALESCE` (não sobrescreve campos não enviados)
- ✅ Auditoria automática de todas as operações
- ✅ Proteção contra SQL injection e manipulação de campos sensíveis (ex: `role_id`)
- ✅ Lógica de negócio centralizada no banco

---

## 👥 Sistema RBAC

Os cargos existentes no banco (tabela `public.roles`) são:

```
admin_master → gerente_master → admin_loja → gerente_loja → staff_loja → entregador
```

| Cargo            | Escopo          | Acesso                                            |
| ---------------- | --------------- | ------------------------------------------------- |
| `admin_master`   | Plataforma toda | Total, sem restrições                             |
| `gerente_master` | Plataforma toda | Operacional, sem configurações críticas           |
| `admin_loja`     | Empresa + Loja  | Total dentro do seu tenant                        |
| `gerente_loja`   | Loja            | Operacional, sem RBAC e configurações financeiras |
| `staff_loja`     | Loja            | Cardápio e pedidos apenas                         |
| `entregador`     | Loja            | Apenas entregas atribuídas                        |

> **Segurança de role:** O campo `role_id` **nunca é exposto** nas funções RPC de atualização de perfil. Um usuário só pode alterar `nome`, `sobrenome`, `whatsapp` e `avatar_url` — jamais promover a si mesmo.

---

## 🗺️ Rotas da Aplicação

### Públicas

| Rota                | Descrição                                                               |
| ------------------- | ----------------------------------------------------------------------- |
| `/{slug}`           | Cardápio público do estabelecimento (SEO dinâmico + tema personalizado) |
| `/login`            | Autenticação da equipe da loja                                          |
| `/plataforma/login` | Autenticação da equipe da plataforma (Master)                           |

### Protegidas — Painel Admin Loja

| Rota                   | Descrição                                    |
| ---------------------- | -------------------------------------------- |
| `/admin/onboarding`    | Configuração inicial obrigatória             |
| `/admin/dashboard`     | Painel principal com KPIs                    |
| `/admin/pedidos`       | Gestão de pedidos em tempo real              |
| `/admin/cardapio`      | Categorias, produtos, variações e adicionais |
| `/admin/marketing`     | Cupons, banners e promoções                  |
| `/admin/clientes`      | CRM de clientes                              |
| `/admin/logistica`     | Entregadores e acertos financeiros           |
| `/admin/relatorios`    | Analytics e relatórios                       |
| `/admin/configuracoes` | Dados da loja, horários, tema e pagamentos   |
| `/admin/perfil`        | Perfil do usuário autenticado                |

### Protegidas — Painel da Plataforma (Master)

| Rota                        | Descrição                             |
| --------------------------- | ------------------------------------- |
| `/plataforma/dashboard`     | Métricas globais de toda a plataforma |
| `/plataforma/empresas`      | Todos os clientes e estabelecimentos  |
| `/plataforma/usuarios`      | Todos os usuários do sistema          |
| `/plataforma/assinaturas`   | Planos e cobranças recorrentes        |
| `/plataforma/suporte`       | Tickets de suporte                    |
| `/plataforma/auditoria`     | Logs de operações                     |
| `/plataforma/relatorios`    | Analytics da plataforma               |
| `/plataforma/configuracoes` | Configurações globais                 |

---

## 🗄️ Banco de Dados

### Migrations (21 arquivos — execução em ordem)

| Arquivo                            | Módulo                                       |
| ---------------------------------- | -------------------------------------------- |
| `00_extensions_e_funcoes_base.sql` | Extensões PostgreSQL e funções auxiliares    |
| `01_core.sql`                      | Roles, Perfis, Empresas, Lojas + Funções RLS |
| `02_assinaturas.sql`               | Planos, Assinaturas e Faturas                |
| `03_catalogo.sql`                  | Categorias, Produtos, Variações e Adicionais |
| `04_catalogo_combos_promocoes.sql` | Combos e Promoções                           |
| `05_marketing.sql`                 | Banners e Cupons                             |
| `06_pedidos.sql`                   | Clientes e Pedidos                           |
| `07_logistica.sql`                 | Entregadores e Acertos Financeiros           |
| `08_suporte.sql`                   | Tickets de Suporte                           |
| `09_notificacoes.sql`              | Notificações                                 |
| `10_auditoria.sql`                 | Logs e LGPD                                  |
| `11_views.sql`                     | Views analíticas                             |
| `12_rpc_core.sql`                  | RPCs: Perfis, Empresas e Lojas               |
| `13_rpc_assinaturas.sql`           | RPCs: Assinaturas                            |
| `14_rpc_catalogo.sql`              | RPCs: Cardápio                               |
| `15_rpc_marketing.sql`             | RPCs: Marketing                              |
| `16_rpc_pedidos.sql`               | RPCs: Pedidos                                |
| `17_rpc_logistica.sql`             | RPCs: Entregadores                           |
| `18_rpc_suporte_notif_audit.sql`   | RPCs: Suporte, Notificações e Auditoria      |
| `19_rpc_catalogo_combos.sql`       | RPCs: Combos                                 |
| `20_rpc_auditoria_avancada.sql`    | RPCs: Auditoria Avançada                     |

### Estado Atual do Banco (projeto `webidelivery`)

- ✅ **35 tabelas** criadas no schema `public`
- ✅ **5 views** analíticas
- ✅ **6 roles RBAC** cadastradas
- ✅ **2 perfis** criados (`admin_master` e conta demo `admin_loja`)

---

## 📦 Módulos Funcionais

### 🍽️ Cardápio Digital

```
Loja
└── Categorias
    └── Produtos (ativo, destaque, promoção)
        ├── Variações (tamanhos/sabores com preços)
        └── Grupos de Adicionais (min/max, obrigatório)
            └── Adicionais
```

### 📦 Gestão de Pedidos

```
pendente → aceito → em_preparo → pronto → em_entrega → concluido
         ↘ cancelado
```

### 📈 Marketing

- **Cupons** — Percentual, valor fixo ou frete grátis
- **Banners** — Carrossel, destaque e popup
- **Promoções** — Desconto por produto/categoria, combos e "leve e pague"

### 🚚 Logística

- Cadastro de entregadores por loja
- Controle de status (offline → disponível → ocupado)
- Acertos financeiros (corridas × valor pago)

### 📋 Auditoria e LGPD

- Log completo de todas as operações CUD
- Consentimentos versionados (termos, privacidade)
- Portabilidade e anonimização de dados

---

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/webidelivery.git
cd webidelivery

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-publishable-key
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME=WebiDelivery
```

### Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento (localhost:3000)
pnpm build        # Build para produção
pnpm preview      # Preview da build
pnpm lint         # ESLint
pnpm lint:fix     # Corrige ESLint
pnpm format       # Prettier
pnpm typecheck    # Verifica TypeScript
pnpm check        # Roda todos os checks
pnpm fix          # Corrige tudo automaticamente
```

---

## 🎨 Design System

- **Tailwind CSS v4** com variáveis semânticas RGB Hexadecimal
- **30+ componentes** UI reutilizáveis
- **Dark mode** automático
- **Tema por loja** — 4 cores base geram 20+ derivadas automaticamente
- **Fonte Inter** (variável 300–800)
- **Acessibilidade WCAG 2.1 AA**

> **Por que RGB Hexadecimal?** OKLCH tem suporte inconsistente em navegadores mobile (iOS Safari, Chrome Android), causando layouts quebrados em produção. RGB garante compatibilidade universal desde 1996.

---

## 📋 Status de Desenvolvimento

### ✅ Concluído

- [x] Nuxt 4 configurado com TypeScript rigoroso
- [x] Supabase com RLS multi-tenant e arquitetura RPC-only para escrita
- [x] Schema completo (35 tabelas, 21 migrations, 5 views)
- [x] Sistema RBAC com 6 níveis hierárquicos
- [x] Auditoria e LGPD implementados
- [x] Design System com 30+ componentes
- [x] Validação com VeeValidate + Zod
- [x] Conta Admin Master criada
- [x] Conta Demo Admin Loja criada (`demo@delivery.com`)

### 🚧 Próximas Etapas

- [ ] Autenticação completa (Google OAuth + email/senha)
- [ ] Onboarding obrigatório (5 etapas)
- [ ] Painel Admin Loja — Dashboard, Pedidos, Cardápio
- [ ] Cardápio público com tema personalizado
- [ ] Checkout via WhatsApp
- [ ] Painel da Plataforma (Master)
- [ ] Relatórios e Analytics
- [ ] Sistema de assinaturas e cobrança recorrente

---

## 📚 Documentação

- [📁 Migrations do Banco](./docs/backend/migrations/)
- [🧪 Conta Demo](./docs/backend/demo-account.md)
- [📖 Nuxt Docs](https://nuxt.com/docs)
- [📖 Supabase Docs](https://supabase.com/docs)
- [📖 Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 📄 Licença

Privado — Todos os direitos reservados.

Desenvolvido com ❤️ para revolucionar o delivery no Brasil.
