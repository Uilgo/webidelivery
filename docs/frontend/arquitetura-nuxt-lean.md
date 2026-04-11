# 🌳 Arquitetura Nuxt Lean Completa - WebIDelivery

**Versão:** v3.0.0  
**Pilha:** Nuxt 4 (Vue.js), Nitro API, Zod, Supabase (banco + RLS + RPC + Auth), Pinia  
**Supabase:** apenas banco de dados, políticas RLS, funções RPC e autenticação — storage, realtime e demais serviços são externos.
**Foco:** Alta performance, componentes próprios (zero libs extras), imports explícitos rigorosos (exceto `app/components/` que é auto-import nativo do Nuxt) e forte adesão ao **Padrão Manager** em todas as páginas.

---

## 📐 Regras Fundamentais de Imports

| Camada               | Auto-import? | Regra                        |
| -------------------- | ------------ | ---------------------------- |
| `app/components/**`  | ✅ SIM       | Auto-import nativo Nuxt      |
| `app/composables/**` | ❌ NÃO       | Import explícito obrigatório |
| `app/stores/**`      | ❌ NÃO       | Import explícito obrigatório |
| `shared/**`          | ❌ NÃO       | Import explícito obrigatório |
| `server/**`          | ❌ NÃO       | Apenas no servidor           |

---

## 📐 Padrão Manager (Universal em Todas as Páginas)

```
[Feature]Page.vue          → apenas importa o Manager
    └── [Feature]Manager.vue  → orquestra estado, tabs, filtros, modals
          ├── [Feature]Tabs.vue       → controla aba ativa
          ├── [Feature]Filters.vue    → filtros globais (servem a TODAS as tabs)
          ├── sections/
          │   ├── [Feature]Section1.vue   → renderiza conteúdo da tab 1
          │   └── [Feature]Section2.vue   → renderiza conteúdo da tab 2
          └── [feature]-dialogs/               ← pasta semântica por entidade
              ├── [Feature]Drawer.vue          (desktop ≥768px — criar/editar via isEdicao)
              ├── [Feature]BottomSheet.vue     (mobile <768px — criar/editar via isEdicao)
              └── [Feature]DeleteModal.vue     (confirmação de exclusão)
```

**Regras absolutas:**

- ❌ Tabs NUNCA dentro de modals
- ❌ Accordions NUNCA dentro de modals
- ❌ Filtros NUNCA dentro de seções (sempre no Manager)
- ❌ Chamadas de API NUNCA no componente (sempre em composables)
- ✅ Lógica de negócio sempre em composables
- ✅ Detalhes complexos sempre em página separada (`/[painel]/[feature]/:id`)
- ✅ `*FormDrawer` e `*FormBottomSheet` são únicos por entidade — prop `isEdicao: boolean` controla criar vs editar
- ✅ `*Form.vue` recebe dados pré-preenchidos via prop quando `isEdicao=true`, vazio quando `false`

---

## 📁 Estrutura Completa de Diretórios

```text
app/
├── assets/
│   └── css/
│       ├── main.css                       # Arquivo principal (reset, tokens, estilos globais)
│       └── store-theme.css                # Tema dinâmico das lojas (4 cores → 20+ derivadas)
│
├── components/                            # 🟢 AUTO-IMPORT NATIVO DO NUXT
│   ├── layouts/
│   │   └── ModeToggle.vue                 # Toggle Dark/Light mode
│   │
│   └── ui/                                # 30 componentes 100% PRÓPRIOS
│       ├── Alert.vue
│       ├── Avatar.vue
│       ├── AvatarUpload.vue
│       ├── Badge.vue
│       ├── BottomSheet.vue                # Mobile <768px
│       ├── Button.vue
│       ├── Card.vue
│       ├── Checkbox.vue
│       ├── Collapse.vue
│       ├── ColorPicker.vue
│       ├── DatePicker.vue
│       ├── DateRangePicker.vue
│       ├── Divider.vue
│       ├── Drawer.vue                     # Desktop ≥768px
│       ├── Dropdown.vue
│       ├── EmptyState.vue
│       ├── Form.vue
│       ├── FormField.vue
│       ├── Input.vue
│       ├── Modal.vue                      # Desktop ≥768px
│       ├── PeriodoSelector.vue            # Hoje / 7 dias / 30 dias / Custom
│       ├── PictureUpload.vue
│       ├── RadioGroup.vue
│       ├── RangeSlider.vue
│       ├── Select.vue
│       ├── SelectMenu.vue                 # Select com busca
│       ├── Skeleton.vue
│       ├── Switch.vue
│       ├── Tabs.vue
│       ├── Textarea.vue
│       ├── Toast.vue
│       ├── Toaster.vue
│       └── Tooltip.vue
│
├── composables/                           # 🔴 IMPORT EXPLÍCITO OBRIGATÓRIO
│   ├── core/
│   │   ├── useAuth.ts                     # Login, Logout, Signup, Forgot, Reset + roteamento por cargo
│   │   ├── useImageUpload.ts              # Upload de imagens (storage externo)
│   │   └── useNotifications.ts            # Notificações globais
│   └── data/
│       └── useCep.ts                      # Busca de CEP (ViaCEP)
│
│   # ⚠️ NOTA: Composables de UI (useCalendar, useDropdownPosition, useToast, etc.)
│   # NÃO EXISTEM e NÃO SÃO NECESSÁRIOS. Todos os componentes em app/components/ui/
│   # são 100% auto-contidos — encapsulam sua própria lógica internamente.
│   # O sistema de toast usa: import { toast } from '~/components/ui/Toaster.vue'
│
├── stores/                                # 🔴 IMPORT EXPLÍCITO OBRIGATÓRIO (Pinia)
│   ├── perfilStore.ts                     # Perfil autenticado: cargo, IDs, computed de RBAC, sessão
│   ├── lojaStore.ts                       # Dados da loja do usuário: config_geral, config_tema, setup_status
│   ├── tenantStore.ts                     # Contexto do tenant por domínio/slug: resolve loja ativa, aplica tema CSS
│   ├── carrinhoStore.ts                   # Carrinho do cardápio público (persistido em cookie SSR-safe)
│   ├── notificacoesStore.ts               # Notificações in-app: contador não lidas, listagem, marcar lida (polling/websocket externo)
│   └── preferencesStore.ts               # Preferências do usuário: tema, timezone, locale, sidebar, layout
│
├── features/                              # 🔴 IMPORT EXPLÍCITO OBRIGATÓRIO
│   │
│   ├── components/shared/                 # Componentes reutilizáveis entre features
│   │   │
│   │   ├── FilterBar.vue                  # ⭐ Barra de controle global: Filtros + ViewToggle + botão "Novo"
│   │   │                                  #    Props: filters, fields, createLabel
│   │   │                                  #    Emits: @apply, @reset, @create, @view-change
│   │   │
│   │   ├── ViewToggle.vue                 # Alterna entre modo Card e Lista (grid/list icons)
│   │   │                                  #    Props: modelValue ('card' | 'list')
│   │   │                                  #    Emits: @update:modelValue
│   │   │
│   │   ├── DataContainer.vue              # ⭐ Container PAI: recebe items e modo de view atual
│   │   │                                  #    Renderiza CardView ou ListView conforme viewMode
│   │   │
│   │   ├── CardView.vue                   # Layout em grade — itera items e renderiza DataCard
│   │   ├── ListView.vue                   # Layout em tabela — itera items e renderiza DataList
│   │   │
│   │   ├── DataCard.vue                   # Item individual modo CARD (logo + título + badges + menu)
│   │   ├── DataList.vue                   # Item individual modo LISTA (row de tabela)
│   │   │
│   │   ├── KpiCard.vue                    # Card de KPI (uso exclusivo nos dashboards)
│   │   │
│   │   └── charts/
│   │       ├── GraficoLinha.vue
│   │       ├── GraficoBarra.vue
│   │       └── GraficoPizza.vue
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthManager.vue           # ⭐ Manager: importa todos os forms + useAuth, orquestra o fluxo
│   │   │   ├── LoginForm.vue             # Email + senha
│   │   │   ├── SignupForm.vue            # Nome + Sobrenome + Email + Senha + Confirmar Senha
│   │   │   ├── ForgotForm.vue            # Solicitar recuperação de senha (envia email)
│   │   │   ├── ResetForm.vue             # Senha + Confirmar Senha (após clicar no link do email)
│   │   │   └── FirstAccessForm.vue       # Troca de senha obrigatória p/ contas criadas nativamente
│   │   └── pages/                        # Cada page apenas importa o AuthManager
│   │       ├── LoginPage.vue             # → <AuthManager mode="login" />
│   │       ├── SignupPage.vue            # → <AuthManager mode="signup" />
│   │       ├── ForgotPage.vue            # → <AuthManager mode="forgot" />
│   │       ├── ResetPage.vue             # → <AuthManager mode="reset" />
│   │       └── FirstAccessPage.vue       # → <AuthManager mode="first-access" />
│   │
│   ├── onboarding/
│   │   └── admin-loja/                                # Wizard de cadastro inicial (4 etapas)
│   │       ├── components/
│   │       │   ├── OnboardingManagerAdmin.vue         # Manager do wizard
│   │       │   ├── OnboardingProgressAdmin.vue        # Barra de progresso (1/4, 2/4...)
│   │       │   ├── OnboardingNavigationAdmin.vue      # Botões Voltar/Próximo/Concluir
│   │       │   ├── steps/
│   │       │   │   ├── Step1DadosAdmin.vue            # Nome, Descrição, Logo, WhatsApp, Email
│   │       │   │   ├── Step2EnderecoAdmin.vue         # CEP, Estado, Cidade, etc
│   │       │   │   ├── Step3UrlAdmin.vue              # Slug (obrigatório) + Domínio próprio (opcional)
│   │       │   │   └── Step4RevisaoAdmin.vue          # Resumo + Aceite Termos
│   │       │   └── OnboardingSuccessAdmin.vue
│   │       ├── composables/
│   │       │   ├── useOnboardingAdmin.ts              # PAI (orquestra wizard)
│   │       │   ├── useOnboardingStepsAdmin.ts
│   │       │   ├── useOnboardingValidationAdmin.ts
│   │       │   └── useOnboardingSubmitAdmin.ts
│   │       └── pages/
│   │           └── OnboardingPageAdmin.vue
│   │
│   ├── admin-plataforma/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.vue
│   │   │   │   └── Header.vue
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardManager.vue               # Manager do dashboard (Plataforma)
│   │   │   │   ├── DashboardKpis.vue                  # 4 KPIs (Empresas, Lojas, MRR, Pedidos)
│   │   │   │   ├── MetricasSecundarias.vue            # ARR, Churn, Ticket, GMV, Lojas Ativas
│   │   │   │   ├── GraficoAnalises.vue                # Tabs: Lojas, Receita, Status, Planos
│   │   │   │   ├── RankingLojas.vue                   # Top 10 (Pedidos, GMV, Ticket)
│   │   │   │   └── FeedAtividades.vue
│   │   │   │
│   │   │   ├── empresas/
│   │   │   │   ├── EmpresaManager.vue                 # controla tab ativa (lista e planos)
│   │   │   │   ├── EmpresaTabs.vue                    # Lista | Planos
│   │   │   │   ├── EmpresaFilters.vue                 # Busca, Status, Plano, Data, Região
│   │   │   │   ├── lista/
│   │   │   │   │   ├── EmpresaListManager.vue         # orquestra lista + CRUD de empresas
│   │   │   │   │   ├── EmpresaListSection.vue         # R — Usa DataContainer (shared)
│   │   │   │   │   ├── EmpresaForm.vue                # campos básicos da empresa
│   │   │   │   │   └── empresa-dialogs/
│   │   │   │   │       ├── EmpresaDrawer.vue          # desktop: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │   │   │       ├── EmpresaBottomSheet.vue     # mobile: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │   │   │       ├── EmpresaDeleteModal.vue     # confirmação de exclusão
│   │   │   │   │       └── EmpresaSuspenderModal.vue  # confirmação de suspensão
│   │   │   │   └── planos/
│   │   │   │       ├── EmpresaPlanosManager.vue       # orquestra lista + CRUD de planos
│   │   │   │       ├── EmpresaPlanosSection.vue       # R — lista planos disponíveis
│   │   │   │       ├── PlanoForm.vue                  # campos do plano + definições de LIMITES (embutido)
│   │   │   │       └── plano-dialogs/
│   │   │   │           ├── PlanoDrawer.vue            # desktop: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │   │           ├── PlanoBottomSheet.vue       # mobile: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │   │           └── PlanoDeleteModal.vue       # confirmação de exclusão
│   │   │   │
│   │   │   ├── usuarios/
│   │   │   │   ├── UsuarioManager.vue                 # SEM TABS — Usa FilterBar + DataContainer (shared)
│   │   │   │   ├── UsuarioFilters.vue                 # Cargo, Status, Busca
│   │   │   │   ├── UsuarioForm.vue                    # campos do usuário
│   │   │   │   └── usuario-dialogs/
│   │   │   │       ├── UsuarioDrawer.vue              # desktop: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │   │       ├── UsuarioBottomSheet.vue         # mobile: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │   │       ├── UsuarioDeleteModal.vue         # confirmação de exclusão
│   │   │   │       └── UsuarioResetSenhaModal.vue     # confirmação de reset de senha
│   │   │   │
│   │   │   ├── relatorios/
│   │   │   │   ├── RelatorioManager.vue               # PÁGINA ÚNICA - SEM TABS
│   │   │   │   ├── RelatorioFilters.vue               # Período, Empresa
│   │   │   │   └── sections/
│   │   │   │       ├── RelatorioKpisSection.vue
│   │   │   │       ├── RelatorioCrescimentoSection.vue
│   │   │   │       ├── RelatorioFinanceiroSection.vue
│   │   │   │       ├── RelatorioEngajamentoSection.vue
│   │   │   │       └── RelatorioRankingsSection.vue
│   │   │   │
│   │   │   ├── configuracoes/
│   │   │   │   ├── ConfiguracaoManager.vue            # Orquestra configurações gerais do sistema
│   │   │   │   └── sections/
│   │   │   │       ├── ConfigPlataformaSection.vue    # Configs da plataforma (tema, email, chaves API)
│   │   │   │       └── ConfigEmpresasSection.vue      # Configurações globais padrão para lojistas
│   │   │   │
│   │   │   └── perfil/
│   │   │       ├── PerfilManager.vue                  # controla tab ativa (4 tabs)
│   │   │       ├── PerfilTabs.vue                     # Dados | Segurança | Notificações | Preferências
│   │   │       ├── dados/
│   │   │       │   ├── PerfilDadosManager.vue         # orquestra estado e ações da tab Dados
│   │   │       │   ├── PerfilDadosSection.vue
│   │   │       │   ├── DadosAvatarCard.vue
│   │   │       │   └── DadosPessoaisCard.vue
│   │   │       ├── seguranca/
│   │   │       │   ├── PerfilSegurancaManager.vue     # orquestra estado e ações da tab Segurança
│   │   │       │   ├── PerfilSegurancaSection.vue
│   │   │       │   ├── SegurancaSenhaCard.vue
│   │   │       │   ├── Seguranca2FACard.vue           # (futuro)
│   │   │       │   └── SegurancaSessoesCard.vue
│   │   │       ├── notificacoes/
│   │   │       │   ├── PerfilNotificacoesManager.vue  # orquestra estado e ações da tab Notificações
│   │   │       │   ├── PerfilNotificacoesSection.vue
│   │   │       │   ├── NotificacoesEmailCard.vue
│   │   │       │   ├── NotificacoesPushCard.vue
│   │   │       │   └── NotificacoesWhatsAppCard.vue
│   │   │       └── preferencias/
│   │   │           ├── PerfilPreferenciasManager.vue  # orquestra estado e ações da tab Preferências
│   │   │           ├── PerfilPreferenciasSection.vue
│   │   │           ├── PreferenciasAparenciaCard.vue
│   │   │           ├── PreferenciasIdiomaCard.vue     # (futuro)
│   │   │           └── PreferenciasTimezoneCard.vue
│   │   │
│   │   ├── composables/
│   │   │   ├── dashboard/
│   │   │   │   ├── useDashboard.ts
│   │   │   │   ├── useDashboardPlataforma.ts
│   │   │   │   ├── useGraficoAnalises.ts
│   │   │   │   ├── useRankingLojas.ts
│   │   │   │   └── useFeedAtividades.ts
│   │   │   ├── empresas/
│   │   │   │   ├── useEmpresas.ts                     # PAI
│   │   │   │   ├── useEmpresasCrud.ts
│   │   │   │   ├── useEmpresasFilters.ts
│   │   │   │   ├── useEmpresaPlanos.ts
│   │   │   │   └── useEmpresaLimites.ts
│   │   │   ├── usuarios/
│   │   │   │   ├── useUsuarios.ts                     # PAI
│   │   │   │   ├── useUsuariosCrud.ts
│   │   │   │   └── useUsuariosFilters.ts
│   │   │   ├── relatorios/
│   │   │   │   ├── useRelatorios.ts                   # PAI
│   │   │   │   ├── useRelatorioFilters.ts
│   │   │   │   ├── useRelatorioKpis.ts
│   │   │   │   ├── useRelatorioCrescimento.ts
│   │   │   │   ├── useRelatorioFinanceiro.ts
│   │   │   │   ├── useRelatorioEngajamento.ts
│   │   │   │   └── useRelatorioRankings.ts
│   │   │   ├── configuracoes/
│   │   │   │   ├── useConfiguracoes.ts                # PAI
│   │   │   │   └── useConfigPlataforma.ts
│   │   │   ├── perfil/
│   │   │   │   ├── usePerfil.ts                       # PAI
│   │   │   │   ├── usePerfilDados.ts
│   │   │   │   ├── usePerfilSeguranca.ts
│   │   │   │   ├── usePerfilNotificacoes.ts
│   │   │   │   └── usePerfilPreferencias.ts
│   │   │   └── shared/
│   │   │       └── usePermissoes.ts                   # RBAC
│   │   │
│   │   └── pages/
│   │       ├── DashboardPage.vue
│   │       ├── EmpresasPage.vue
│   │       ├── UsuariosPage.vue
│   │       ├── RelatoriosPage.vue
│   │       ├── ConfiguracoesPage.vue
│   │       └── PerfilPage.vue
│   │
│   ├── admin-loja/
│   │   ├── components/
│   │   │   └── layout/                                # Apenas layout fica em components/
│   │   │       ├── Sidebar.vue
│   │   │       └── Header.vue
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardManager.vue
│   │   │   ├── DashboardKpis.vue                  # Faturamento, Pedidos, Clientes, Taxa Conclusão
│   │   │   ├── DashboardAnalises.vue
│   │   │   ├── DashboardAnalisesTabs.vue          # Pedidos | Faturamento | Status | Produtos
│   │   │   ├── sections/
│   │   │   │   ├── AnalisePedidosSection.vue      # Gráfico Linha
│   │   │   │   ├── AnaliseFaturamentoSection.vue  # Gráfico Barras
│   │   │   │   ├── AnaliseStatusSection.vue       # Gráfico Doughnut
│   │   │   │   └── AnaliseProdutosSection.vue     # Top 10 Barras Horizontais
│   │   │   ├── DashboardPedidosAndamento.vue      # Feed tempo real
│   │   │   ├── DashboardProdutosMaisVendidos.vue  # Top 5 ou Top 10
│   │   │   └── DashboardEficienciaOperacional.vue # Preparo, Entrega, Satisfação, Cancelados
│   │   │
│   │   ├── pedidos/
│   │   │   ├── PedidosManager.vue                 # Usa FilterBar + DataContainer (shared)
│   │   │   ├── PedidosStatusTabs.vue              # Todos | Pendentes | Aceitos | Em preparo | etc
│   │   │   └── pedido-dialogs/
│   │   │       ├── PedidoDrawer.vue               # detalhes do pedido (desktop)
│   │   │       ├── PedidoBottomSheet.vue          # detalhes do pedido (mobile)
│   │   │       ├── PedidoCancelarModal.vue        # confirmação cancelar (desktop)
│   │   │       ├── PedidoCancelarBottomSheet.vue  # confirmação cancelar (mobile)
│   │   │       ├── PedidoReativarModal.vue        # confirmação reativar (desktop)
│   │   │       └── PedidoReativarBottomSheet.vue  # confirmação reativar (mobile)
│   │   │
│   │   ├── cardapio/
│   │   │   ├── CardapioManager.vue                # controla tab ativa + estado global do cardápio
│   │   │   ├── CardapioTabs.vue                   # Categorias | Produtos | Adicionais | Combos
│   │   │   │
│   │   │   ├── categorias/
│   │   │   │   ├── CategoriasManager.vue          # orquestra estado e composables de categorias
│   │   │   │   ├── CategoriasSection.vue          # R — Usa DataContainer (shared)
│   │   │   │   ├── CategoriaForm.vue              # campos: nome, descrição, ícone, status
│   │   │   │   └── categoria-dialogs/
│   │   │   │       ├── CategoriaDrawer.vue        # desktop: criar/editar (prop isEdicao)
│   │   │   │       ├── CategoriaBottomSheet.vue   # mobile: criar/editar (prop isEdicao)
│   │   │   │       └── CategoriaDeleteModal.vue   # confirmação de exclusão
│   │   │   │
│   │   │   ├── produtos/
│   │   │   │   ├── ProdutosManager.vue            # orquestra estado e composables de produtos
│   │   │   │   ├── ProdutosSection.vue            # R — Usa DataContainer (shared)
│   │   │   │   ├── ProdutoForm.vue                # campos: dados + variações + grupos de adicionais
│   │   │   │   └── produto-dialogs/
│   │   │   │       ├── ProdutoDrawer.vue          # desktop: criar/editar (prop isEdicao)
│   │   │   │       ├── ProdutoBottomSheet.vue     # mobile: criar/editar (prop isEdicao)
│   │   │   │       └── ProdutoDeleteModal.vue     # confirmação de exclusão
│   │   │   │
│   │   │   ├── adicionais/
│   │   │   │   ├── AdicionaisManager.vue          # orquestra dois níveis: grupos + adicionais individuais
│   │   │   │   ├── AdicionaisSection.vue          # R — lista grupos via DataContainer (shared)
│   │   │   │   ├── GrupoAdicionaisForm.vue        # campos do grupo
│   │   │   │   ├── AdicionalForm.vue              # campos do adicional individual
│   │   │   │   ├── grupo-dialogs/
│   │   │   │   │   ├── GrupoAdicionaisDrawer.vue        # desktop: criar/editar grupo (prop isEdicao)
│   │   │   │   │   ├── GrupoAdicionaisBottomSheet.vue   # mobile: criar/editar grupo (prop isEdicao)
│   │   │   │   │   └── GrupoAdicionaisDeleteModal.vue   # confirmação de exclusão do grupo
│   │   │   │   └── adicional-dialogs/
│   │   │   │       ├── AdicionalDrawer.vue              # desktop: criar/editar adicional (prop isEdicao)
│   │   │   │       ├── AdicionalBottomSheet.vue         # mobile: criar/editar adicional (prop isEdicao)
│   │   │   │       └── AdicionalDeleteModal.vue         # confirmação de exclusão do adicional
│   │   │   │
│   │   │   └── combos/
│   │   │       ├── CombosManager.vue              # orquestra estado e composables de combos
│   │   │       ├── CombosSection.vue              # R — Usa DataContainer (shared)
│   │   │       ├── ComboForm.vue                  # campos: dados + itens/grupos do combo
│   │   │       └── combo-dialogs/
│   │   │           ├── ComboDrawer.vue            # desktop: criar/editar (prop isEdicao)
│   │   │           ├── ComboBottomSheet.vue       # mobile: criar/editar (prop isEdicao)
│   │   │           └── ComboDeleteModal.vue       # confirmação de exclusão
│   │   │
│   │   ├── marketing/
│   │   │   ├── MarketingManager.vue               # controla tab ativa (Cupons | Banners)
│   │   │   ├── MarketingTabs.vue
│   │   │   ├── cupons/
│   │   │   │   ├── CuponsManager.vue              # orquestra estado e composables de cupons
│   │   │   │   ├── CuponsSection.vue              # R — Usa DataContainer (shared)
│   │   │   │   ├── CupomForm.vue                  # campos do cupom
│   │   │   │   └── cupom-dialogs/
│   │   │   │       ├── CupomDrawer.vue            # desktop: criar/editar (prop isEdicao)
│   │   │   │       ├── CupomBottomSheet.vue       # mobile: criar/editar (prop isEdicao)
│   │   │   │       └── CupomDeleteModal.vue       # confirmação de exclusão
│   │   │   └── banners/
│   │   │       ├── BannersManager.vue             # orquestra estado e composables de banners
│   │   │       ├── BannersSection.vue             # R — Usa DataContainer (shared)
│   │   │       ├── BannerForm.vue                 # campos do banner
│   │   │       └── banner-dialogs/
│   │   │           ├── BannerDrawer.vue           # desktop: criar/editar (prop isEdicao)
│   │   │           ├── BannerBottomSheet.vue      # mobile: criar/editar (prop isEdicao)
│   │   │           └── BannerDeleteModal.vue      # confirmação de exclusão
│   │   │
│   │   ├── clientes/
│   │   │   ├── ClientesManager.vue                # Usa FilterBar + DataContainer (shared)
│   │   │   ├── ClienteForm.vue                    # campos do cliente
│   │   │   └── cliente-dialogs/
│   │   │       ├── ClienteDrawer.vue              # desktop: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │       ├── ClienteBottomSheet.vue         # mobile: detalhes (readonly) ou criar/editar (isEdicao)
│   │   │       └── ClienteDeleteModal.vue         # confirmação de exclusão
│   │   │
│   │   ├── relatorios/
│   │   │   ├── RelatoriosManager.vue
│   │   │   ├── RelatoriosFilters.vue              # PeriodoSelector + filtros
│   │   │   └── sections/
│   │   │       ├── RelatoriosKpis.vue
│   │   │       ├── RelatoriosVendas.vue
│   │   │       ├── RelatoriosProdutos.vue
│   │   │       └── RelatoriosClientes.vue
│   │   │
│   │   ├── configuracoes/
│   │   │   ├── ConfiguracoesManager.vue           # controla tab ativa (6 tabs)
│   │   │   ├── ConfiguracoesTabs.vue              # Dados | Horários | Pagamentos | Entrega | Aparência | Segurança
│   │   │   ├── dados/
│   │   │   │   ├── ConfigDadosManager.vue         # orquestra estado e ações da tab Dados
│   │   │   │   ├── ConfigDadosSection.vue
│   │   │   │   ├── IdentidadeVisualCard.vue       # Claro/Escuro + Logo
│   │   │   │   └── IdentidadeCard.vue             # Nome, WhatsApp, URL, Descrição
│   │   │   ├── horarios/
│   │   │   │   ├── ConfigHorariosManager.vue      # orquestra estado e ações da tab Horários
│   │   │   │   ├── ConfigHorariosSection.vue
│   │   │   │   ├── HorariosVisaoGeral.vue
│   │   │   │   ├── HorariosConfigurar.vue
│   │   │   │   └── HorariosDatasEspeciais.vue
│   │   │   ├── pagamentos/
│   │   │   │   ├── ConfigPagamentosManager.vue    # orquestra estado e ações da tab Pagamentos
│   │   │   │   ├── ConfigPagamentosSection.vue
│   │   │   │   ├── PagamentosVisaoGeral.vue
│   │   │   │   ├── PagamentosConfigurar.vue
│   │   │   │   └── PagamentosDicas.vue
│   │   │   ├── entrega/
│   │   │   │   ├── ConfigEntregaManager.vue       # orquestra estado e ações da tab Entrega
│   │   │   │   ├── ConfigEntregaSection.vue
│   │   │   │   ├── EntregaResumoLogistica.vue
│   │   │   │   ├── EntregaAreaCobertura.vue
│   │   │   │   ├── EntregaParametros.vue
│   │   │   │   └── EntregaAgendamento.vue
│   │   │   ├── aparencia/
│   │   │   │   ├── ConfigAparenciaManager.vue     # orquestra estado e ações da tab Aparência
│   │   │   │   ├── ConfigAparenciaSection.vue
│   │   │   │   ├── AparenciaPreview.vue           # Mockup celular
│   │   │   │   ├── AparenciaPaletas.vue
│   │   │   │   ├── AparenciaConstrutor.vue        # Cor da Marca + Fundo
│   │   │   │   ├── AparenciaCoresStatus.vue
│   │   │   │   └── AparenciaCaracteristicas.vue
│   │   │   └── seguranca/
│   │   │       ├── ConfigSegurancaManager.vue     # orquestra estado e ações da tab Segurança
│   │   │       ├── ConfigSegurancaSection.vue
│   │   │       ├── SegurancaLogsAuditoria.vue
│   │   │       ├── SegurancaPoliticaRetencao.vue
│   │   │       └── SegurancaExportacao.vue
│   │   │
│   │   ├── perfil/
│   │   │   ├── PerfilManager.vue                  # controla tab ativa (4 tabs)
│   │   │   ├── PerfilTabs.vue                     # Dados | Segurança | Notificações | Preferências
│   │   │   ├── dados/
│   │   │   │   ├── PerfilDadosManager.vue         # orquestra estado e ações da tab Dados
│   │   │   │   ├── PerfilDadosSection.vue
│   │   │   │   ├── DadosAvatarCard.vue
│   │   │   │   └── DadosPessoaisCard.vue
│   │   │   ├── seguranca/
│   │   │   │   ├── PerfilSegurancaManager.vue     # orquestra estado e ações da tab Segurança
│   │   │   │   ├── PerfilSegurancaSection.vue
│   │   │   │   ├── SegurancaSenhaCard.vue
│   │   │   │   ├── Seguranca2FACard.vue
│   │   │   │   └── SegurancaSessoesCard.vue
│   │   │   ├── notificacoes/
│   │   │   │   ├── PerfilNotificacoesManager.vue  # orquestra estado e ações da tab Notificações
│   │   │   │   ├── PerfilNotificacoesSection.vue
│   │   │   │   ├── NotificacoesEmailCard.vue
│   │   │   │   ├── NotificacoesPushCard.vue
│   │   │   │   └── NotificacoesWhatsAppCard.vue
│   │   │   └── preferencias/
│   │   │       ├── PerfilPreferenciasManager.vue  # orquestra estado e ações da tab Preferências
│   │   │       ├── PerfilPreferenciasSection.vue
│   │   │       ├── PreferenciasAparenciaCard.vue
│   │   │       ├── PreferenciasIdiomaCard.vue
│   │   │       └── PreferenciasTimezoneCard.vue
│   │   │
│   │   ├── composables/
│   │   │   ├── dashboard/
│   │   │   │   ├── useDashboardLoja.ts                # PAI
│   │   │   │   ├── useDashboardKpis.ts
│   │   │   │   ├── useDashboardAnalises.ts            # Lógica dos gráficos (Faturamento, Pedidos, etc)
│   │   │   │   ├── useDashboardPedidos.ts             # Feed de pedidos em andamento
│   │   │   │   ├── useDashboardProdutos.ts            # Lógica dos produtos mais vendidos
│   │   │   │   └── useDashboardEficiencia.ts          # Preparo, Entrega, Satisfação, Cancelados
│   │   │   ├── pedidos/
│   │   │   │   ├── usePedidos.ts                      # PAI
│   │   │   │   ├── usePedidosCrud.ts
│   │   │   │   ├── usePedidosFilters.ts
│   │   │   │   └── usePedidosStatus.ts
│   │   │   ├── cardapio/
│   │   │   │   ├── useCardapio.ts                     # PAI
│   │   │   │   ├── useCardapioFilters.ts
│   │   │   │   ├── useCategorias.ts
│   │   │   │   ├── useProdutos.ts
│   │   │   │   ├── useAdicionais.ts
│   │   │   │   └── useCombos.ts
│   │   │   ├── marketing/
│   │   │   │   ├── useMarketing.ts                    # PAI
│   │   │   │   ├── useMarketingFilters.ts
│   │   │   │   ├── useCupons.ts
│   │   │   │   └── useBanners.ts
│   │   │   ├── clientes/
│   │   │   │   ├── useClientes.ts                     # PAI
│   │   │   │   ├── useClientesCrud.ts
│   │   │   │   └── useClientesFilters.ts
│   │   │   ├── relatorios/
│   │   │   │   ├── useRelatoriosLoja.ts               # PAI
│   │   │   │   ├── useRelatoriosFilters.ts
│   │   │   │   ├── useRelatoriosKpis.ts
│   │   │   │   ├── useRelatoriosVendas.ts
│   │   │   │   ├── useRelatoriosProdutos.ts
│   │   │   │   └── useRelatoriosClientes.ts
│   │   │   ├── configuracoes/
│   │   │   │   ├── useConfiguracoesLoja.ts            # PAI
│   │   │   │   ├── useConfigDados.ts
│   │   │   │   ├── useConfigHorarios.ts
│   │   │   │   ├── useConfigPagamentos.ts
│   │   │   │   ├── useConfigEntrega.ts
│   │   │   │   ├── useConfigAparencia.ts
│   │   │   │   └── useConfigSeguranca.ts
│   │   │   └── perfil/
│   │   │       ├── usePerfil.ts                       # PAI
│   │   │       ├── usePerfilDados.ts
│   │   │       ├── usePerfilSeguranca.ts
│   │   │       ├── usePerfilNotificacoes.ts
│   │   │       └── usePerfilPreferencias.ts
│   │   │
│   │   └── pages/
│   │       ├── DashboardPage.vue
│   │       ├── PedidosPage.vue
│   │       ├── CardapioPage.vue
│   │       ├── MarketingPage.vue
│   │       ├── ClientesPage.vue
│   │       ├── RelatoriosPage.vue
│   │       ├── ConfiguracoesPage.vue
│   │       └── PerfilPage.vue
│   │
│   └── cardapio-publico/
│       ├── components/                                # apenas componentes visuais puros reutilizáveis
│       │   ├── ProdutoCard.vue                        # card compacto (Ofertas — scroll horizontal)
│       │   ├── ProdutoListItem.vue                    # item lista (seções — scroll vertical)
│       │   ├── ProdutoBadge.vue                       # badges: "Promoção", "Destaque", "% desconto"
│       │   └── ProdutoPreco.vue                       # preço: riscado + atual + "A partir de"
│       │
│       ├── header/
│       │   ├── CardapioHeader.vue                     # hero: logo, nome, descrição, Aberto/Fechado, tempo, "Ver Mais"
│       │   ├── CardapioEntregaInfo.vue                # barra: "Entregamos em [cidade] • Bairros: ..."
│       │   ├── CardapioInfoDrawer.vue                 # "Ver Mais" desktop/tablet: endereço, horários, contato
│       │   └── CardapioInfoBottomSheet.vue            # "Ver Mais" mobile: mesmo conteúdo do Drawer
│       │
│       ├── banner/
│       │   ├── BannerCarrossel.vue                    # carrossel de banners configurados no marketing
│       │   └── BannerSlide.vue                        # slide individual
│       │
│       ├── categorias/
│       │   └── CategoriasNav.vue                      # tabs horizontais com scroll + "Todos" fixo
│       │
│       ├── busca/
│       │   ├── CardapioBusca.vue                      # input busca + ícone ordenação + ícone filtro
│       │   └── CardapioFiltrosModal.vue               # modal de filtros avançados
│       │
│       ├── secoes/
│       │   ├── SecaoOfertasImperdiveis.vue            # carrossel horizontal de ProdutoCard
│       │   ├── SecaoMaisVendidos.vue                  # lista vertical de ProdutoListItem
│       │   └── SecaoCategoria.vue                     # título + descrição + lista vertical de ProdutoListItem
│       │
│       ├── carrinho/
│       │   ├── CarrinhoSidebar.vue                    # desktop: sidebar fixa à direita
│       │   ├── CarrinhoBarra.vue                      # mobile: barra flutuante no rodapé "Ver carrinho | R$ X"
│       │   ├── CarrinhoResumo.vue                     # conteúdo reutilizável: itens + subtotal + taxa + total
│       │   └── carrinho-dialogs/
│       │       ├── CarrinhoDrawer.vue                 # desktop: drawer lateral
│       │       └── CarrinhoBottomSheet.vue            # mobile: bottom sheet com CarrinhoResumo
│       │
│       ├── produto-dialogs/
│       │   ├── ProdutoDrawer.vue                      # desktop: detalhes + variações + adicionais + qty + adicionar
│       │   └── ProdutoBottomSheet.vue                 # mobile: mesmo conteúdo do Drawer
│       │
│       ├── checkout/
│       │   ├── CheckoutManager.vue
│       │   ├── CheckoutProgress.vue
│       │   ├── CheckoutNavigation.vue
│       │   ├── steps/
│       │   │   ├── Step1Identificacao.vue
│       │   │   ├── Step2Endereco.vue
│       │   │   ├── Step3Pagamento.vue
│       │   │   └── Step4Revisao.vue
│       │   └── CheckoutSuccess.vue
│       │
│       ├── rastreamento/
│       │   ├── RastreamentoManager.vue
│       │   ├── RastreamentoTimeline.vue
│       │   └── RastreamentoDetalhes.vue
│       │
│       ├── meus-pedidos/
│       │   └── MeusPedidosManager.vue                 # Usa DataContainer (shared)
│       │
│       ├── CardapioPublicoManager.vue                 # orquestra toda a página do cardápio
│       ├── composables/
│       │   ├── useCardapioPublico.ts                  # PAI
│       │   ├── useCardapioProdutos.ts
│       │   ├── useCardapioCategorias.ts
│       │   ├── useCardapioBusca.ts
│       │   ├── useCardapioCarrinho.ts
│       │   ├── useCardapioLoja.ts
│       │   ├── useCheckout.ts
│       │   ├── useRastreamento.ts
│       │   └── useMeusPedidos.ts
│       └── pages/
│           ├── CardapioPublicoPage.vue
│           ├── CheckoutPage.vue
│           ├── RastreamentoPedidoPage.vue
│           └── MeusPedidosPage.vue
│
├── middleware/                                        # Pipeline enxuto de execução (Nuxt Lean)
│   ├── 01.tenant.global.ts                            # 1. Resolve contexto (extrai slug da URL → popula tenantStore c/ tema/id)
│   └── 02.guard.global.ts                             # 2. Pipeline unificado de segurança (Fail-fast cascade):
│                                                      #    • Auth: Verifica sessão (redireciona em caso de falta de JWT)
│                                                      #    • First-Access: Trava na troca de senha se senha_temporaria = true
│                                                      #    • Onboarding: Trava na rota /onboarding se setup_status != 'concluido'
│                                                      #    • RBAC: Valida permissões (cargo atual vs rota destino solicitada)
│
├── pages/                                             # APENAS importam as Pages das features
│   ├── index.vue                                      # / → redirecionador (sem página, sem layout)
│   ├── [slug]/
│   │   ├── index.vue                                  # /{slug} → CardapioPublicoPage (cardapio-layout)
│   │   └── pedido/
│   │       ├── index.vue                              # /{slug}/pedido → MeusPedidosPage (cardapio-layout)
│   │       ├── checkout.vue                           # /{slug}/pedido/checkout → CheckoutPage (cardapio-layout)
│   │       └── [codigo].vue                           # /{slug}/pedido/{codigo} → RastreamentoPedidoPage (cardapio-layout)
│   ├── (auth)/
│   │   ├── login.vue                                  # → LoginPage (auth-layout)
│   │   ├── signup.vue                                 # → SignupPage (auth-layout)
│   │   ├── forgot-password.vue                        # → ForgotPage (auth-layout)
│   │   ├── reset-password.vue                         # → ResetPage (auth-layout)
│   │   ├── primeiro-acesso.vue                        # → FirstAccessPage (auth-layout) — Troca obrigatória
│   │   ├── confirm.vue                                # Callback PKCE — sem layout
│   │   └── plataforma/
│   │       └── login.vue                              # → LoginPage Plataforma (auth-layout)
│   ├── admin/
│   │   ├── onboarding.vue                             # → OnboardingPageAdmin (auth-layout)
│   │   ├── dashboard.vue                              # → DashboardPage (admin-layout)
│   │   ├── pedidos.vue                                # → PedidosPage (admin-layout)
│   │   ├── cardapio.vue                               # → CardapioPage (admin-layout)
│   │   ├── marketing.vue                              # → MarketingPage (admin-layout)
│   │   ├── clientes.vue                               # → ClientesPage (admin-layout)
│   │   ├── relatorios.vue                             # → RelatoriosPage (admin-layout)
│   │   ├── configuracoes.vue                          # → ConfiguracoesPage (admin-layout)
│   │   └── perfil.vue                                 # → PerfilPage (admin-layout)
│   └── plataforma/
│       ├── dashboard.vue                              # → DashboardPage (plataforma-layout)
│       ├── empresas.vue                               # → EmpresasPage (plataforma-layout)
│       ├── usuarios.vue                               # → UsuariosPage (plataforma-layout)
│       ├── relatorios.vue                             # → RelatoriosPage (plataforma-layout)
│       ├── configuracoes.vue                          # → ConfiguracoesPage (plataforma-layout)
│       └── perfil.vue                                 # → PerfilPage (plataforma-layout)
│
└── layouts/
    ├── auth-layout.vue        # Centralizado, bg limpo — todas as páginas de auth (admin_loja, admin_master, funcionários)
    ├── admin-layout.vue       # Sidebar + Header do painel Admin Loja
    ├── plataforma-layout.vue  # Sidebar + Header do painel Plataforma (admin_master + equipe)
    └── cardapio-layout.vue    # Sem sidebar/header de admin — aplica tema dinâmico da loja via tenantStore

server/
├── middleware/
│   ├── 01.rate-limiter.ts                             # Previne DDoS
│   └── 02.session-verifier.ts                         # Valida JWT antes das rotas
└── api/                                               # service_role key — auth.admin.* — nunca RPC
    │
    ├── admin/
    │   ├── roles/
    │   │   ├── index.get.ts                           # Lista cargos e permissões JSONB
    │   │   ├── index.post.ts                          # Cria novo cargo com JSONB de permissões
    │   │   ├── [id].put.ts                            # Atualiza cargo (nome, descrição, permissões)
    │   │   └── [id].delete.ts                         # Desativa cargo (bloqueado se houver perfis)
    │   ├── membros/
    │   │   ├── index.post.ts                          # Cria membro → auth.admin.createUser()
    │   │   ├── [id].put.ts                            # Atualiza credenciais → auth.admin.updateUserById()
    │   │   ├── [id].delete.ts                         # Hard delete membro → auth.admin.deleteUser()
    │   │   └── [id]/
    │   │       └── resetar-senha.post.ts              # Senha temporária → auth.admin.generateLink()
    │   ├── empresas/
    │   │   └── [id].delete.ts                         # Hard delete empresa + lojas + usuários → auth.admin.deleteUser() (múltiplos)
    │   ├── lojas/
    │   │   └── [id].delete.ts                         # Hard delete loja + membros exclusivos → auth.admin.deleteUser() (múltiplos)
    │   ├── planos/
    │   │   ├── index.post.ts                          # Cria plano (valida payload estrito)
    │   │   ├── [id].put.ts                            # Atualiza plano (COALESCE)
    │   │   └── [id].delete.ts                         # Arquiva plano (status = 'arquivado')
    │   ├── assinaturas/
    │   │   └── [id].put.ts                            # Upgrade/downgrade de plano ou ajuste de renova_em
    │   └── faturas/
    │       └── [id]/
    │           └── aprovar.post.ts                    # Aprova fatura PIX manual → avança renova_em atomicamente
    │
    ├── perfil/
    │   ├── credenciais.put.ts                         # Atualiza email/senha → auth.admin via API restrita
    │   └── encerrar-conta.delete.ts                   # Autodeleção total → auth.admin.deleteUser() + cascade
    │
    ├── faturas/
    │   └── comprovante.post.ts                        # Upload comprovante PIX → storage externo
    │
    ├── assinatura/
    │   └── webhook/
    │       └── [provider].post.ts                     # Webhooks externos (Cakto, Asaas) — idempotência via gateway_eventos
    │
    ├── cep/
    │   └── [cep].get.ts                               # GET /api/cep/:cep — Consulta CEP server-side
    │                                                  #   • Provedores com fallback: ViaCEP → BrasilAPI → Postmon
    │                                                  #   • Cache 24h (useStorage)
    │                                                  #   • Rate limit: 10 req/min por IP
    │                                                  #   • Retorna: { cep, logradouro, bairro, localidade, uf, estado }
    │
    ├── proxy/
    │   └── image.get.ts                               # GET /api/proxy/image?url=... — Proxy de imagens externas
    │                                                  #   • Contorna CORS para URLs de imagem (usado no UiPictureUpload)
    │                                                  #   • Whitelist de domínios (Cloudinary, Unsplash, S3, etc.)
    │                                                  #   • Proteção SSRF (bloqueia IPs privados)
    │                                                  #   • Cache 1h (useStorage) + máx 10MB
    │                                                  #   • Rate limit: 5 req/min por IP
    │
    └── utils/
        ├── _supabase-service.ts                       # Supabase Client com Service Role Key
        └── _zod-error-handler.ts                      # Retorna Status 400 seguro

shared/                                                # IMPORT EXPLÍCITO SEMPRE
├── constants/
│   ├── app.ts
│   ├── locale.ts
│   ├── rbac.ts                                        # cargos e hierarquia
│   └── status.ts                                      # valores válidos de status por tabela
├── schemas/                                           # Schemas Zod — validação frontend + server routes
│   ├── auth/
│   │   ├── login.ts
│   │   ├── signup.ts
│   │   ├── login-plataforma.ts
│   │   ├── signup-plataforma.ts
│   │   ├── forgot-password.ts
│   │   ├── reset-password.ts
│   │   └── first-access.ts
│   ├── common/
│   │   ├── email.ts
│   │   ├── password.ts
│   │   ├── phone.ts
│   │   ├── cep.ts
│   │   ├── cpf-cnpj.ts
│   │   ├── slug.ts
│   │   ├── endereco.ts
│   │   └── observacao.ts
│   ├── onboarding/
│   │   └── admin-loja.ts                              # step1 (dados+contato), step2 (endereço), step3 (slug+domínio)
│   ├── catalogo/
│   │   ├── categoria.ts
│   │   ├── produto.ts
│   │   ├── variacao.ts
│   │   ├── grupo-adicional.ts
│   │   ├── adicional.ts
│   │   ├── combo.ts
│   │   └── promocao.ts
│   ├── marketing/
│   │   ├── banner.ts
│   │   └── cupom.ts
│   ├── pedidos/
│   │   ├── cliente.ts
│   │   ├── pedido.ts
│   │   └── avaliacao.ts
│   ├── logistica/
│   │   ├── entregador.ts
│   │   └── acerto.ts
│   ├── assinaturas/
│   │   ├── plano.ts
│   │   └── assinatura.ts
│   └── cardapio-publico/
│       ├── checkout.ts
│       ├── carrinho.ts
│       ├── cupom.ts
│       └── rastreamento.ts
├── types/                                             # Espelha backend/types — fonte de verdade do banco
│   ├── supabase-database.ts                           # Tipos gerados pelo Supabase CLI
│   ├── database/                                      # Row types (SELECT) — o que vem do banco
│   │   ├── core.ts                                    # perfis, empresas, lojas, roles
│   │   ├── assinaturas.ts                             # planos, assinaturas, faturas, gateway_eventos
│   │   ├── catalogo.ts                                # categorias, produtos, variações, grupos, adicionais
│   │   ├── catalogo-combos.ts                         # combos, combo_grupos, combo_grupo_opcoes, promocoes
│   │   ├── marketing.ts                               # banners, cupons
│   │   ├── pedidos.ts                                 # clientes, pedidos, pedido_historico, avaliacoes
│   │   ├── logistica.ts                               # entregadores, entregador_acertos
│   │   ├── suporte.ts                                 # tickets, ticket_mensagens, ticket_notas
│   │   ├── notificacoes.ts                            # notificacoes
│   │   ├── auditoria.ts                               # audit_logs, logs_lojas, lgpd_*, impersonation_*
│   │   └── views.ts                                   # vw_master_empresas, vw_loja_dashboard_kpis, etc.
│   ├── jsonb/                                         # Shapes de campos JSONB — subtipos reutilizáveis
│   │   ├── loja-config.ts                             # LojaEndereco, LojaHorario, LojaConfigOperacao, etc.
│   │   ├── pedido-snapshots.ts                        # CarrinhoItem, PedidoLogistica, PedidoPagamento, etc.
│   │   ├── plano-config.ts                            # PlanoPreco, PlanoLimites, PlanoRecurso
│   │   ├── cliente-config.ts                          # ClienteEnderecoSalvo, ClientePerfilCRM
│   │   ├── entregador-config.ts                       # PerfilLogistico, RegistroPagamentoAcerto
│   │   └── notificacao-payload.ts                     # NotificacaoPayload
│   ├── rpc/                                           # Parâmetros de RPCs (CUD) — o que vai pro banco
│   │   ├── core.ts                                    # RpcCriarPerfil*, RpcCriarEmpresa*, RpcCriarLoja*, etc.
│   │   ├── assinaturas.ts                             # RpcCriarPlano*, RpcCriarAssinatura*, etc.
│   │   ├── catalogo.ts                                # RpcCriarCategoria*, RpcCriarProduto*, etc.
│   │   ├── marketing.ts                               # RpcCriarBanner*, RpcCriarCupom*, etc.
│   │   ├── pedidos.ts                                 # RpcCriarCliente*, RpcCriarPedido*, etc.
│   │   ├── logistica.ts                               # RpcCriarEntregador*, RpcRegistrarAcerto*, etc.
│   │   ├── suporte.ts                                 # RpcCriarTicket*, RpcEnviarMensagem*, etc.
│   │   ├── notificacoes.ts                            # RpcCriarNotificacao*, RpcMarcarLida*, etc.
│   │   └── auditoria.ts                               # RpcRegistrarAuditLog*, RpcRegistrarConsentimento*, etc.
│   └── api/
│       └── cep.ts                                     # Resposta da API ViaCEP
└── utils/
    ├── formatters/
    │   ├── address.ts
    │   ├── cep.ts
    │   ├── codigo-rastreamento.ts
    │   ├── currency.ts
    │   ├── date.ts
    │   ├── datetime.ts
    │   ├── document.ts
    │   ├── number.ts
    │   ├── phone.ts
    │   ├── pix.ts
    │   ├── slug.ts
    │   └── text.ts
    └── validators/
        ├── cep.ts
        ├── document.ts
        ├── email.ts
        ├── password.ts
        ├── phone.ts
        └── slug.ts

nuxt.config.ts                                         # Regras Lean Nuxt
```

---

## 🚦 Fluxo de Segurança Fim a Fim

```
Usuário preenche form (ex: CategoriaForm)
  → Valida com schema Zod (shared/schemas/catalogo/categoria.ts) no frontend
  → useSupabaseClient().rpc('fn_rpc_criar_categoria', params)
      → RLS verifica cargo do usuário autenticado
      → RPC SECURITY DEFINER executa com privilégio elevado
      → Retorna resultado direto ao cliente

Operação crítica (ex: criar membro da equipe)
  → Valida com schema Zod no frontend
  → POST para /api/admin/membros (server route Nitro)
      → 02.session-verifier.ts verifica JWT + cargo
      → Zod valida body no servidor
      → _supabase-service.ts usa service_role key
      → supabase.auth.admin.createUser() + INSERT em perfis
```

---

## 📊 Totais do Projeto

| Camada                                                   | Quantidade   |
| -------------------------------------------------------- | ------------ |
| Componentes UI Base (`/ui/`)                             | 30           |
| Composables Globais                                      | 4            |
| Stores Pinia                                             | 6            |
| Páginas (rotas físicas Nuxt)                             | 19           |
| Componentes (features + modals + drawers + bottomsheets) | ~245         |
| Composables (features)                                   | ~64          |
| Schemas Zod (shared)                                     | ~35 arquivos |
| Rotas Nitro (server/api)                                 | 19 endpoints |

---

**Última Atualização:** Abril 2026  
**Status:** ✅ Blueprint completo — pronto para implementação
