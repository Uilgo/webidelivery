# PRD — WebiDelivery SaaS

**Data:** Abril 2026  
**Status:** Em Desenvolvimento

---

## 📋 Identidade do Produto

**Nome:** WebiDelivery

**Domínio Principal:** `webidelivery.com.br`

**Tipo:** Plataforma SaaS Multi-tenant (SSR — Nuxt 4)

---

## 🎯 Proposta de Valor

O WebiDelivery oferece ferramentas completas para que donos de estabelecimentos (restaurantes, lanchonetes, pizzarias) possam criar seus cardápios digitais, gerenciar pedidos em tempo real e controlar toda a sua operação — enquanto a equipe da plataforma acompanha tudo de um painel centralizado.

### Para a Equipe da Plataforma (Admin Master / Gerente Master)

- Visão global de todos os estabelecimentos cadastrados
- Gestão de empresas, lojas, usuários e assinaturas
- Suporte, auditoria e compliance (LGPD)
- Configurações globais da plataforma

### Para Estabelecimentos (Admin Loja / Gerente Loja / Staff Loja)

- Cardápio digital com URL única `/{slug}` e tema personalizável
- Gestão completa de pedidos em tempo real
- Marketing (cupons, banners, promoções)
- Logística (entregadores e acertos financeiros)
- Relatórios e analytics
- Equipe com controle RBAC

---

## 🎯 Objetivo do Sistema

1. **Controlar pedidos** em tempo real com status detalhados
2. **Gerenciar equipe** com sistema RBAC de 6 níveis
3. **Gerenciar cardápio** com produtos simples e complexos (variações + adicionais)
4. **Implementar marketing** com cupons, banners e promoções
5. **Gerar insights** via relatórios detalhados
6. **Configurar e personalizar** conforme necessidade do negócio

---

## 🏗️ Arquitetura do Sistema

### Modelo de Negócio

```
┌───────────────────────────────────────────────────┐
│  Equipe da Plataforma (Admin Master/Gerente)       │
│  - Administra toda a plataforma                    │
│  - Acompanha empresas e estabelecimentos           │
│  - Gerencia assinaturas e suporte                  │
└───────────────────────────────────────────────────┘
                        ↓
     ┌──────────────────────────────────────┐
     │  Empresas (Tenants)                  │
     │  - Cada empresa possui uma ou mais   │
     │    lojas/estabelecimentos            │
     └──────────────────────────────────────┘
                        ↓
     ┌──────────────────────────────────────┐
     │  Lojas (Estabelecimentos)            │
     │  - Admin Loja, Gerente, Staff        │
     │  - Cardápio, pedidos, equipe         │
     └──────────────────────────────────────┘
```

### Estrutura de Painéis (2 Painéis)

#### 🌐 Painel Plataforma (`/plataforma/*`)

**Usuários:** Admin Master + Gerente Master

**Áreas:**

1. Dashboard
2. Empresas (Estabelecimentos)
3. Usuários
4. Assinaturas & Planos
5. Financeiro
6. Suporte
7. Equipe
8. Relatórios
9. Configurações
10. Perfil

#### 🏪 Painel Admin (`/admin/*`)

**Usuários:** Admin Loja + Gerente Loja + Staff Loja (mesmo painel, itens filtrados por RBAC)

**Áreas:**

1. Dashboard
2. Pedidos
3. Cardápio
4. Marketing
5. Clientes
6. Equipe (Admin/Gerente)
7. Logística (Admin/Gerente)
8. Relatórios (Admin/Gerente)
9. Configurações (Admin/Gerente)
10. Perfil

---

## 👥 Sistema RBAC (Controle de Acesso)

### Hierarquia de Cargos (6 Níveis)

```
admin_master → gerente_master → admin_loja → gerente_loja → staff_loja → entregador
```

| Cargo            | Escopo          | Descrição                                            |
| ---------------- | --------------- | ---------------------------------------------------- |
| `admin_master`   | Plataforma toda | Equipe WebiDelivery — acesso total e irrestrito      |
| `gerente_master` | Plataforma toda | Operacional — sem configurações críticas             |
| `admin_loja`     | Empresa + Loja  | Dono do estabelecimento — total dentro do tenant     |
| `gerente_loja`   | Loja            | Operacional — sem RBAC nem configurações financeiras |
| `staff_loja`     | Loja            | Cardápio e pedidos apenas                            |
| `entregador`     | Loja            | Apenas entregas atribuídas (PWA mobile)              |

### Regra de Interface: "Invisibilidade"

> Se o usuário não tem permissão para acessar um módulo ou aba, o item **não deve ser exibido**.

---

## 🌐 Painel Plataforma — Perfis e Permissões

### 1. Admin Master

**Acesso:** Total e irrestrito

**Poderes exclusivos:**

- Configurações críticas (Gateway, API Keys, Segurança)
- Exclusão permanente de qualquer dado
- Logs de auditoria completos
- Impersonation em qualquer loja
- Criar/editar Gerentes Master

**Menu visível:** Todos os 10 itens

---

### 2. Gerente Master

**Foco:** Suporte operacional e gestão de estabelecimentos

**Restrições:**

- Não cria nem edita Admin Master
- Não acessa configurações críticas
- Não exclui estabelecimentos permanentemente
- Impersonation conforme configuração

**Menu visível:** 9 itens (sem configurações críticas)

---

## 🏪 Painel Admin (Loja) — Perfis e Permissões

### 1. Admin Loja (Dono do Estabelecimento)

**Acesso:** Total e irrestrito ao seu estabelecimento

**Poderes exclusivos:**

- Gerenciar métodos de pagamento
- Dados sensíveis da empresa
- Configurações de segurança
- Solicitar exclusão do estabelecimento
- Gerenciar toda a equipe (Gerentes, Staff, Entregadores)
- Personalizar tema (4 cores base)

**Menu visível:** Todos os 10 itens

---

### 2. Gerente Loja

**Foco:** Gestão operacional completa

**Restrições em Equipe:**

- Cria/edita apenas Staff e Entregadores
- Não pode criar outros Gerentes
- Não pode editar Admin Loja

**Restrições em Configurações:**

- Vê apenas: Horários, Frete, Aparência
- Dados da empresa, pagamento e segurança são **invisíveis**

**Menu visível:** Todos os 10 itens (Configurações limitado)

---

### 3. Staff Loja

**Foco:** Execução de pedidos

**Restrições:**

- Menus "Equipe", "Logística", "Relatórios" e "Configurações" são **invisíveis**
- Dashboard simplificado (sem valores R$ ou gráficos financeiros)
- Pode ativar/desativar itens no Cardápio e Marketing

**Menu visível:** 5 itens (Dashboard, Pedidos, Cardápio, Marketing, Perfil)

---

### 4. Entregador

**Foco:** Entregas atribuídas

**Acesso:** PWA mobile dedicado (`/app/entregas`)

**Restrições:**

- Não acessa o painel admin

---

## 🗺️ Mapa de Rotas

### Rotas Públicas

| Rota                      | Descrição                                                    |
| ------------------------- | ------------------------------------------------------------ |
| `/`                       | Redirecionador inteligente baseado em autenticação           |
| `/[slug]`                 | Cardápio público da loja (SEO dinâmico + tema personalizado) |
| `/[slug]/pedido`          | Histórico de pedidos do cliente                              |
| `/[slug]/pedido/checkout` | Finalização de compra                                        |
| `/[slug]/pedido/:codigo`  | Rastreamento de pedido (público)                             |
| `/login`                  | Login de estabelecimentos                                    |
| `/signup`                 | Cadastro de novo estabelecimento                             |
| `/forgot-password`        | Recuperação de senha                                         |
| `/plataforma/login`       | Login da equipe da plataforma (Master)                       |

### Rotas Protegidas — Painel Plataforma

| Rota                        | Admin Master | Gerente Master  |
| --------------------------- | ------------ | --------------- |
| `/plataforma/dashboard`     | ✅ Global    | ✅              |
| `/plataforma/empresas`      | ✅ Todas     | ✅              |
| `/plataforma/usuarios`      | ✅           | ✅              |
| `/plataforma/assinaturas`   | ✅           | ✅              |
| `/plataforma/financeiro`    | ✅ Total     | ✅ Visualização |
| `/plataforma/suporte`       | ✅           | ✅              |
| `/plataforma/equipe`        | ✅           | ⛔              |
| `/plataforma/relatorios`    | ✅           | ✅              |
| `/plataforma/configuracoes` | ✅ Total     | ✅ Limitado     |
| `/plataforma/perfil`        | ✅           | ✅              |

### Rotas Protegidas — Painel Admin Loja

| Rota                   | Admin | Gerente     | Staff       |
| ---------------------- | ----- | ----------- | ----------- |
| `/admin/dashboard`     | ✅    | ✅          | ✅ Limitado |
| `/admin/pedidos`       | ✅    | ✅          | ✅          |
| `/admin/cardapio`      | ✅    | ✅          | ✅          |
| `/admin/marketing`     | ✅    | ✅          | ✅          |
| `/admin/clientes`      | ✅    | ✅          | ⛔          |
| `/admin/equipe`        | ✅    | ✅          | ⛔          |
| `/admin/logistica`     | ✅    | ✅          | ⛔          |
| `/admin/relatorios`    | ✅    | ✅          | ⛔          |
| `/admin/configuracoes` | ✅    | ✅ Limitado | ⛔          |
| `/admin/perfil`        | ✅    | ✅          | ✅          |

---

## 🔐 Autenticação

### Login (`/login` e `/plataforma/login`)

**Campos:**

- E-mail (obrigatório)
- Senha (obrigatório)

**Validações:**

- E-mail formato RFC compliant
- Bloqueio após 5 tentativas falhas (15 minutos)
- Rate limiting anti-bruteforce
- Sessão expira em 8h de inatividade
- JWT tokens com refresh automático

**Fluxo pós-login:**

- `admin_master` / `gerente_master` → `/plataforma/dashboard`
- `admin_loja` / `gerente_loja` / `staff_loja` → `/admin/dashboard`

---

### Cadastro (`/signup`)

**Campos:**

- Nome (obrigatório)
- Sobrenome (obrigatório)
- E-mail (obrigatório, único)
- Senha (obrigatório, ≥8 chars, maiúscula + minúscula + número + especial)
- Confirmar Senha

**Fluxo:**

1. Cria usuário em `auth.users`
2. Cria perfil em `public.perfis` com `role = admin_loja`, `onboarding_status = 'pendente'`
3. Redireciona para `/admin/dashboard` com alerta de configuração

---

### Configuração Inicial (via Dashboard)

**Acionamento:** Alerta na dashboard quando `onboarding_status = 'pendente'` ou `'em_progresso'`

**Campos obrigatórios para concluir:**

- Nome da loja
- WhatsApp
- Slug/URL
- Pelo menos 1 forma de pagamento ativa

**Progresso:**

- Qualquer campo salvo → `onboarding_status = 'em_progresso'`
- Todos os campos obrigatórios preenchidos → `onboarding_status = 'concluido'`
- Alerta some da dashboard automaticamente

---

## 🌐 Painel Plataforma — Layout e Estrutura

### Menu Lateral (fixo, 100vh)

**Cabeçalho:**

- Logo WebiDelivery
- Badge "Master" ou "Gerente"

**Itens do Menu:**

| #   | Item          | Admin Master | Gerente Master |
| --- | ------------- | ------------ | -------------- |
| 1   | Dashboard     | ✅           | ✅             |
| 2   | Empresas      | ✅           | ✅             |
| 3   | Usuários      | ✅           | ✅             |
| 4   | Assinaturas   | ✅           | ✅             |
| 5   | Financeiro    | ✅           | ✅             |
| 6   | Suporte       | ✅           | ✅             |
| 7   | Equipe        | ✅           | ⛔             |
| 8   | Relatórios    | ✅           | ✅             |
| 9   | Configurações | ✅           | ✅ Limitado    |
| 10  | Perfil        | ✅           | ✅             |

**Rodapé:** Card do usuário (avatar, nome, cargo) + Dropdown: Perfil, Sair

---

### Topbar (fixo)

**Esquerda:** Título da página + Breadcrumb (Ex: Plataforma > Empresas)  
**Direita:** Busca global, Toggle Dark/Light, Notificações, Status da Plataforma

---

### Dashboard (`/plataforma/dashboard`)

**KPIs:**

- Total de Empresas cadastradas
- Total de Lojas ativas
- MRR (Receita Recorrente Mensal)
- Volume de Pedidos (últimos 30 dias)

**Métricas secundárias:**

- ARR, Churn Rate, Ticket Médio, GMV

**Gráficos:**

- Evolução MRR (12 meses)
- Crescimento de lojas (6 meses)
- Volume de pedidos (30 dias)
- Distribuição por plano

**Listas:**

- Últimos 10 cadastros
- Lojas com problemas (inadimplência, inativas)
- Tickets críticos pendentes

---

### Empresas (`/plataforma/empresas`)

**Listagem:**

- Busca por nome, slug, e-mail
- Filtros: status, plano, data, região, volume
- Exportar CSV

**Tabela:**

- Logo, Nome, Slug, Admin, Plano, Status, Pedidos (30d), GMV (30d), Último Acesso, Ações

**Ações:**

- Visualizar detalhes (Overlay Drawer)
- Impersonation (Modo Completo ou Leitura)
- Editar dados
- Alterar plano
- Suspender/Reativar
- Excluir (apenas Master, confirmação dupla)

**Detalhe da Empresa (Drawer):**

_Tab Informações:_ Dados cadastrais, status onboarding, datas  
_Tab Assinatura:_ Plano, valor, ciclo, histórico  
_Tab Métricas:_ Gráficos de pedidos, GMV, taxa de conversão  
_Tab Usuários:_ Lista de usuários, filtros por cargo, ações  
_Tab Pedidos:_ Histórico com filtros  
_Tab Suporte:_ Tickets do estabelecimento  
_Tab Logs:_ Histórico de ações, logins, impersonation

---

### Usuários (`/plataforma/usuarios`)

**Listagem:**

- Busca por nome, e-mail
- Filtros: cargo, estabelecimento, status, data
- Exportar CSV

**Tabela:**

- Avatar, Nome, E-mail, Cargo, Estabelecimento, Status, Último Acesso, Ações

**Ações:**

- Visualizar perfil (Drawer)
- Resetar senha
- Forçar logout
- Desativar/Reativar
- Ver logs de atividade

---

### Assinaturas (`/plataforma/assinaturas`)

**Tab Planos:**  
Listagem de planos (nome, preço, assinantes, status). Criar, editar, desativar, duplicar.

**Configuração de Plano:**

- Nome, Descrição, Preço, Recursos incluídos (limite de produtos, pedidos/mês, suporte, relatórios avançados, domínio customizado), Trial (dias), Status

**Tab Assinaturas:**  
Visão geral (MRR, novas, cancelamentos), listagem por estabelecimento

**Tab Trials:**  
Monitoramento (dias restantes, atividade, score de conversão), ações (estender, converter, contatar)

---

### Financeiro (`/plataforma/financeiro`)

**Permissão:** Admin Master total; Gerente Master visualização

**KPIs:** MRR, ARR, Receita do mês, Receita pendente, Taxa de inadimplência, Ticket médio

**Tabs:** Visão Geral, Receitas, Cobranças, Inadimplência, Reembolsos, Extrato

---

### Suporte (`/plataforma/suporte`)

**Tabs:** Inbox, Meus Tickets, Todos os Tickets, Base de Conhecimento, Métricas

**Categorias:** Dúvidas, Problemas técnicos, Financeiro, Solicitação de feature, Reclamação, Cancelamento

**KPIs:** Tickets abertos, Resolvidos (30d), Tempo médio de resposta, SLA, CSAT

---

### Equipe (`/plataforma/equipe`)

**Permissão:** Apenas Admin Master

**Tabs:** Membros, Convites Pendentes, Logs de Atividade

**Criar Membro:** Nome, E-mail, Cargo (admin_master ou gerente_master), Permissões customizadas

---

### Relatórios (`/plataforma/relatorios`)

**Tabs:** Crescimento, Engajamento, Financeiro, Operacional, Comparativos, Exportações

---

### Configurações (`/plataforma/configuracoes`)

**Tab Geral:** Nome da plataforma, Logo, URLs, Contato, Termos, Privacidade  
**Tab E-mails:** Templates transacionais, Editor, Preview, SMTP  
**Tab Integrações (Master):** API keys de terceiros, Webhooks  
**Tab Gateway (Master):** Gateway ativo, Chaves de API, Modo, Logs  
**Tab API & Webhooks (Master):** API keys, Webhooks, Rate limiting  
**Tab Segurança (Master):** Políticas de senha, Expiração de sessão, IP whitelist, 2FA, Logs  
**Tab Manutenção (Master):** Modo manutenção, Agendamento, Backups

---

## 🏪 Painel Admin (Loja) — Layout e Estrutura

### Menu Lateral (fixo, 100vh)

**Cabeçalho:** Logo da loja + Nome do estabelecimento

**Itens do Menu:**

| #   | Item          | Admin | Gerente     | Staff       |
| --- | ------------- | ----- | ----------- | ----------- |
| 1   | Dashboard     | ✅    | ✅          | ✅ Limitado |
| 2   | Pedidos       | ✅    | ✅          | ✅          |
| 3   | Cardápio      | ✅    | ✅          | ✅          |
| 4   | Marketing     | ✅    | ✅          | ✅          |
| 5   | Clientes      | ✅    | ✅          | ⛔          |
| 6   | Equipe        | ✅    | ✅          | ⛔          |
| 7   | Logística     | ✅    | ✅          | ⛔          |
| 8   | Relatórios    | ✅    | ✅          | ⛔          |
| 9   | Configurações | ✅    | ✅ Limitado | ⛔          |
| 10  | Perfil        | ✅    | ✅          | ✅          |

**Badge em Pedidos:** Contador de pendentes (vermelho) + som de alerta

**Rodapé:** Card do usuário + Dropdown: Perfil, Sair

---

### Topbar (fixo)

**Esquerda:** Título da página + Breadcrumb  
**Direita:** Dark/Light Mode, Notificações, **Toggle "Loja Aberta/Fechada"** (invisível para Staff), Botão "Ver Cardápio"

---

### Dashboard (`/admin/dashboard`)

**Admin/Gerente — KPIs:**

- Faturamento Hoje / 7 dias / 30 dias
- Pedidos Hoje / 7 dias / 30 dias
- Ticket Médio
- Taxa de Conversão

**Staff — KPIs:** Pedidos Hoje / 7 dias / 30 dias / Mais vendidos

**Componentes:**

- Pedidos em andamento (cards com ação rápida)
- Top 5 produtos mais vendidos
- Status de funcionamento (Aberto/Fechado + próximo horário)
- Atalhos: Novo Produto, Criar Cupom, Ver Relatórios, Configurar Horários
- Gráficos (Admin/Gerente): Vendas 7d, Pedidos por dia da semana, Métodos de pagamento
- Notificações recentes

**Alerta de configuração:**

- `onboarding_status = 'pendente'` → alerta urgente
- `onboarding_status = 'em_progresso'` → alerta suave
- `onboarding_status = 'concluido'` → sem alerta

---

### Pedidos (`/admin/pedidos`)

**Tab Kanban (padrão):**

Colunas: Pendentes → Aceitos → Em Preparo → Pronto/Entrega → Concluídos | Cancelados

**Card do pedido:** Número, Cliente, Valor, Pagamento, Tempo, Tipo (delivery/retirada)

**Tab Lista:** Tabela completa com filtros, busca, exportar CSV

**Tab Histórico:** Pedidos concluídos com filtros avançados

**Overlay Detalhes do Pedido (Drawer/BottomSheet):**

- Informações do Pedido (número, data, timeline de status)
- Informações do Cliente (nome, telefone, endereço)
- Itens (produto, variação, adicionais, observação, subtotal)
- Resumo financeiro (subtotal, frete, desconto, total)
- Método de pagamento (tipo, status, troco)
- Histórico de ações

**Ações:** Aceitar, Recusar (motivo), Avançar status, Cancelar (motivo), Imprimir comanda, WhatsApp, Ver histórico do cliente

**Notificações:** Som, notificação desktop, badge no menu

---

### Cardápio (`/admin/cardapio`)

**Estrutura hierárquica:**

```
Categoria
└── Produto
    ├── Variações (tamanhos/sabores) — mínimo 1, obrigatório
    └── Grupos de Adicionais
        └── Adicionais (itens extras)
```

**Tab Categorias:** Cards expandíveis, drag & drop, criar/editar/ativar/desativar/reordenar

**Campos da Categoria:** Nome, Descrição, Ícone, Ordem, Status

**Tab Produtos:** Grid ou lista, filtros, busca, criar/editar

**Criar/Editar Produto:**

- Informações básicas (nome, descrição, categoria, imagem, status)
- Flags (destaque, promoção)
- Variações (nome, opções com preço, obrigatório)
- Grupos de adicionais vinculados

**Tab Adicionais:** Listagem, criar/editar, grupos de adicionais com regras (min/max, obrigatório)

**Tab Combos:** Nome, preço, economia calculada, validade, itens fixos, grupos de escolha

**Tab Importar/Exportar:** Upload CSV/Excel com template disponível, preview antes de importar, exportar cardápio em CSV/Excel/PDF

---

### Marketing (`/admin/marketing`)

**Tab Cupons:** Listagem com filtros, criar/editar

**Campos do Cupom:**

- Código (único por loja)
- Tipo: Percentual / Valor Fixo / Frete Grátis
- Valor ou percentual
- Limite de uso (total e por cliente)
- Validade (data início/fim)
- Status (ativo/inativo)

**Tab Banners:** Listagem, criar/editar. Tipos: carrossel, destaque, popup. Imagem (max 2MB), link (produto/categoria/combo/externo/sem link)

**Tab Promoções:** Listagem, criar/editar. Tipos: desconto por produto, desconto por categoria, "leve e pague"

---

### Clientes (`/admin/clientes`)

**Tabs:** Todos, Favoritos, Inativos, Segmentação

**Tabela:** Nome, Telefone, E-mail, Total de Pedidos, GMV, Último Pedido, Ações

**Detalhe do Cliente (Drawer):**

- Dados pessoais e endereços salvos
- Histórico de pedidos completo
- Produtos mais pedidos
- Cupons utilizados
- Avaliações

---

### Equipe (`/admin/equipe`)

**Tabs:** Membros, Convites Pendentes, Logs de Atividade

**Criar Membro:** Nome, E-mail, Cargo (gerente_loja, staff_loja, entregador)

**Ações:** Editar, Alterar cargo, Resetar senha, Desativar, Remover

---

### Logística (`/admin/logistica`)

**Tab Entregadores:** Listagem com status em tempo real (offline/disponível/ocupado)

**Criar/Editar Entregador:** Nome, Telefone, CPF, E-mail, Dados logísticos (placa, CNH, veículo, conta bancária via JSONB)

**Ações:** Ativar/Desativar, Alterar status de trabalho

**Tab Acertos Financeiros:** Registro de repasses (corridas × valor pago), fechado por (gerente ou admin), comprovante

---

### Relatórios (`/admin/relatorios`)

**Tabs:** Vendas, Produtos, Marketing, Clientes, Financeiro

**Tab Vendas:** Pedidos por período, faturamento, ticket médio, canal (delivery/retirada)

**Tab Produtos:** Ranking de mais vendidos, itens menos vendidos, variações mais escolhidas

**Tab Marketing:** Uso de cupons (por código), taxa de conversão, banners mais clicados

**Tab Clientes:** Novos clientes, recorrência, LTV, segmentação geográfica

**Tab Financeiro:** Métodos de pagamento, comissões, inadimplência

---

### Configurações (`/admin/configuracoes`)

**Tabs Admin:** Dados da Loja, Funcionamento, Entrega, Pagamento, Aparência, Segurança

**Tabs Gerente:** Funcionamento, Entrega, Aparência (somente operacionais)

**Tab Dados da Loja (Admin):**

- Nome do estabelecimento, Descrição, Logo (light e dark), Banner
- Slug (URL única, validação em tempo real)
- Contato: Telefone, WhatsApp, E-mail
- Endereço completo (busca via CEP/ViaCEP)
- Redes sociais

**Tab Funcionamento:**

- Horários por dia da semana
- Toggle "Forçar fechado"
- Tempo estimado de entrega

**Tab Entrega:**

- Tipos: Delivery / Retirada / Consumo local
- Taxa de entrega (fixa, por bairro ou por km)
- Raio de entrega
- Pedido mínimo

**Tab Pagamento (Admin):**

- Pix (chave Pix)
- Cartão na entrega (débito/crédito)
- Dinheiro
- Ativar/desativar por método

**Tab Aparência (Admin/Gerente):**

- 4 cores base (Primary, Secondary, Background, Text)
- 20+ cores derivadas calculadas automaticamente
- Presets disponíveis: Laranja Vibrante (light), Vermelho Elegante (light), Azul Noturno (dark), Verde Moderno (dark)
- Preview em tempo real

**Tab Segurança (Admin):**

- Alterar senha
- Histórico de sessões ativas
- Solicitar exclusão do estabelecimento

---

## 🎨 Sistema de Tema Personalizável

**Objetivo:** Cada estabelecimento define as cores do seu cardápio público

**Localização:** `/admin/configuracoes` > Tab "Aparência"

**4 Cores Principais (Admin Loja define):**

1. **Primary** — Cor principal do estabelecimento
2. **Secondary** — Cor de superfícies/cards
3. **Background** — Cor de fundo geral
4. **Text** — Cor do texto

**20+ Cores Derivadas (Calculadas Automaticamente):**

- Bordas (4% contraste), Hover (9%), Active (15%)
- Text muted (40% transparência)
- Primary light (85% transparência)
- Sombras adaptativas
- Texto sobre cores (branco/preto com WCAG AA)

**Composable:** `useStoreTheme(loja_id)`

**Persistência:** `lojas.config_tema` (JSONB)

**Formato:** RGB Hexadecimal (máxima compatibilidade mobile)

---

## 🔐 Impersonation (Acesso de Suporte)

**Quem pode:** Admin Master e Gerente Master (conforme configuração)

### Modo Completo (CRUD)

- Leitura, criação, edição e exclusão
- Admin do estabelecimento pode ser notificado (configurável)
- Banner amarelo: "Você está acessando como: [Nome] — Modo Completo"
- Todas as ações registradas em auditoria

### Modo Leitura (READ-ONLY)

- Apenas visualização
- Admin do estabelecimento não é notificado
- Banner azul: "Você está visualizando: [Nome] — Somente Leitura"
- Botões de ação desabilitados

**Logs de Auditoria:** ID do usuário, ID do estabelecimento, modo, data/hora, IP, ações realizadas

**Base Legal (LGPD):** Art. 7º, V (execução de contrato) e Art. 7º, IX (interesse legítimo). Termos de Uso devem conter cláusula sobre acesso para suporte.

---

## 🛒 Cardápio Digital Público (`/{slug}`)

**Interface:** Mobile-First para clientes

### Estrutura da Página

**Cabeçalho:** Logo, nome, status (Aberto/Fechado + "Fecha às HH:MM"), link "Ver Mais" (modal com endereço, horários, contatos)

**Carrossel de Banners:** Administrado em Marketing, imagens clicáveis, auto-play

**Menu de Categorias:** Scroll horizontal, ancoragem por categoria (smooth scroll), sticky no topo

**Filtros e Busca:** Input de busca, ordenação (preço, mais vendidos, novidades)

**Listagem de Produtos:** Foto, nome, descrição, preço ("A partir de R$ XX"), badges

**Modal de Produto:** Imagem hero, variação obrigatória, adicionais condicionais, observação (max 200 chars), quantidade, total dinâmico

**Carrinho Flutuante:** Badge com quantidade, Drawer inferior com itens, taxa, cupom, total, botão "Finalizar Pedido"

---

### Fluxo de Checkout

1. **Identificação:** Nome (obrigatório), WhatsApp (obrigatório), E-mail (opcional)
2. **Endereço:** Delivery (CEP via ViaCEP ou GPS) ou Retirada
3. **Pagamento:** Pix Copia-Cola, Cartão na Entrega, Dinheiro (com troco)
4. **Cupom:** Campo com validação em tempo real
5. **Revisão:** Resumo completo
6. **Confirmação:** Código de rastreamento + link para tracking

---

### Rastreamento de Pedido (`/pedido/:codigo`)

**Status em tempo real:** Pendente → Aceito → Em Preparo → Pronto → Saiu para Entrega → Concluído

**Informações:** Tempo estimado, itens, endereço, método de pagamento

---

## 📋 Regras de Negócio Essenciais

1. **Slug único** por estabelecimento (globalmente)
2. **Configuração inicial** via alerta na dashboard (`onboarding_status`)
3. **Status de funcionamento** controlado por horários configurados
4. **Disponibilidade de produtos** controlada no Cardápio
5. **Todo produto** deve ter ao menos uma variação de preço
6. **Estados de pedidos** com logs de auditoria completo
7. **Impersonation** sempre gera log — sem exceções
8. **RLS (Row Level Security)** habilitado em todas as tabelas (SELECT)
9. **RPC Functions** com `SECURITY DEFINER` para todas as escritas (CUD) — **nenhuma tabela tem policy FOR INSERT/UPDATE/DELETE**
10. **UPDATE com COALESCE** — atualiza apenas campos enviados, nunca sobrescreve os demais
11. **Soft Delete** — dados nunca excluídos fisicamente (campo `deleted_at`)
12. **`role_id` protegido** — nunca exposto em RPCs de atualização de perfil

---

## ✅ Validações Específicas

| Campo               | Regra                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| **E-mail**          | Formato RFC, único, normalizado (case-insensitive)                    |
| **Senha**           | ≥8 chars, maiúscula + minúscula + número + especial                   |
| **Confirmar Senha** | Idêntica à senha                                                      |
| **WhatsApp**        | DDI+DDD+Número normalizado (+55 XX XXXXX-XXXX)                        |
| **CEP**             | Formato brasileiro (XXXXX-XXX)                                        |
| **Slug**            | a-z, 0-9, hífen, 3-50 chars, único, começa e termina com letra/número |
| **Preços**          | Numéricos, 2 decimais, não negativos                                  |
| **Imagens**         | Max 2MB, formatos: jpg, png, webp                                     |

---

## 🎨 UI/UX — Requisitos Visuais

- **Menu lateral:** fixo 100vh, sem scroll
- **Cabeçalho:** fixo, altura alinhada ao menu
- **Dark/Light mode:** toggle persistente (localStorage + cookie)
- **Feedback:** toasts, skeletons, estados vazios com call-to-action
- **Acessibilidade:** navegação por teclado, contraste WCAG 2.1 AA, atributos aria-\*
- **Responsividade:** mobile-first, menu colapsável em mobile
- **Performance:** lazy-loading de rotas, paginação, virtual scroll em listas longas
- **Navegação:** URLs semânticas, breadcrumbs
- **Loading:** Skeletons em todas as tabelas e cards
- **Toasts:** Sucesso (verde), Erro (vermelho), Aviso (amarelo), Info (azul)

---

## 🔒 Segurança & Observabilidade

- Proteção de rotas privadas via middleware
- Senhas com hash irreversível (bcrypt gerenciado pelo Supabase Auth)
- Rate limiting anti-bruteforce no login
- Validação server-side obrigatória (RPCs)
- Isolamento multi-tenant por empresa/loja (RLS)
- Logs de eventos-chave (pedidos, logins, impersonation)
- Controle de sessões múltiplas
- Separação completa entre dados de tenants
- Sessão de Modo Leitura (impersonation) completamente isolada
- 2FA opcional (roadmap)

---

## 🗄️ Banco de Dados

### Estado Atual

- **35 tabelas** no schema `public`
- **21 migrations** executados em ordem
- **5 views** analíticas
- **21+ funções RPC** com `SECURITY DEFINER`
- **6 roles** RBAC cadastrados na tabela `public.roles`

### Módulos do Banco

| Módulo           | Tabelas Principais                                                                   |
| ---------------- | ------------------------------------------------------------------------------------ |
| Core             | `roles`, `perfis`, `empresas`, `lojas`                                               |
| Assinaturas      | `planos`, `assinaturas`, `faturas`                                                   |
| Catálogo         | `categorias`, `produtos`, `produto_variacoes`, `grupos_adicionais`, `adicionais`     |
| Combos/Promoções | `combos`, `combo_items`, `combo_grupos`, `promocoes`                                 |
| Marketing        | `banners`, `cupons`                                                                  |
| Pedidos          | `clientes`, `pedidos`, `pedido_itens`, `pedido_itens_adicionais`, `pedido_historico` |
| Logística        | `entregadores`, `entregador_acertos`                                                 |
| Suporte          | `tickets`, `ticket_mensagens`                                                        |
| Notificações     | `notificacoes`                                                                       |
| Auditoria/LGPD   | `logs_auditoria`, `lgpd_consentimentos`, `lgpd_solicitacoes_exclusao`                |

### Hierarquia Multi-tenant

```
empresas (tenants)
    ↓
lojas (estabelecimentos)
    ↓
perfis (usuários da loja)
```

### Triggers Automáticos

| Trigger             | Função                                               |
| ------------------- | ---------------------------------------------------- |
| `trg_*_modtime`     | Atualiza `updated_at` automaticamente em cada UPDATE |
| `trg_pedido_numero` | Gera número sequencial de pedido por loja            |

### Funções RPC (arquivos de migration)

| Arquivo                          | Escopo                                     |
| -------------------------------- | ------------------------------------------ |
| `12_rpc_core.sql`                | Perfis, Empresas, Lojas                    |
| `13_rpc_assinaturas.sql`         | Assinaturas e Planos                       |
| `14_rpc_catalogo.sql`            | Catálogo (categorias, produtos, variações) |
| `15_rpc_marketing.sql`           | Cupons e Banners                           |
| `16_rpc_pedidos.sql`             | Pedidos e Clientes                         |
| `17_rpc_logistica.sql`           | Entregadores e Acertos                     |
| `18_rpc_suporte_notif_audit.sql` | Suporte, Notificações e Auditoria          |
| `19_rpc_catalogo_combos.sql`     | Combos e Promoções                         |
| `20_rpc_auditoria_avancada.sql`  | Auditoria Avançada                         |

---

## 📦 Entregáveis por Fase

### Fase 1 — Autenticação e Base

- [ ] Login, Signup, Forgot Password
- [ ] Roteamento inteligente por cargo
- [ ] Alerta de configuração inicial (onboarding_status)

### Fase 2 — Painel Admin Loja

- [ ] Dashboard com KPIs
- [ ] Gestão de Pedidos (Kanban + Lista)
- [ ] Gestão de Cardápio completo (categorias, produtos, adicionais, combos)
- [ ] Marketing (cupons, banners, promoções)
- [ ] CRM de Clientes
- [ ] Gestão de Equipe (RBAC)
- [ ] Logística (entregadores + acertos)
- [ ] Relatórios completos
- [ ] Configurações (dados, horários, entrega, pagamento, aparência)
- [ ] Sistema de Tema Personalizável

### Fase 3 — Painel da Plataforma

- [ ] Dashboard Master com métricas globais
- [ ] Gestão de Empresas
- [ ] Gestão de Usuários
- [ ] Assinaturas e Planos
- [ ] Financeiro
- [ ] Suporte (tickets + base de conhecimento)
- [ ] Equipe interna (apenas Master)
- [ ] Relatórios da plataforma
- [ ] Configurações globais (gateway, segurança, integrações)

### Fase 4 — Funcionalidades Especiais

- [ ] Impersonation (Leitura e Escrita)
- [ ] Sistema de Notificações
- [ ] Logs de Auditoria
- [ ] Exportações (CSV, PDF, Excel)
- [ ] Impressão de comanda (80mm)

### Fase 5 — Cardápio Público

- [ ] Cardápio público funcional com tema personalizado
- [ ] Checkout completo (delivery + retirada)
- [ ] Rastreamento de pedido em tempo real
- [ ] Integração WhatsApp (envio do pedido)

---

## 📊 Métricas de Sucesso

### Para a Plataforma (Admin Master)

- MRR e ARR
- Total de lojas ativas
- Churn rate < 5%
- NPS > 50

### Para Estabelecimentos (Admin Loja)

- Pedidos/mês
- GMV (Gross Merchandise Value)
- Ticket médio
- Taxa de conversão do cardápio
- Avaliação média dos clientes

---

## 🚀 Roadmap Futuro

### Q3 2026

- [ ] App Mobile para entregadores (React Native)
- [ ] Sistema de Fidelidade / Pontos
- [ ] Programa de Indicação

### Q4 2026

- [ ] IA para recomendações de produtos
- [ ] Chatbot de atendimento
- [ ] A/B Testing

### 2027

- [ ] Marketplace de integrações
- [ ] API pública
- [ ] Internacionalização (pt-BR, en-US, es)

---

## 🛠️ Stack Tecnológico

| Camada         | Tecnologia                         |
| -------------- | ---------------------------------- |
| Framework      | Nuxt 4 + Vue 3 + TypeScript        |
| Estilização    | Tailwind CSS v4                    |
| Banco de Dados | PostgreSQL via Supabase            |
| Autenticação   | Supabase Auth (JWT)                |
| Storage        | Supabase Storage                   |
| Realtime       | Supabase Realtime                  |
| State          | Pinia                              |
| Formulários    | VeeValidate + Zod                  |
| HTTP           | Supabase Client (sem Axios direto) |
| Ícones         | Nuxt Icon (Lucide)                 |
| Fontes         | Inter Variable (Nuxt Fonts)        |

---

**Última Atualização:** Abril 2026  
**Status:** Em Desenvolvimento Ativo  
**Arquivo de referência anterior:** `.kiro/steering/02-prd.md` (versão com Whitelabel — obsoleta)
