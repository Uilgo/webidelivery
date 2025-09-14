---
mode: agent
---
# Identidade do Produto

**Nome:** WebiDelivery

**Domínio:** www.webidelivery.com.br

## Proposta

O WebiDelivery tem como proposta permitir que qualquer estabelecimento crie um cardápio digital com um link próprio, receba pedidos e gerencie suas operações por meio de um painel de controle eficiente e intuitivo.

## Objetivo do Painel de Gerenciamento - MVP

O objetivo desta primeira versão (MVP) é fornecer aos administradores do sistema de delivery as ferramentas essenciais para:

- Gerenciar o cardápio de forma fácil e eficiente
- Implementar promoções e cupons de marketing básicos para aumentar as vendas
- Configurar completamente o sistema conforme as necessidades específicas do negócio
- Gerenciar dados pessoais e de acesso

> Nota sobre Versões Futuras: As funcionalidades de Dashboard com métricas/KPIs, sistema completo de Pedidos, Relatórios detalhados e sistema de Notificações serão implementadas em versões posteriores ao MVP.
> 

## Introdução

Este documento descreve a estrutura e as funcionalidades do painel de gerenciamento do WebiDelivery em sua versão MVP. O painel será composto por três áreas principais mais a página de perfil:

- **Cardápio** - Gerenciamento completo do cardápio digital
- **Marketing** - Gestão básica de promoções e cupons
- **Configurações** - Configurações completas do sistema e dados da empresa
- **Perfil** - Dados pessoais e configurações de acesso do usuário

O painel foi projetado para permitir que os administradores do sistema gerenciem as operações essenciais de forma simples e intuitiva, com foco no core da plataforma: criação e gestão de cardápios digitais.

## Mapa de Rotas (públicas/privadas)

### Públicas

- `/auth?mode=login`: página de login (padrão)
- `/auth?mode=signup`: página de cadastro
- `/auth?mode=forgot-password`: página de recuperação de senha
- `/{slug}`: cardápio público do estabelecimento (ex.: /pizzaria-degust)

### Protegidas (após login)

- `/onboarding`: wizard obrigatório de cadastro de empresa (ver regras de redirecionamento)
- `/admin/cardapio`: gerenciamento do cardápio (página inicial do painel)
- `/admin/marketing`: gestão de promoções e cupons
- `/admin/configuracoes`: configurações do sistema
- `/admin/perfil`: dados pessoais e configurações de acesso

## Regras de redirecionamento

- **Rota raiz (/)**: Reservada para futuras expansões (landing page, área do cliente, etc.). Por enquanto, redireciona para `/admin/cardapio` se autenticado ou `/auth` se não autenticado
- Se o usuário se cadastrar e sair antes de concluir o onboarding, ao retornar e tentar cadastrar novamente com o mesmo e-mail, redirecionar para `/auth` e exibir mensagem informativa: "Já existe uma conta criada com este e-mail. Faça login para continuar." Opções: Recuperar senha | Entrar agora
- Após login, se `onboarding = false` → sempre redirecionar para `/onboarding`
- Ao concluir onboarding (empresa criada com sucesso) defina `onboarding = true` e redirecione para `/admin/cardapio`
- **Estrutura do painel**: Todas as páginas do painel ficam sob `/admin/*` para clareza semântica

## Autenticação

A autenticação será gerenciada através de diferentes URLs com base no parâmetro `mode`, seguindo o padrão de navegação tradicional de sistemas web:

### Página de Login (/auth)

**Rota padrão:** `/auth` (se digitado manualmente na url sem parâmetros, deve redirecionar para a rota com o parâmetro `?mode=login`)

**Campos:**

- E-mail
- Senha

**Ações:**

- Botão "Entrar"
- Link "Esqueci minha senha" → redireciona para `/auth?mode=forgot-password`

**Links de navegação:**

- "Não tem conta? Cadastre-se" → redireciona para `/auth?mode=signup`

### Página de Cadastro (/auth?mode=signup)

**Rota:** `/auth?mode=signup`

**Campos:**

- Imagem de Perfil (opcional)
- Nome (obrigatório)
- Sobrenome (obrigatório)
- E-mail (obrigatório, único, formato válido)
- Senha (obrigatório, ver regras)
- Confirmar Senha (obrigatório, deve coincidir com a senha)

**Validações & Regras:**

- E-mail único (case-insensitive)
- Senha: mínimo 8 caracteres, incluir pelo menos 1 letra, 1 número e 1 caractere especial (@, #, $, *, &, etc...)
- Confirmar senha deve ser idêntica à senha
- Mostrar feedback em linha (inline) e estados de erro/sucesso
- Consentimentos (checkbox) se necessário (ex.: termos, comunicações)

**Links de navegação:**

- "Já tem conta? Faça login" → redireciona para `/auth?mode=login`

**Mensagens:**

- Sucesso cadastro: "Conta criada! Vamos configurar sua empresa." → redirecionar `/onboarding`
- E-mail já existente: ver regra de redirecionamento acima

### Página de Recuperação de Senha (/auth?mode=forgot)

**Rota:** `/auth?mode=forgot`

**Fluxo:**

- Campo para solicitar e-mail
- Botão "Enviar instruções"
- Após envio: estado de confirmação com mensagem "Enviamos um e-mail com instruções para redefinir sua senha."
- Opção de reenviar e-mail
- Link "Voltar ao login" → redireciona para `/auth?mode=login`

**Acessibilidade/UX:**

- Labels claros, descrição de erros por campo, foco visível, suporte a teclado
- Transições suaves entre páginas
- URLs semânticas para cada modo de autenticação
- Histórico do navegador funcionando corretamente para cada seção

## Onboarding (/onboarding)

**Objetivo:** criar a Empresa do usuário antes do uso do painel.

**Campos obrigatórios:**

- Logotipo da Empresa (opcional)
- Nome da Empresa
- Descrição da Empresa (opcional)
- Telefone WhatsApp
- **Endereço Completo:**
    - Estado
    - CEP (opcional) "O CEP deve ser opcional, pois nem sempre o usuário sabe qual seu cep, ele poderá adicionar nas configurações do painel posteriormente, se quiser"
    - Cidade
    - Rua
    - Número
    - Ponto de Referência (opcional)
- URL Personalizada (slug): ex.: webidelivery.com.br/{seunegocio}

**Validações para URL Personalizada:**

- Única no sistema
- Somente minúsculas, números e hífens (a-z, 0-9, -), iniciar por letra, sem espaços, tamanho 3–40
- Exibir disponibilidade em tempo real ("Disponível ✅" / "Indisponível ❌")
- Caso o usuário clicar na tecla espaço, automaticamente tem que adicionar um hífen, para evitar que o usuário quebre a URL

**Critérios de Conclusão:**

- Todos os campos válidos
- Ao salvar com sucesso: setar `onboarding = true` e redirecionar para `/admin/cardapio`

**Mensagens:**

- Erros específicos por campo, mensagem geral em caso de falha no salvamento

## Painel de Gerenciamento (/admin e subseções)

### Layout do Painel

**Menu lateral fixo (sem scroll) com altura 100vh.**

**Cabeçalho do menu:** logotipo + nome do estabelecimento (do usuário corrente).

**Itens do Menu MVP:**

- Cardápio
- Marketing
- Configurações

**Rodapé do menu:** card do usuário com:

- Foto circular (do perfil)
- Nome e E-mail
- Ao clicar: abrir dropdown com Perfil e Sair

**Cabeçalho da página (topbar) fixo:**

- **Esquerda:** título da página atual (dinâmico)
- **Direita (nessa ordem):** ícone dark/light mode, botão "Acessar Cardápio" (abre `/{slug}` em nova aba)
- Altura igual à do cabeçalho do menu para alinhamento perfeito

> Nota: Os ícones de notificações e funcionalidades de Dashboard serão adicionados em versões futuras.
> 

### Seções do Painel MVP

### Cardápio (/admin/cardapio)

**Objetivo:** Gerenciar e personalizar o cardápio digital completamente.

**Menus Tab:**

- **Categorias:** Criação e organização das categorias do cardápio
- **Produtos:** Gestão de produtos individuais
- **Adicionais:** Criação de grupos de adicionais (ex.: queijo extra, molho, etc.)
- **Combos:** Criação de combos de produtos com preço promocional

### Fluxo de Navegação e Integração entre Tabs

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

### Tab Categorias - Estrutura e Layout

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

### Funcionalidades Gerais do Cardápio

- Gerenciamento de Produtos: Adicionar, editar ou remover produtos (nome, preço, descrição, imagem, status)
- Personalização de Preços: Modificar preços e criar promoções por item
- Configuração de Visibilidade: Exibir ou ocultar produtos por disponibilidade
- Gestão de Variações: Tamanhos, sabores e outras variações
- Controle de Disponibilidade: Status ativo/inativo
- Ordenação: Definir ordem de exibição dos produtos
- Destaques: Marcar produtos como destaque

### Marketing (/admin/marketing)

**Objetivo:** Gerenciar promoções básicas e cupons para atrair clientes.

**Menus Tab:**

- **Cupons:** Criação e gestão de cupons de desconto
- **Banners:** Criação e gestão de banners promocionais básicos

> Funcionalidades Futuras: As tabs de Promoções avançadas e Campanhas complexas serão implementadas em versões posteriores.
> 

**Funcionalidades MVP:**

- Gestão de Cupons: Cupons com descontos fixos ou percentuais, regras básicas de uso, validade
- Banners do Carrossel: Banners promocionais simples com destinos configuráveis
- Visualização básica de uso: Contadores simples de utilização

### Configurações (/admin/configuracoes)

**Objetivo:** Personalizar o sistema conforme necessidades do negócio.

**Menus Tab:**

- **Configurações Gerais (Do Estabelecimento):** Logotipo, Nome, Descrição, N° WhatsApp, Endereço Completo e personalização visual
- **Horários de Funcionamento:** Definição de horários de operação, abertura e fechamento do estabelecimento, definição de horários especiais, programar feriados, eventos, etc… de acordo com o que faça sentido
- **Métodos de Pagamento:** Configuração de formas de pagamento aceitas (PIX, Dinheiro, Cartão de Crédito, Cartão de débito, outras….)
- **Frete e Entrega:** Taxas de entrega (Sem Taxa, Taxa Única, Taxa por Distância, Taxa por Bairro, etc. "Usuário pode cadastrar outras formas") e áreas de cobertura (Bairros, Regiões, etc.). definir Tempo Mínimo e Máximo de entrega e Retirada (permitir ativar e desativar ambos). Se tem ou Não Frete e os seu custo para cada bairro ou região, etc…
- **Personalizar Cardápio:** Configurações visuais do cardápio público, Alterar a URL "Slug" do seu cardápio (aqui também deve ter todas as validações do slug também)
- **Segurança:** Dados de acesso e autenticação

**Funcionalidades:**

- Dados da Empresa: Informações básicas, logotipo, tema visual
- Horários: Configuração de funcionamento, horários especiais
- Pagamentos: PIX, cartões, dinheiro, configurações de gateway
- Entrega: Taxas, áreas de cobertura, frete grátis
- Personalização Visual: Cores, logos, layout do cardápio
- Notificações: Configuração de alertas e notificações
- Domínios: Gestão de URL personalizada

### Perfil (/admin/perfil)

**Objetivo:** Gerenciar dados pessoais e configurações de acesso do usuário.

**Seções:**

- **Dados Pessoais:** Nome, sobrenome, e-mail, foto de perfil
- **Segurança:** Alteração de senha, configurações básicas de segurança
- **Preferências:** Configurações de interface (tema, idioma se aplicável)

**Funcionalidades:**

- Edição de dados pessoais
- Upload/alteração de foto de perfil
- Alteração de senha com validação
- Configurações de tema (dark/light mode)

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
- Ícone de ordenação (preço, alfabética)
- Filtro básico por disponibilidade

### Listagem de Produtos (cards destacados)

- Foto, Nome, Descrição, Preço
- Modal de detalhes: imagem, descrição completa, variações, adicionais, quantidade
- Preço dinâmico (base + adicionais × qty)
- Botão "Adicionar ao carrinho"

### Carrinho e Checkout Básico

- Carrinho flutuante com resumo
- Dados básicos do cliente
- Método de pagamento selecionado
- Aplicação de cupons
- Confirmação do pedido (envio via WhatsApp)

> Funcionalidades Futuras: Sistema completo de pedidos com status, integração com gateways de pagamento, e gestão avançada de entrega serão implementados posteriormente.
> 

## Regras de Negócio Essenciais - MVP

- Slug único por empresa
- Onboarding obrigatório antes do acesso ao painel
- Status de funcionamento por horários configurados
- Disponibilidade de produtos controlada na página Cardápio
- Aplicação básica de cupons
- Envio de pedidos via WhatsApp como solução temporária
- Sistema completo de configurações incluindo horários especiais, múltiplas formas de entrega e personalização visual avançada

## Validações Específicas

- **E-mail:** formato RFC, unicidade global, normalização
- **Senha:** ≥8 chars, incluir letra, número e caractere especial
- **Confirmar Senha:** deve coincidir exatamente com a senha
- **WhatsApp:** DDI+DDD+Número normalizado
- **CEP:** formato brasileiro (opcional)
- **Slug:** a-z, 0-9, hífen, 3-40 chars, único
- **Preços:** numéricos, 2 decimais, não negativos
- **Imagens:** limites básicos de tamanho
- **Horários:** validação de formato HH:MM, horário início < fim
- **Endereços de Entrega:** validação de CEP quando informado
- **Taxas de Entrega:** valores não negativos, configuração por região/bairro

## UI/UX - Requisitos Visuais MVP

- Menu lateral: fixo 100vh, sem scroll, com apenas 3 itens principais
- Cabeçalho: fixo, altura alinhada ao menu
- Dark/Light mode: toggle persistente
- Feedback: toasts básicos, estados de loading simples
- Acessibilidade: navegação por teclado, contraste adequado
- Responsividade: mobile-first, menu colapsável
- Performance: carregamento otimizado para funcionalidades essenciais

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
- "Produto adicionado com sucesso" | "Categoria criada com sucesso"

### Cardápio

- "Aberto agora" | "Fechado no momento" | "Fecha às HH:MM"
- "Adicionar ao carrinho" | "Finalizar pedido"

## Critérios de Aceitação - MVP

### Autenticação

- E-mail já cadastrado → redireciona para `/auth` com mensagem
- Login com `onboarding=false` → redireciona `/onboarding`
- Login com `onboarding=true` → redireciona `/admin/cardapio`
- Confirmar senha deve validar coincidência
- Navegação entre páginas de autenticação funcionando corretamente via URLs

### Onboarding

- Slug inválido → bloqueia submit com erro
- Slug em uso → erro visível
- Conclusão → seta `onboarding=true` e redireciona `/admin/cardapio`

### Painel

- Menu lateral fixo 100vh com 3 itens principais
- Cabeçalho fixo e alinhado
- Dropdown do usuário funcional
- Navegação entre seções funcionando

### Cardápio

- `/{slug}` → renderiza todos os componentes básicos
- Modal de produto → cálculo dinâmico de preço
- Cupom válido → aplicação de desconto
- Estabelecimento fechado → exibe status correto
- Geração de link WhatsApp funcionando

## Entregáveis Finais - MVP

- Sistema de autenticação completo com navegação por URLs
- Onboarding funcional
- Painel com 3 seções principais + perfil
- Cardápio público com checkout via WhatsApp
- Sistema básico de marketing (cupons e banners)
- Sistema completo de configurações do estabelecimento (horários especiais, múltiplas formas de entrega, personalização visual)
- Gestão completa de cardápio (categorias, produtos, adicionais, combos)
- Página de perfil do usuário

> Tecnologia: Todo o backend, banco de dados e autenticação será implementado usando Supabase.
>