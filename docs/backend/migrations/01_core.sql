-- Título: 01 - Core (Fundação do Sistema)
-- Descrição: Criação das tabelas centrais: roles, perfis (usuários), empresas (SaaS) e lojas (Múltiplas lojas por empresa).

-- ============================================================
-- Migration: 01_core.sql
-- Módulo: Core (Fundação do sistema)
-- Dependências: 00_extensions_e_funcoes_base.sql
-- Tabelas: roles, perfis, empresas, lojas
-- ============================================================

-- ===========================================
-- TABELA: roles
-- Catálogo fixo de cargos do sistema.
-- Dados inseridos via seed — somente leitura.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,          -- ex: 'admin_master', 'gerente_loja'
  nome         text NOT NULL,                 -- Nome legível
  descricao    text,                          -- Descrição do cargo
  permissoes   jsonb NOT NULL DEFAULT '[]'::jsonb,
  painel       text NOT NULL CHECK (painel IN ('master', 'loja')),
  nivel        integer NOT NULL CHECK (nivel >= 1),
  acesso_total boolean NOT NULL DEFAULT false,
  ativo        boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roles IS 'Catálogo fixo dos 6 cargos do sistema. Dados imutáveis inseridos via seed.';

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_roles_modtime ON public.roles;
CREATE TRIGGER trg_roles_modtime
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- Índices
CREATE INDEX IF NOT EXISTS idx_roles_painel ON public.roles (painel);
CREATE INDEX IF NOT EXISTS idx_roles_ativos ON public.roles (ativo) WHERE ativo = true;

-- RLS — tabela pública somente leitura
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "autenticado_pode_visualizar_roles" ON public.roles;
CREATE POLICY "autenticado_pode_visualizar_roles" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- ===========================================
-- SEED: Inserção dos 6 cargos fixos
-- ===========================================

INSERT INTO public.roles (slug, nome, descricao, permissoes, painel, nivel, acesso_total) VALUES
  ('admin_master',   'Administrador Master',  'Dono da plataforma — acesso total ao sistema', '[]'::jsonb, 'master', 1, true),
  ('gerente_master', 'Gerente Master',        'Equipe interna da plataforma', '["plataforma_dashboard:ler", "empresas:ler", "empresas:criar", "empresas:editar", "usuarios:ler", "usuarios:editar", "plataforma_relatorios:ler"]'::jsonb, 'master', 2, false),
  ('admin_loja',     'Administrador da Loja', 'Dono do delivery — acesso total ao painel da loja', '[]'::jsonb, 'loja', 3, true),
  ('gerente_loja',   'Gerente da Loja',       'Administrador operacional da loja', '["loja_dashboard:ler_kpis_operacionais", "pedidos:ler", "pedidos:escrever", "cardapio:ler", "cardapio:escrever", "marketing:ler", "marketing:escrever", "clientes:ler", "equipe:ler", "equipe:editar_operacionais"]'::jsonb, 'loja', 4, false),
  ('staff_loja',     'Equipe da Loja',        'Funcionário (caixa, cozinha)', '["pedidos:ler", "pedidos:atualizar_status", "cardapio:ler"]'::jsonb, 'loja', 5, false),
  ('entregador',     'Entregador',            'Motoboy — acesso restrito às suas entregas', '["pedidos_entrega:ler_atribuidos", "pedidos_entrega:atualizar_status"]'::jsonb, 'loja', 6, false)
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- TABELA: perfis
-- Espelho de auth.users — centro de gravidade
-- do sistema de permissões e multi-tenancy.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.perfis (
  id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id                 uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  permissoes_customizadas jsonb,
  empresa_id              uuid,             -- FK definida após criação de empresas
  loja_id                 uuid,             -- FK definida após criação de lojas
  nome                    text NOT NULL,
  sobrenome               text NOT NULL,
  email                   text NOT NULL UNIQUE,
  avatar_url              text,
  telefone                text,
  whatsapp                text,
  is_demo                 boolean NOT NULL DEFAULT false,
  status                  text NOT NULL DEFAULT 'ativo',
  onboarding_status       text,
  senha_temporaria        boolean NOT NULL DEFAULT false,
  ultimo_acesso_em        timestamptz,
  termos_aceitos_em       timestamptz,
  privacidade_aceita_em   timestamptz,
  preferencias            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.perfis IS 'Perfil de cada usuário autenticado. Espelho de auth.users. Centro de gravidade para RLS multi-tenant.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_perfis_role_id ON public.perfis (role_id);
CREATE INDEX IF NOT EXISTS idx_perfis_empresa_id ON public.perfis (empresa_id);
CREATE INDEX IF NOT EXISTS idx_perfis_loja_id ON public.perfis (loja_id);
CREATE INDEX IF NOT EXISTS idx_perfis_is_demo ON public.perfis (is_demo) WHERE is_demo = true;
-- idx_perfis_email_key já é coberto pela constraint UNIQUE email na tabela.

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_perfis_modtime ON public.perfis;
CREATE TRIGGER trg_perfis_modtime
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- ===========================================
-- FUNÇÕES HELPER DE RLS
-- Usadas internamente pelas policies RLS para
-- acessar role, loja e empresa do usuário logado
-- ===========================================

CREATE OR REPLACE FUNCTION public.fn_get_perfil_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT r.slug INTO v_role 
  FROM public.perfis p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = auth.uid();
  RETURN v_role;
END;
$$;

COMMENT ON FUNCTION public.fn_get_perfil_role()
  IS 'Retorna o slug do cargo do perfil autenticado. Usado nas policies RLS para permissões. SECURITY DEFINER para bypass de RLS circular.';

CREATE OR REPLACE FUNCTION public.fn_get_perfil_loja_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT loja_id FROM public.perfis WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.fn_get_perfil_loja_id()
  IS 'Retorna o loja_id do perfil autenticado. Usado internamente nas policies RLS para isolamento multi-tenant. SECURITY DEFINER para bypass de RLS circular.';

CREATE OR REPLACE FUNCTION public.fn_get_perfil_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT empresa_id FROM public.perfis WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.fn_get_perfil_empresa_id()
  IS 'Retorna o empresa_id do perfil autenticado. Usado nas policies RLS de módulos vinculados a empresa (assinaturas, core).';

-- ===========================================
-- RLS
-- ===========================================
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_pode_visualizar_proprio_perfil" ON public.perfis;
CREATE POLICY "usuario_pode_visualizar_proprio_perfil" ON public.perfis
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "admin_master_pode_visualizar_perfis" ON public.perfis;
CREATE POLICY "admin_master_pode_visualizar_perfis" ON public.perfis
  FOR SELECT TO authenticated
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );

DROP POLICY IF EXISTS "admin_loja_pode_visualizar_perfis" ON public.perfis;
CREATE POLICY "admin_loja_pode_visualizar_perfis" ON public.perfis
  FOR SELECT TO authenticated
  USING (
    empresa_id = public.fn_get_perfil_empresa_id()
  );

DROP POLICY IF EXISTS "gerente_loja_pode_visualizar_perfis" ON public.perfis;
CREATE POLICY "gerente_loja_pode_visualizar_perfis" ON public.perfis
  FOR SELECT TO authenticated
  USING (
    loja_id = public.fn_get_perfil_loja_id()
  );

-- ===========================================
-- TABELA: empresas
-- Tenant principal. Agrupa lojas.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.empresas (
  id                                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id                                 uuid,
  nome                                     text NOT NULL,
  slug                                     text NOT NULL UNIQUE,
  status                                   text NOT NULL DEFAULT 'ativa',
  dominio_personalizado                    text UNIQUE,
  dominio_ssl_ativo                        boolean NOT NULL DEFAULT false,
  dominio_ssl_expira_em                    timestamptz,
  dominio_verificado_em                    timestamptz,
  configuracoes                            jsonb NOT NULL DEFAULT '{}',
  impersonation_cud_master                 boolean NOT NULL DEFAULT false,
  impersonation_cud_master_concedido_em    timestamptz,
  impersonation_cud_master_concedido_por   uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  created_at                               timestamptz NOT NULL DEFAULT now(),
  updated_at                               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_empresas_slug_format    CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT check_empresas_slug_length    CHECK (length(slug) BETWEEN 3 AND 50)
);

COMMENT ON TABLE public.empresas IS 'Tenant principal (empresa). Cada empresa pode ter múltiplas lojas. Roteamento via slug.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresas_slug ON public.empresas (slug);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON public.empresas (status);
CREATE INDEX IF NOT EXISTS idx_empresas_dominio ON public.empresas (dominio_personalizado);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_empresas_modtime ON public.empresas;
CREATE TRIGGER trg_empresas_modtime
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Policy: Master vê todas as empresas
DROP POLICY IF EXISTS "admin_master_pode_visualizar_empresas" ON public.empresas;
CREATE POLICY "admin_master_pode_visualizar_empresas" ON public.empresas
  FOR SELECT
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );

-- Policy: Admin/Gerente Loja vê a própria empresa
DROP POLICY IF EXISTS "admin_loja_pode_visualizar_sua_empresa" ON public.empresas;
CREATE POLICY "admin_loja_pode_visualizar_sua_empresa" ON public.empresas
  FOR SELECT
  USING (
    id = public.fn_get_perfil_empresa_id()
  );

-- ===========================================
-- TABELA: lojas
-- Unidade operacional. Vinculada a uma empresa.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.lojas (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id             uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  is_matriz              boolean NOT NULL DEFAULT false,
  nome_estabelecimento   text NOT NULL,
  slug                   text NOT NULL,
  status                 text NOT NULL DEFAULT 'rascunho',
  categoria              text,
  descricao              text,
  
  -- Mídia
  logo_light_url         text,
  logo_dark_url          text,
  banner_light_url       text,
  banner_dark_url        text,
  
  -- Contato e Dados Legais
  cpf                    text,
  cnpj                   text,
  telefone               text,
  whatsapp               text,
  email                  text,
  redes_sociais          jsonb NOT NULL DEFAULT '{}',
  
  -- Endereço
  endereco_rua           text,
  endereco_numero        text,
  endereco_complemento   text,
  endereco_bairro        text,
  endereco_cidade        text,
  endereco_estado        text,
  endereco_cep           text,
  endereco_referencia    text,
  
  -- Operação
  aberto                 boolean NOT NULL DEFAULT false,
  forcar_fechado         boolean NOT NULL DEFAULT false,
  horario_funcionamento  jsonb NOT NULL DEFAULT '{}',
  config_geral           jsonb NOT NULL DEFAULT '{}',
  config_tema            jsonb NOT NULL DEFAULT '{}',
  setup_status           jsonb NOT NULL DEFAULT '{}',
  
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_lojas_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT check_lojas_slug_length CHECK (length(slug) BETWEEN 3 AND 50)
);

COMMENT ON TABLE public.lojas IS 'Loja/filial de uma empresa. Unidade operacional com cardápio, pedidos e equipe próprios.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_lojas_empresa_id ON public.lojas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_lojas_status ON public.lojas (status);
CREATE INDEX IF NOT EXISTS idx_lojas_aberto ON public.lojas (aberto);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lojas_slug_matriz ON public.lojas (slug) WHERE is_matriz = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_lojas_empresa_slug ON public.lojas (empresa_id, slug) WHERE is_matriz = false;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_lojas_modtime ON public.lojas;
CREATE TRIGGER trg_lojas_modtime
  BEFORE UPDATE ON public.lojas
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;

-- Policy: Master vê todas as lojas
DROP POLICY IF EXISTS "admin_master_pode_visualizar_lojas" ON public.lojas;
CREATE POLICY "admin_master_pode_visualizar_lojas" ON public.lojas
  FOR SELECT
  USING (
    public.fn_get_perfil_role() IN ('admin_master', 'gerente_master')
  );

-- Policy: Admin Loja vê lojas da sua empresa
DROP POLICY IF EXISTS "admin_loja_pode_visualizar_suas_lojas" ON public.lojas;
CREATE POLICY "admin_loja_pode_visualizar_suas_lojas" ON public.lojas
  FOR SELECT
  USING (
    empresa_id = public.fn_get_perfil_empresa_id()
  );

-- Policy: Equipe da loja vê a própria loja
DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_da_sua_loja" ON public.lojas;
CREATE POLICY "equipe_loja_pode_visualizar_da_sua_loja" ON public.lojas
  FOR SELECT
  USING (
    id = public.fn_get_perfil_loja_id()
  );

-- Policy: Público vê lojas ativas (cardápio público)
DROP POLICY IF EXISTS "publico_pode_visualizar_lojas_ativas" ON public.lojas;
CREATE POLICY "publico_pode_visualizar_lojas_ativas" ON public.lojas
  FOR SELECT
  USING (status = 'ativo');

-- ===========================================
-- FKs ADIADAS: perfis → empresas e lojas
-- Adicionadas após criação de empresas e lojas
-- para evitar dependência circular.
-- Envolvidas em DO $$ para idempotência na
-- re-execução (ignora se constraint já existe).
-- ===========================================

DO $$ BEGIN
  ALTER TABLE public.perfis
    ADD CONSTRAINT perfis_empresa_id_fkey
    FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.perfis
    ADD CONSTRAINT perfis_loja_id_fkey
    FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
