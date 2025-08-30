# 🚀 WebiDelivery

**Sistema completo de gestão para delivery** - Painel administrativo moderno e cardápio digital dinâmico.

## 📋 Sobre o Projeto

O WebiDelivery é uma plataforma que permite a qualquer estabelecimento criar um cardápio digital com link próprio, receber pedidos e gerenciar suas operações através de um painel de controle eficiente e intuitivo.

### 🎯 Funcionalidades Principais

- 📊 **Dashboard** - Visão geral com métricas e KPIs
- 📦 **Gestão de Pedidos** - Controle completo do fluxo de pedidos
- 🍕 **Cardápio Digital** - Gerenciamento de categorias, produtos, adicionais e combos
- 🎯 **Marketing** - Cupons, banners, promoções e campanhas
- 📈 **Relatórios** - Analytics detalhados de vendas e performance
- ⚙️ **Configurações** - Personalização completa do sistema
- 🌐 **Cardápio Público** - Interface responsiva para clientes (/{slug})

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 15.5.0](https://nextjs.org) com App Router
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS v4 + CSS Variables
- **UI Framework:** [shadcn/ui](https://ui.shadcn.com)
- **Estado Global:** [Zustand](https://github.com/pmndrs/zustand)
- **Validação:** [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query)
- **Fonte:** [Inter](https://fonts.google.com/specimen/Inter)
- **Linting/Formatação:** [Biome](https://biomejs.dev)
- **Gerenciador de Pacotes:** pnpm

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado)

### Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd webidelivery

# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev
```

### Comandos Disponíveis

```bash
# Desenvolvimento (com hot reload)
pnpm dev

# Build de produção
pnpm build

# Executar build de produção
pnpm start

# Verificar código (linting)
pnpm lint

# Formatar código
pnpm format
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── (auth)/            # Autenticação
│   ├── (cardapio)/        # Cardápio público
│   └── admin/             # Painel administrativo
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   └── features/          # Componentes por funcionalidade
├── lib/
│   ├── mock/              # Dados e serviços mock
│   ├── services/          # Serviços da aplicação
│   └── utils.ts           # Utilitários
├── types/
│   └── entities/          # Tipos das entidades
└── store/                 # Estado global (Zustand)
```

## 📚 Arquivos de Referência para Desenvolvimento

**IMPORTANTE**: Durante o desenvolvimento, sempre consulte:

- 📄 **[PRD](.github/instructions/prd.md)** - Especificações completas do produto
- ⚙️ **[Rules](.github/instructions/rules.md)** - Regras de arquitetura e nomenclatura  
- 🗂️ **[Mock Structure](MOCK_STRUCTURE.md)** - Estrutura de dados mock
- 🛠️ **[Development References](.qoder/references.md)** - Guia rápido de desenvolvimento
- 📋 **[Shortcuts](.qoder/shortcuts.md)** - Comandos e atalhos úteis

> **Configuração**: O projeto possui configuração especial em `.qoder/config.json` para referência automática destes arquivos.

## 🏗️ Arquitetura

### Padrão por Features
O projeto segue uma **arquitetura por features** com Route Groups do Next.js:

- `(auth)` - Sistema de autenticação
- `(cardapio)` - Cardápio público e checkout  
- `admin` - Painel administrativo completo

### Dados Mock
Para desenvolvimento, o sistema utiliza uma estrutura completa de dados mock que simula:
- ✅ Autenticação e usuários
- ✅ Empresas e configurações
- ✅ Produtos e categorias
- ✅ Pedidos com diferentes status
- ✅ Sistema de cupons e promoções
- ✅ Relatórios e analytics

## 🎨 Design System

- **Tema:** Dark mode como padrão
- **Componentes:** shadcn/ui com tema "new-york"
- **Cores:** Sistema baseado em CSS Variables (OKLCH)
- **Tipografia:** Fonte Inter otimizada
- **Responsividade:** Mobile-first

## 📱 Funcionalidades por Módulo

### 🔐 Autenticação (/auth)
- Login/Cadastro/Recuperação de senha
- Validação completa com Zod
- Redirecionamentos inteligentes

### 🏢 Onboarding (/onboarding)
- Cadastro obrigatório da empresa
- Validação de slug personalizado
- Upload de logotipo

### 📊 Painel Admin (/admin)
- **Dashboard:** KPIs e métricas em tempo real
- **Pedidos:** 7 abas por status de pedido
- **Cardápio:** 4 abas (categorias, produtos, adicionais, combos)
- **Marketing:** Cupons, banners, promoções, campanhas
- **Relatórios:** 6 tipos de relatórios detalhados
- **Configurações:** 6 abas de personalização

### 🌐 Cardápio Público (/{slug})
- Interface responsiva para clientes
- Carrossel de banners promocionais
- Filtros e busca avançada
- Carrinho dinâmico e checkout
- Aplicação de cupons

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Deploy automático conectando ao Git
vercel --prod
```

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Docker

## 🤝 Contribuição

1. Sempre consulte os arquivos de referência antes de desenvolver
2. Siga as convenções de nomenclatura do `rules.md`
3. Use os dados mock disponíveis
4. Mantenha consistência com o design system
5. Execute `pnpm lint` antes de commitar

## 📄 Licença e Copyright

**Copyright © 2025 Igor Elias**

Este código é disponibilizado **exclusivamente para fins de portfólio e demonstração profissional**.

### 🚫 Restrições de Uso

- **É expressamente proibido** copiar, usar, modificar, distribuir ou vender este código, total ou parcialmente, sem autorização expressa por escrito do autor
- O acesso público a este repositório tem **apenas o objetivo de visualização** do trabalho realizado por recrutadores e profissionais da área
- **Nenhum direito de uso é concedido** além da visualização e análise do conteúdo
- Este projeto é protegido por direitos autorais e leis de propriedade intelectual

### 📞 Contato

Para dúvidas, solicitações de uso comercial ou propostas de colaboração:
- **Desenvolvedor:** Igor Elias
- **Contato:** https://www.linkedin.com/in/igor-elias-de-lima/

### ⚖️ Aviso Legal

O uso não autorizado deste código pode resultar em ações legais. Este projeto serve como demonstração de habilidades técnicas e não deve ser utilizado para fins comerciais sem permissão.

---
