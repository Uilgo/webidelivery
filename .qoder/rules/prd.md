# PRD

## Identidade do Produto

**Nome:** WebiDelivery

**Domínio:** www.webidelivery.com.br

## Proposta

O WebiDelivery tem como proposta permitir que qualquer estabelecimento crie um cardápio digital com um link próprio, receba pedidos e gerencie suas operações por meio de um painel de controle eficiente e intuitivo.

## Objetivo do Painel de Gerenciamento

O objetivo deste painel é fornecer aos administradores do sistema de delivery as ferramentas necessárias para:

- Controlar os pedidos em tempo real
- Gerenciar o cardápio de forma fácil e eficiente
- Implementar promoções e cupons de marketing para aumentar as vendas e a fidelidade do cliente
- Obter insights sobre as vendas por meio de relatórios detalhados
- Configurar e personalizar o sistema conforme as necessidades específicas do negócio

## Introdução

Este documento descreve a estrutura e as funcionalidades do painel de gerenciamento do WebiDelivery. O painel será composto por seis áreas principais para garantir a administração completa e eficiente do sistema de delivery:

- Dashboard
- Pedidos
- Cardápio
- Marketing
- Relatórios
- Configurações

O painel foi projetado para permitir que os administradores do sistema gerenciem as operações diárias de forma simples e intuitiva, com todas as ferramentas necessárias ao alcance de um clique.

## Mapa de Rotas (públicas/privadas)

### Públicas

- `/auth`: página unificada de autenticação (login/cadastro/esqueci senha)
- `/{slug}`: cardápio público do estabelecimento (ex.: /pizzaria-degust)

### Protegidas (após login)

- `/onboarding`: wizard obrigatório de cadastro de empresa (ver regras de redirecionamento)
- `/admin/dashboard`: Dashboard - página principal do painel de gerenciamento
- `/admin/pedidos`: gerenciamento de pedidos
- `/admin/cardapio`: gerenciamento do cardápio
- `/admin/marketing`: gestão de promoções e cupons
- `/admin/relatorios`: relatórios e analytics
- `/admin/configuracoes`: configurações do sistema

## Regras de redirecionamento

- **Rota raiz (/)**: Reservada para futuras expansões (landing page, área do cliente, etc.). Por enquanto, redireciona para `/admin/dashboard` se autenticado ou `/auth` se não autenticado
- Se o usuário se cadastrar e sair antes de concluir o onboarding, ao retornar e tentar cadastrar novamente com o mesmo e-mail, redirecionar para `/auth` (tab login) e exibir mensagem informativa: "Já existe uma conta criada com este e-mail. Faça login para continuar." Opções: Recuperar senha | Entrar agora
- Após login, se `onboarding = false` → sempre redirecionar para `/onboarding`
- Ao concluir onboarding (empresa criada com sucesso) defina `onboarding = true` e redirecione para `/admin/dashboard`
- **Estrutura do painel**: Todas as páginas do painel ficam sob `/admin/*` para clareza semântica

## Autenticação

### Página "/auth"

A página `/auth` é uma página unificada que contém três seções principais gerenciadas por tabs:

#### **Tab Login**

**Campos:**

- E-mail, Senha

**Ações:**

- Entrar
- Esqueci minha senha (alterna para tab de recuperação)

**Link para cadastro:** "Não tem conta? Cadastre-se" (alterna para tab cadastro)

#### **Tab Cadastro**

**Campos:**

- Imagem de Perfil (opcional)
- Nome (obrigatório)
- Sobrenome (obrigatório)
- E-mail (obrigatório, único, formato válido)
- Senha (obrigatório, ver regras)
- Confirmar Senha (obrigatório, deve coincidir com a senha)

**Validações & Regras:**

- E-mail único (case-insensitive)
- Senha: mínimo 8 caracteres, incluir pelo menos 1 letra e 1 número
- Confirmar senha deve ser idêntica à senha
- Mostrar feedback em linha (inline) e estados de erro/sucesso
- Consentimentos (checkbox) se necessário (ex.: termos, comunicações)

**Link para login:** "Já tem conta? Faça login" (alterna para tab login)

**Mensagens:**

- Sucesso cadastro: "Conta criada! Vamos configurar sua empresa." → redirecionar `/onboarding`
- E-mail já existente: ver regra de redirecionamento acima

#### **Tab Esqueci Senha**

**Fluxo:**

- Solicitar e-mail → enviar instrução de redefinição → estado de confirmação: "Enviamos um e-mail com instruções para redefinir sua senha."
- Opção de reenviar e-mail
- Link "Voltar ao login" (retorna para tab login)

**Acessibilidade/UX:**

- Labels claros, descrição de erros por campo, foco visível, suporte a teclado
- Transições suaves entre tabs sem reload da página
- URL com query params para acessar tabs específicas: `/auth?tab=login`, `/auth?tab=signup`, `/auth?tab=forgot`

## Onboarding (/onboarding)

**Objetivo:** criar a Empresa do usuário antes do uso do painel.

**Campos obrigatórios:**

- Logotipo da Empresa (opcional)
- Nome da Empresa
- Descrição da Empresa (opcional)
- Telefone WhatsApp
- **Endereço Completo:**
  - Estado
  - CEP (opcional) "O CEP deve ser opcional, pois nem sempre o usuário sabe qual seu cep, ele poderá adicionar nas configurações do painel posteriomente, se quiser"
  - Cidade
  - Rua
  - Número
  - Ponto de Referêcia (opcional)
- URL Personalizada (slug): ex.: webidelivery.com.br/{seunegocio}

**Validações para URL Personalizada:**

- Única no sistema
- Somente minúsculas, números e hífens (a-z, 0-9, -), iniciar por letra, sem espaços, tamanho 3–40
- Exibir disponibilidade em tempo real ("Disponível ✅" / "Indisponível ❌")
- Caso o usuario clicar na tecla espaço, automaticamente tem que adicionar um hífen, pra evitar que o usuário quebre a URL

**Critérios de Conclusão:**

- Todos os campos válidos
- Ao salvar com sucesso: setar `onboarding = true` e redirecionar para `/admin/dashboard`

**Mensagens:**

- Erros específicos por campo, mensagem geral em caso de falha no salvamento

## Painel de Gerenciamento (/admin e subseções)

### Layout do Painel

**Menu lateral fixo (sem scroll) com altura 100vh.**

**Cabeçalho do menu:** logotipo + nome do estabelecimento (do usuário corrente).

**Itens:** Dashboard, Pedidos, Cardápio, Marketing, Relatórios, Configurações.

**Rodapé do menu:** card do usuário com:

- Foto circular (do perfil)
- Nome e E-mail
- Ao clicar: abrir dropdown com Perfil e Sair

**Cabeçalho da página (topbar) fixo:**

- **Esquerda:** título da página atual (dinâmico)
- **Direita (nessa ordem):** ícone dark/light mode, ícone sino (notificações), botão "Acessar Cardápio" (abre `/{slug}` em nova aba)
- Altura igual à do cabeçalho do menu para alinhamento perfeito

### Seções do Painel

**Dashboard (/admin/dashboard):** visão geral (KPIs de hoje/7 dias/30 dias, pedidos em andamento, produtos mais vendidos, status de funcionamento, atalhos).

### Pedidos (/admin/pedidos)

**Objetivo:** Controlar e gerenciar todos os pedidos feitos pelos clientes, desde o momento da compra até a entrega final.

**Menus Tab:**

- **Pendentes:** Pedidos recebidos, aguardando confirmação
- **Aceitos:** Pedidos confirmados pela equipe e prontos para preparação
- **Em Preparo:** Pedidos que estão sendo preparados
- **Pronto pra Entrega:** Pedidos prontos para serem entregues
- **Em Entrega:** Pedidos que estão sendo transportados para o cliente
- **Concluídos:** Pedidos que foram entregues com sucesso
- **Cancelados:** Pedidos cancelados pelo cliente ou estabelecimento

**Funcionalidades:**

- Visualização Rápida de Pedidos: Filtros de data, status e tipo de pagamento
- Alteração de Status: Mudança de status conforme progresso do pedido
- Visualização de Detalhes: Modal de detalhe completo (produtos, quantidade, cliente, pagamento, histórico)
- Notificações de Status: Sistema de notificações para cliente e administrador

### Cardápio (/admin/cardapio)

**Objetivo:** Gerenciar e personalizar o cardápio digital.

**Menus Tab:**

- **Categorias:** Criação e organização das categorias do cardápio
- **Produtos:** Gestão de produtos individuais
- **Adicionais:** Criação de grupos de adicionais (ex.: queijo extra, molho, etc…)
- **Combos:** Criação de combos de produtos com preço promocional

#### Fluxo de Navegação e Integração entre Tabs

**Fluxo Principal de Criação:**
1. Usuário acessa a tab **Categorias** e cria uma nova categoria
2. Dentro do card/item da categoria, há um botão "+ Adicionar Produto"
3. Ao clicar neste botão:
   - A tab automaticamente muda para **Produtos**
   - Abre um modal de criação de produto
   - O campo "Categoria" já vem pré-selecionado com a categoria de origem
4. Após salvar o produto, permanece na tab Produtos com o novo produto visível

**Integração Visual entre Tabs:**
- Na tab **Categorias**: cada categoria exibe uma prévia dos seus produtos
- Na tab **Produtos**: filtro por categoria disponível no cabeçalho
- Navegação fluida mantendo contexto entre as tabs

#### Tab Categorias - Estrutura e Layout

**Layout Principal:**
- **Cabeçalho da Tab:**
  - Título "Categorias"
  - Botão "+ Nova Categoria" (canto superior direito)
  - Campo de busca por nome de categoria
  - Indicador de total de categorias

**Estrutura de Cards por Categoria:**

Cada categoria é representada por um card expandível com:

**Seção Superior do Card (sempre visível):**
- **Imagem da categoria** (thumbnail, 60x60px, canto esquerdo)
- **Nome da categoria** (texto principal, truncado se necessário)
- **Contador de produtos** ("12 produtos", texto secundário)
- **Status da categoria** (toggle ativo/inativo, canto superior direito)
- **Ações rápidas:**
  - Ícone de edição (abre modal de edição)
  - Ícone de exclusão (confirmação necessária)
  - Ícone de reordenação (drag & drop)

**Seção Expansível do Card:**
- **Botão de expansão** (chevron down/up) para mostrar/ocultar produtos
- **Grid de produtos da categoria** (quando expandido):
  - Layout: Grid responsivo (2-4 colunas conforme viewport)
  - **Mini-cards de produtos:**
    - Imagem do produto (80x80px)
    - Nome do produto (truncado)
    - Preço formatado (R$ 00,00)
    - Status visual (disponível/indisponível)
    - Hover: botões de ação rápida (editar/duplicar)
  - **Card "+ Adicionar Produto":**
    - Card especial com ícone "+" e texto "Adicionar Produto"
    - Ao clicar: executa o fluxo de navegação descrito acima
    - Visual diferenciado (borda tracejada, cor secundária)

**Estados Especiais:**
- **Categoria vazia:** Exibe mensagem "Nenhum produto nesta categoria" + botão "Adicionar Primeiro Produto"
- **Categoria com muitos produtos:** Limitação visual (ex: "Mostrando 8 de 25 produtos" + link "Ver todos na tab Produtos")
- **Categoria inativa:** Card com opacity reduzida e indicador visual

**Funcionalidades de UX:**
- **Expansão inteligente:** Lembrar estado expandido/colapsado por sessão
- **Busca em tempo real:** Filtrar categorias conforme digitação
- **Ordenação:** Drag & drop para reordenar categorias
- **Ações em lote:** Seleção múltipla para ações como ativar/desativar
- **Pré-visualização rápida:** Hover nos mini-cards de produtos mostra tooltip com mais detalhes

**Responsividade:**
- **Desktop:** Cards em grid de 2 colunas, produtos em 4 colunas
- **Tablet:** Cards em 1 coluna, produtos em 3 colunas
- **Mobile:** Cards em lista vertical, produtos em 2 colunas

#### Funcionalidades Gerais do Cardápio

- Gerenciamento de Produtos: Adicionar, editar ou remover produtos (nome, preço, descrição, imagem, status)
- Personalização de Preços: Modificar preços e criar promoções por item
- Configuração de Visibilidade: Exibir ou ocultar produtos por disponibilidade
- Gestão de Variações: Tamanhos, sabores e outras variações
- Controle de Disponibilidade: Status ativo/inativo
- Ordenação: Definir ordem de exibição dos produtos
- Destaques: Marcar produtos como destaque

### Marketing (/admin/marketing)

**Objetivo:** Gerenciar promoções, cupons e banners para atrair clientes.

**Menus Tab:**

- **Cupons:** Criação e gestão de cupons de desconto
- **Banners:** Criação e gestão de banners promocionais
- **Promoções:** Criação de promoções temporárias
- **Campanhas:** Gestão de campanhas promocionais

**Funcionalidades:**

- Gestão de Cupons: Cupons com descontos fixos ou percentuais, regras de uso, validade
- Banners do Carrossel: Banners promocionais com destinos configuráveis
- Promoções Temporárias: Ofertas limitadas por tempo ou estoque
- Campanhas: Combos promocionais e ofertas especiais
- Relatório de Performance: Métricas de desempenho das campanhas

### Relatórios (/admin/relatorios)

**Objetivo:** Fornecer insights sobre vendas e desempenho do sistema.

**Menus Tab:**

- **Pedidos:** Status de pedidos, tempo médio de preparação e entrega
- **Vendas:** Vendas totais por período, produtos mais vendidos
- **Produtos:** Desempenho detalhado de produtos
- **Marketing:** Performance de campanhas, cupons e banners
- **Financeiro:** Receita total, métodos de pagamento, custos
- **Personalizados:** Relatórios customizados com filtros avançados

**Funcionalidades:**

- Relatórios de Vendas: Vendas por período, ticket médio, origem dos pedidos
- Análise de Produtos: Produtos mais/menos vendidos, desempenho por categoria
- Métricas de Marketing: Taxa de conversão de cupons, performance de banners
- Dados Financeiros: Receita, métodos de pagamento utilizados
- Exportações: Exportar relatórios em CSV
- Filtros Avançados: Personalização por data, produto, categoria, método de pagamento

### Configurações (/admin/configuracoes)

**Objetivo:** Personalizar o sistema conforme necessidades do negócio.

**Menus Tab:**

- **Configurações Gerais (Do Estabelecimento):** Logotipo, Nome, Descrição, N° Whatsapp, Endereço Completo e personalização visual
- **Horários de Funcionamento:** Definição de horários de operação, abertura e fechamento do estabelecimento, definição de horários especiais, programar feriados, eventos, etc… de acordo com o que faça sentido
- **Métodos de Pagamento:** Configuração de formas de pagamento aceitas (Pix, Dinheiro, Cartão de Crédito, Cartão de débito, outras….)
- **Frete e Entrega:** Taxas de entrega (Sem Taxa, Taxa Única, Taxa por Distância, Taxa por Bairro, etc. "Usuário pode cadastrar outras formas") e áreas de cobertura (Bairros, Regiões, etc.). definir Tempo Mínimo e Máximo de entrega e Retirada (permitir ativar e dasativar ambos). Se tem ou Não Frete e os seu custo para cada bairro ou região, etc…
- **Personalizar Cardápio:** Configurações visuais do cardápio público, Alterar a URL "Slug" do seu cárdapio (aqui também deve ter todas as validações do slug também)
- **Segurança:** Dados de acesso e autenticação

**Funcionalidades:**

- Dados da Empresa: Informações básicas, logotipo, tema visual
- Horários: Configuração de funcionamento, horários especiais
- Pagamentos: PIX, cartões, dinheiro, configurações de gateway
- Entrega: Taxas, áreas de cobertura, frete grátis
- Personalização Visual: Cores, logos, layout do cardápio
- Notificações: Configuração de alertas e notificações
- Domínios: Gestão de URL personalizada

## Cardápio Digital Dinâmico (/{slug})

### Cabeçalho do Cardápio (card destacado)

- Logo do estabelecimento
- Nome do estabelecimento
- Status de funcionamento (Aberto/Fechado + "Fecha às HH:MM")
- Link "Ver Mais" (modal com descrição, endereço, contatos, horários)

### Carrossel de Banners Promocionais

- Administrado em Marketing
- Múltiplas imagens clicáveis com CTA opcional

### Menu Tab Horizontal de Categorias

- Scroll horizontal (touch/mouse)
- Estado ativo, ancoragem por categoria
- Filtro de listagem por categoria

### Linha de Filtros e Busca

- Input de busca (nome/descrição/ingredientes)
- Ícone de ordenação (preço, mais vendidos, novidades)
- Ícone de filtro (modal com filtros avançados)

### Listagem de Produtos (cards destacados)

- Foto, Nome, Descrição, Preço
- Modal de detalhes: imagem, descrição completa, variações, adicionais, quantidade
- Preço dinâmico (base + adicionais × qty)
- Botão "Adicionar ao carrinho"

### Carrinho e Checkout

- Carrinho flutuante com resumo
- Dados do cliente, endereço, método de pagamento
- Aplicação de cupons
- Confirmação do pedido

## Regras de Negócio Essenciais

- Slug único por empresa
- Onboarding obrigatório antes do acesso ao painel
- Status de funcionamento por horários configurados
- Disponibilidade de produtos controlada na pagina Cardápio (no card ou listagem de produtos vai ter um toggle de ativar ou desativar)
- Estados de pedidos com logs de auditoria
- Sistema de notificações para mudanças relevantes
- Marketing integrado com cupons e banners

## Endpoints/Contratos

### Auth

- `POST /auth/signup` → `{ user_id, onboarding }`
- `POST /auth/login` → `{ token, onboarding, empresa_id? }`
- `POST /auth/forgot` → `202`
- `POST /auth/reset` → `200`
- `GET /auth/me` → `{ user, empresa? }`

### Onboarding/Empresa

- `GET /empresa/slug-disponivel?slug=...` → `{ disponivel: true|false }`
- `POST /empresa` → `{ empresa_id, slug }`
- `GET /empresa` → dados da empresa
- `PUT /empresa/:id` → update

### Cardápio (Admin)

- `GET/POST/PUT/DELETE /categorias`
- `GET/POST/PUT/DELETE /produtos`
- `PUT /produtos/:id/disponibilidade`

### Marketing

- `GET/POST/PUT/DELETE /banners`
- `GET/POST/PUT/DELETE /cupons`

### Pedidos

- `GET /pedidos?status=&periodo=&q=`
- `POST /pedidos`
- `GET /pedidos/:id`
- `PUT /pedidos/:id/status`

### Público (Cardápio)

- `GET /publico/{slug}/info`
- `GET /publico/{slug}/categorias`
- `GET /publico/{slug}/produtos`
- `POST /publico/{slug}/checkout`

## Validações Específicas

- **E-mail:** formato RFC, unicidade global, normalização
- **Senha:** ≥8 chars, incluir letra e número
- **Confirmar Senha:** deve coincidir exatamente com a senha
- **WhatsApp:** DDI+DDD+Número normalizado
- **CEP:** formato brasileiro
- **Slug:** a-z, 0-9, hífen, 3-40 chars, único
- **Preços:** numéricos, 2 decimais, não negativos
- **Imagens:** limites de tamanho e proporções

## UI/UX - Requisitos Visuais

- Menu lateral: fixo 100vh, sem scroll
- Cabeçalho: fixo, altura alinhada ao menu
- Dark/Light mode: toggle persistente
- Feedback: toasts, skeletons, estados vazios
- Acessibilidade: navegação por teclado, contraste, aria-\*
- Responsividade: mobile-first, menu colapsável
- Performance: lazy-loading, paginação

## Mensagens do Sistema (pt-BR)

### Autenticação

- "Entrar" | "Criar conta" | "Cadastre-se" | "Faça login"
- "Já existe uma conta criada com este e-mail. Faça login para continuar."
- "Esqueci minha senha" | "Verifique seu e-mail." | "Voltar ao login"
- "As senhas não coincidem"
- "Não tem conta? Cadastre-se" | "Já tem conta? Faça login"

### Onboarding

- "Bem-vindo! Vamos configurar sua empresa."
- "URL personalizada disponível ✅" / "Indisponível ❌"
- "Empresa criada com sucesso!"

### Painel

- "Acessar Cardápio" | "Perfil" | "Sair"
- "Mover para..." | "Marcar como pronto"

### Cardápio

- "Aberto agora" | "Fechado no momento" | "Fecha às HH:MM"
- "Adicionar ao carrinho" | "Finalizar pedido"

## Critérios de Aceitação

### Autenticação

- E-mail já cadastrado → alterna para tab login com mensagem
- Login com `onboarding=false` → redireciona `/onboarding`
- Login com `onboarding=true` → redireciona `/` (Dashboard)
- Confirmar senha deve validar coincidência
- Navegação entre tabs funcionando corretamente

### Onboarding

- Slug inválido → bloqueia submit com erro
- Slug em uso → erro visível
- Conclusão → seta `onboarding=true` e redireciona `/` (Dashboard)

### Painel

- Menu lateral fixo 100vh
- Cabeçalho fixo e alinhado
- Dropdown do usuário funcional

### Cardápio

- `/{slug}` → renderiza todos os componentes
- Modal de produto → cálculo dinâmico de preço
- Cupom válido → recalcula total
- Estabelecimento fechado → bloqueia checkout

## Segurança & Observabilidade

- Proteção de rotas privadas
- Senhas hash irreversível
- Rate limiting anti-bruteforce
- Validação server-side
- Multi-tenant por empresa
- Logs de eventos-chave

## Entregáveis Finais

- Todas as rotas e páginas funcionando
- Estados de erro/sucesso implementados
- Regras de redirecionamento aplicadas
- Cardápio público navegável com checkout
- Painel com layout fixo e alinhado
- Sistema completo de gerenciamento (Dashboard, Pedidos, Cardápio, Marketing, Relatórios, Configurações)
