-- Título: 10 - Auditoria e LGPD
-- Descrição: Segurança compliance: auditoria avançada (logs de acesso e operações críticas) e consentimentos LGPD.

-- ============================================================
-- Migration: 10_auditoria.sql
-- Módulo: Auditoria, LGPD e Impersonation
-- Dependências: 01_core.sql (perfis, lojas)
-- Tabelas: audit_logs, logs_lojas, lgpd_consentimentos,
--          lgpd_solicitacoes_exclusao, impersonation_solicitacoes
-- ============================================================

-- ===========================================
-- TABELA: audit_logs
-- Trilha de auditoria global (nível plataforma).
-- Registro imutável append-only.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id     uuid REFERENCES public.perfis(id) ON DELETE SET NULL,  -- null = ação do sistema
  acao          text NOT NULL,                -- ex: login, cancelar_assinatura, impersonation_inicio
  tabela        text,                         -- tabela afetada (null se ação sem tabela)
  registro_id   uuid,                         -- ID do registro afetado
  dados_antes   jsonb,                        -- snapshot anterior (sem dados sensíveis)
  dados_depois  jsonb,                        -- snapshot posterior
  ip            text,                         -- coletado no servidor Nuxt
  user_agent    text,                         -- prova de dispositivo em disputes
  origem        text NOT NULL DEFAULT 'sistema',  -- usuario, sistema, webhook_gateway, impersonation
  contexto      jsonb NOT NULL DEFAULT '{}',      -- metadados extras (session_id, gateway_event_id, etc)
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Trilha de auditoria global. Append-only — nunca UPDATE/DELETE. Provas para disputes e chargebacks.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_logs_perfil_id ON public.audit_logs (perfil_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela_registro ON public.audit_logs (tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON public.audit_logs (acao);
CREATE INDEX IF NOT EXISTS idx_audit_logs_origem ON public.audit_logs (origem);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_master_pode_visualizar_audit_logs" ON public.audit_logs
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

-- ===========================================
-- TABELA: logs_lojas
-- Auditoria de ações no painel admin da loja.
-- Registro imutável append-only.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.logs_lojas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id               uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  perfil_id             uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  usuario_email         text,                  -- snapshot
  usuario_nome          text,                  -- snapshot
  usuario_cargo         text,                  -- snapshot
  acao                  text NOT NULL,          -- ex: criar_produto, atualizar_loja, cancelar_pedido
  tabela                text,
  registro_id           uuid,
  dados_antes           jsonb,
  dados_depois          jsonb,
  ip                    text,
  user_agent            text,
  tipo_impersonation    text,                  -- null = ação normal, 'master' = impersonation
  tinha_permissao_cud   boolean NOT NULL DEFAULT true,
  contexto              jsonb NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_logs_lojas_impersonation CHECK (tipo_impersonation = 'master' OR tipo_impersonation IS NULL)
);

COMMENT ON TABLE public.logs_lojas IS 'Auditoria de ações no painel da loja. Append-only. Suporta visibilidade condicional de impersonation.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_logs_lojas_loja_id ON public.logs_lojas (loja_id);
CREATE INDEX IF NOT EXISTS idx_logs_lojas_perfil_id ON public.logs_lojas (perfil_id);
CREATE INDEX IF NOT EXISTS idx_logs_lojas_acao ON public.logs_lojas (loja_id, acao);
CREATE INDEX IF NOT EXISTS idx_logs_lojas_tabela_registro ON public.logs_lojas (tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_logs_lojas_impersonation ON public.logs_lojas (tipo_impersonation) WHERE tipo_impersonation IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_lojas_created_at ON public.logs_lojas (created_at DESC);

-- RLS
ALTER TABLE public.logs_lojas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_logs_lojas" ON public.logs_lojas;
CREATE POLICY "admin_master_pode_visualizar_logs_lojas" ON public.logs_lojas
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

-- Equipe da loja vê logs normais + logs de impersonation CUD
DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_logs_lojas" ON public.logs_lojas;
CREATE POLICY "equipe_loja_pode_visualizar_logs_lojas" ON public.logs_lojas
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
    AND (tipo_impersonation IS NULL OR tinha_permissao_cud = true)
  );

-- ===========================================
-- TABELA: lgpd_consentimentos
-- Registro de aceites LGPD (append-only).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.lgpd_consentimentos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id   uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  tipo        text NOT NULL,                  -- tipo do consentimento
  versao      text NOT NULL,                  -- versão do documento aceito (ex: v1.0)
  aceito      boolean NOT NULL,               -- true = aceitou, false = revogou
  ip_address  text NOT NULL,                  -- coletado no servidor Nuxt
  user_agent  text NOT NULL,                  -- prova de dispositivo
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_lgpd_consentimentos_tipo CHECK (
    tipo IN ('termos_uso', 'politica_privacidade', 'marketing_email', 'marketing_whatsapp', 'compartilhamento_dados')
  )
);

COMMENT ON TABLE public.lgpd_consentimentos IS 'Registro imutável de consentimentos LGPD. Revogação = novo INSERT com aceito=false. Arts. 7º e 8º LGPD.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_lgpd_consentimentos_perfil_id ON public.lgpd_consentimentos (perfil_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_consentimentos_tipo ON public.lgpd_consentimentos (tipo);
CREATE INDEX IF NOT EXISTS idx_lgpd_consentimentos_created_at ON public.lgpd_consentimentos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_consentimentos_perfil_tipo ON public.lgpd_consentimentos (perfil_id, tipo, created_at DESC);

-- RLS
ALTER TABLE public.lgpd_consentimentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_lgpd_consentimentos" ON public.lgpd_consentimentos;
CREATE POLICY "admin_master_pode_visualizar_lgpd_consentimentos" ON public.lgpd_consentimentos
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "usuario_pode_ver_proprios_consentimentos" ON public.lgpd_consentimentos;
CREATE POLICY "usuario_pode_ver_proprios_consentimentos" ON public.lgpd_consentimentos
  FOR SELECT USING (perfil_id = auth.uid());

-- ===========================================
-- TABELA: lgpd_solicitacoes_exclusao
-- Solicitações de exclusão de dados (Art. 18 LGPD).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.lgpd_solicitacoes_exclusao (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id       uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  usuario_email   text NOT NULL,              -- snapshot
  usuario_nome    text NOT NULL,              -- snapshot
  status          text NOT NULL DEFAULT 'pendente',
  motivo          text,                        -- motivo informado pelo usuário
  observacoes     text,                        -- notas internas (nunca exibido ao solicitante)
  processada_por  uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  processada_em   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_lgpd_solicitacoes_status CHECK (
    status IN ('pendente', 'em_analise', 'concluida', 'cancelada')
  )
);

COMMENT ON TABLE public.lgpd_solicitacoes_exclusao IS 'Solicitações de exclusão de dados (direito ao esquecimento). Prazo legal: 15 dias úteis (Art. 18 §3º LGPD).';

-- Índices
CREATE INDEX IF NOT EXISTS idx_lgpd_solicitacoes_perfil_id ON public.lgpd_solicitacoes_exclusao (perfil_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_solicitacoes_status ON public.lgpd_solicitacoes_exclusao (status);
CREATE INDEX IF NOT EXISTS idx_lgpd_solicitacoes_created_at ON public.lgpd_solicitacoes_exclusao (created_at DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_lgpd_solicitacoes_modtime ON public.lgpd_solicitacoes_exclusao;
CREATE TRIGGER trg_lgpd_solicitacoes_modtime
  BEFORE UPDATE ON public.lgpd_solicitacoes_exclusao
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.lgpd_solicitacoes_exclusao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_lgpd_solicitacoes" ON public.lgpd_solicitacoes_exclusao;
CREATE POLICY "admin_master_pode_visualizar_lgpd_solicitacoes" ON public.lgpd_solicitacoes_exclusao
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "usuario_pode_ver_proprias_solicitacoes_exclusao" ON public.lgpd_solicitacoes_exclusao;
CREATE POLICY "usuario_pode_ver_proprias_solicitacoes_exclusao" ON public.lgpd_solicitacoes_exclusao
  FOR SELECT USING (perfil_id = auth.uid());

-- ===========================================
-- TABELA: impersonation_solicitacoes
-- Solicitações de acesso CUD pela plataforma.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.impersonation_solicitacoes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id    uuid NOT NULL REFERENCES public.perfis(id),     -- analista Master
  loja_id           uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  motivo            text,                        -- justificativa exibida ao cliente
  status            text NOT NULL DEFAULT 'pendente',  -- pendente, aprovada, recusada, expirada, revogada
  respondido_por    uuid REFERENCES public.perfis(id), -- dono da loja
  respondido_em     timestamptz,
  expira_em         timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),  -- carência para aceitar
  acesso_expira_em  timestamptz,                -- prazo de segurança após aprovação (ex: 8h)
  created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.impersonation_solicitacoes IS 'Solicitações formais de acesso impersonation CUD. Modo leitura NÃO precisa de aprovação.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_impersonation_loja_id ON public.impersonation_solicitacoes (loja_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_status ON public.impersonation_solicitacoes (status);

-- RLS
ALTER TABLE public.impersonation_solicitacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_impersonation" ON public.impersonation_solicitacoes;
CREATE POLICY "admin_master_pode_visualizar_impersonation" ON public.impersonation_solicitacoes
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_impersonation" ON public.impersonation_solicitacoes;
CREATE POLICY "equipe_loja_pode_visualizar_impersonation" ON public.impersonation_solicitacoes
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );
