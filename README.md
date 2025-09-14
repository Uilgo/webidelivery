# 🍕 WebiDelivery

**Sistema completo de cardápio digital para restaurantes e estabelecimentos de delivery**

Uma plataforma moderna que permite aos estabelecimentos criar seus cardápios digitais personalizados com URL única, gerenciar produtos, promoções e receber pedidos via WhatsApp.

---

## 🚀 Tecnologias Utilizadas

### **Stack Principal:**

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem rigorosa (sem `any`)
- **Tailwind CSS** - Estilização utilitária (único CSS permitido)
- **Supabase** - Backend-as-a-Service (autenticação, banco de dados, storage)
- **Biome** - Formatação e linting unificado

### **Arquitetura:**

- **React Server Components** por padrão
- **Client Components** apenas quando necessário
- **Feature-Based Structure** - Organização modular por funcionalidade
- **Route Groups** - Estrutura de rotas organizacional
- **Supabase SSR** - Server-Side Rendering com autenticação persistente

---

## 📂 Estrutura do Projeto

```
src/
├── app/                           # App Router (Next.js 15)
│   ├── (public)/                  # Páginas públicas
│   │   └── [slug]/               # Cardápio dinâmico /{slug}
│   ├── (auth)/                   # Autenticação
│   │   └── auth/                 # /auth?mode=login|signup|forgot
│   ├── (onboarding)/             # Configuração inicial
│   │   └── onboarding/           # /onboarding
│   ├── (admin)/                  # Painel administrativo
│   │   └── admin/
│   │       ├── cardapio/         # Gerenciamento do cardápio
│   │       ├── marketing/        # Cupons, banners e promoções
│   │       ├── configuracoes/    # Configurações da empresa
│   │       └── perfil/           # Perfil do usuário
│   └── api/                      # API Routes
│
├── features/                     # Features organizadas por domínio
│   ├── auth/                     # Autenticação e autorização
│   ├── onboarding/               # Setup inicial da empresa
│   ├── cardapio/                 # Gerenciamento do cardápio
│   ├── marketing/                # Cupons, banners e promoções
│   ├── configuracoes/            # Configurações do estabelecimento
│   ├── perfil/                   # Perfil do usuário
│   └── cardapio-publico/         # Cardápio público do cliente
│
├── components/                   # Componentes globais
│   ├── ui/                       # Componentes de interface
│   ├── layout/                   # Layout components (Sidebar, Header)
│   └── forms/                    # Componentes de formulário
│
└── lib/                         # Utilitários e configurações
    ├── constants/               # Constantes do sistema
    ├── validation/              # Validações e esquemas
    ├── utils/                   # Funções utilitárias
    └── types/                   # Tipos TypeScript globais
```

---

## ✨ Funcionalidades Principais

### 🔐 **Sistema de Autenticação**

- Login e cadastro com validação rigorosa
- Recuperação de senha via e-mail
- Redirecionamentos automáticos baseados no status do usuário
- Validação de e-mail único (case-insensitive)

### 🏢 **Onboarding de Empresa**

- Cadastro completo dos dados da empresa
- Validação de slug personalizado em tempo real
- Conversão automática de espaços para hífens na URL
- Validação de telefone WhatsApp brasileiro

### 📋 **Gerenciamento de Cardápio**

- **4 Tabs principais:**
  - 🏷️ **Categorias** - Organização do cardápio
  - 🍔 **Produtos** - Cadastro de itens
  - ➕ **Adicionais** - Extras e complementos
  - 📦 **Combos** - Produtos agrupados
- Integração entre tabs para fluxo otimizado
- Estados de loading, vazio e erro consistentes

### 🎯 **Marketing e Promoções**

- Criação de cupons de desconto (fixo/percentual)
- Banners promocionais para carrossel
- Promoções especiais para produtos/categorias
- Validação de regras e períodos de validade
- Preview em tempo real de banners e promoções
- Gerenciamento completo de campanhas promocionais

### ⚙️ **Configurações Avançadas**

- Dados gerais da empresa
- Horários de funcionamento (inclusive especiais)
- Métodos de pagamento configuráveis
- Frete e entrega por região/bairro
- Personalização visual do cardápio
- Configurações de segurança

### 🌐 **Cardápio Público**

- URL personalizada: `/{slug}`
- Header com status de funcionamento
- Carrossel de banners promocionais
- Menu horizontal de categorias
- Busca e filtros inteligentes
- Modal de produto com adicionais
- Carrinho flutuante
- Checkout via WhatsApp
- Aplicação de cupons
- **Mobile-first** e totalmente responsivo

---

## 🛠️ Configuração e Desenvolvimento

### **Pré-requisitos:**

- Node.js 18+
- pnpm (gerenciador de pacotes recomendado)
- Conta no [Supabase](https://supabase.com) (gratuita)

### **Instalação:**

```bash
# Clone o repositório
git clone https://github.com/igorelias/webidelivery.git
cd webidelivery

# Instale as dependências (inclui Supabase)
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas credenciais do Supabase

# Execute o servidor de desenvolvimento
pnpm dev
```

### **Configuração do Supabase:**

1. Crie um projeto no [Supabase Dashboard](https://app.supabase.com)
2. Copie a URL e a chave pública do projeto
3. Configure as variáveis de ambiente no `.env.local`
4. Configure URLs de redirect: `http://localhost:3000/auth/callback`
5. Execute as migrações do banco de dados (se aplicável)

### **Scripts Disponíveis:**

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção
pnpm lint         # Linting com Biome
pnpm format       # Formatação com Biome
```

---

## 📱 Design System

### **Breakpoints Responsivos:**

- **Mobile:** 320px+ (mobile-first)
- **Tablet:** 768px+
- **Desktop:** 1024px+
- **Large:** 1280px+

### **Padrões de Cores:**

```css
/* Cores principais */
Primary: Blue (600, 700, 800)
Secondary: Gray (50, 100, 200, 500, 900)
Success: Green (600)
Warning: Yellow (500)
Error: Red (600)
```

### **Tipografia:**

- **Font:** System fonts (sans-serif)
- **Tamanhos:** text-xs até text-4xl (Tailwind)

---

## 🎯 Padrões de Desenvolvimento

### **Regras Obrigatórias:**

- ✅ **TypeScript rigoroso** - Zero `any`, preferir `unknown` com type guards
- ✅ **Tailwind CSS apenas** - Proibido Sass, SCSS, CSS modules
- ✅ **Server Components** por padrão, Client Components quando necessário
- ✅ **Comentários em Português** - Documentação clara e objetiva
- ✅ **Princípio DRY** - Reutilização de componentes e hooks
- ✅ **Mobile-first** - Design responsivo obrigatório

### **Estrutura de Componentes:**

```tsx
// ✅ Exemplo de componente seguindo as regras
"use client"; // Apenas quando necessário

import { useState } from "react";
import { MESSAGES } from "@/lib/constants/messages";

export function ExampleComponent() {
  // Comentários explicativos em português
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Sempre usar Tailwind CSS */}
      <h2 className="text-lg font-semibold text-gray-900">
        {MESSAGES.FORM.SAVE}
      </h2>
    </div>
  );
}
```

---

## 🔒 Variáveis de Ambiente

```bash
# Application
NEXT_PUBLIC_APP_NAME="WebiDelivery"
NEXT_PUBLIC_APP_URL="https://webidelivery.com.br"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Opcional para operações administrativas

# Upload/Storage
UPLOAD_MAX_SIZE=5242880 # 5MB
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"

# WhatsApp Integration
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_BUSINESS_ID="your-business-id"

# Analytics (Opcional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Environment
NODE_ENV=development
```

---

## 📋 Status do MVP

### ✅ **Funcionalidades Implementadas:**

- [x] Sistema de autenticação completo
- [x] Onboarding de empresa
- [x] Painel administrativo com sidebar/header
- [x] Gerenciamento de cardápio (4 tabs)
- [x] Sistema de marketing (cupons, banners e promoções)
- [x] Configurações avançadas
- [x] Perfil do usuário
- [x] Cardápio público responsivo

### 🎯 **Metas de Performance:**

- [x] Lighthouse Score > 90
- [x] LCP < 2.5s
- [x] Next.js Image otimizado
- [x] Server Components implementados
- [x] Lazy loading configurado

---

## 🚧 Roadmap Futuro

### **Fase 2 (Pós-MVP):**

- 📊 Dashboard com métricas e KPIs
- 📱 Sistema completo de pedidos com status
- 📈 Relatórios detalhados de vendas
- 🔔 Sistema de notificações avançado
- 💳 Integração com gateways de pagamento
- 🚚 Sistema de entrega com tracking

### **Integrações Planejadas:**

- 💬 WhatsApp Business API
- 📍 Google Maps para delivery
- 💰 Mercado Pago / PagSeguro
- 📧 SendGrid para e-mails
- 📊 Google Analytics

---

## 📄 Licença e Copyright

**Copyright © 2025 Igor Elias**

Este código é disponibilizado exclusivamente para fins de **portfólio** e **demonstração profissional**.

### 🚫 **Restrições de Uso**

- É **expressamente proibido** copiar, usar, modificar, distribuir ou vender este código, total ou parcialmente, sem autorização expressa por escrito do autor
- O acesso público a este repositório tem apenas o objetivo de **visualização do trabalho** realizado por recrutadores e profissionais da área
- **Nenhum direito de uso** é concedido além da visualização e análise do conteúdo
- Este projeto é **protegido por direitos autorais** e leis de propriedade intelectual

### 📞 **Contato**

Para dúvidas, solicitações de uso comercial ou propostas de colaboração:

**Desenvolvedor:** Igor Elias  
**Contato:** https://www.linkedin.com/in/igor-elias-de-lima/

### ⚖️ **Aviso Legal**

O uso não autorizado deste código pode resultar em ações legais. Este projeto serve como **demonstração de habilidades técnicas** e não deve ser utilizado para fins comerciais sem permissão.
