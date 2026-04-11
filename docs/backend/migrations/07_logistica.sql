-- Título: 07 - Logística (Entregadores)
-- Descrição: Gestão de frotas e entregas: cadastro de entregadores e acertos financeiros das entregas.

-- ============================================================
-- Migration: 07_logistica.sql
-- Módulo: Logística (Entregadores)
-- Dependências: 01_core.sql (lojas, perfis)
-- Tabelas: entregadores, entregador_acertos
-- ============================================================

-- ===========================================
-- TABELA: entregadores
-- Motoboys vinculados a uma loja específica.
-- Multitenancy: mesmo João pode ter cadastros
-- separados em lojas diferentes.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.entregadores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id           uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  auth_user_id      uuid,                         -- vincula ao Supabase Auth para login no PWA
  email             text,
  telefone          text NOT NULL,
  cpf               text,                         -- preparado para futura trava fiscal
  nome_completo     text NOT NULL,
  perfil_logistico  jsonb NOT NULL DEFAULT '{}',   -- placa, CNH, veículo, conta bancária
  status_trabalho   text NOT NULL DEFAULT 'offline', -- offline, disponivel, ocupado_em_corrida
  ativo             boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.entregadores IS 'Motoboys vinculados a uma loja. Mesma pessoa pode ter cadastro em lojas diferentes (multitenancy).';

-- Unique: email e auth_user_id únicos por loja
CREATE UNIQUE INDEX IF NOT EXISTS entregadores_loja_email_unique
  ON public.entregadores (loja_id, email)
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS entregadores_loja_auth_unique
  ON public.entregadores (loja_id, auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_entregadores_loja_id ON public.entregadores (loja_id);
CREATE INDEX IF NOT EXISTS idx_entregadores_status ON public.entregadores (loja_id, status_trabalho) WHERE ativo = true;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_entregadores_modtime ON public.entregadores;
CREATE TRIGGER trg_entregadores_modtime
  BEFORE UPDATE ON public.entregadores
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.entregadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_entregadores" ON public.entregadores;
CREATE POLICY "admin_master_pode_visualizar_entregadores" ON public.entregadores
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_entregadores" ON public.entregadores;
CREATE POLICY "equipe_loja_pode_visualizar_entregadores" ON public.entregadores
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

-- Policy: Entregador vê o próprio registro (para o app PWA)
DROP POLICY IF EXISTS "proprio_entregador_pode_visualizar_seus_dados" ON public.entregadores;
CREATE POLICY "proprio_entregador_pode_visualizar_seus_dados" ON public.entregadores
  FOR SELECT USING (auth_user_id = auth.uid());

-- ===========================================
-- TABELA: entregador_acertos
-- Livro-razão logístico de pagamentos a motoboys.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.entregador_acertos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id               uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  entregador_id         uuid NOT NULL REFERENCES public.entregadores(id) ON DELETE CASCADE,
  fechado_por           uuid NOT NULL REFERENCES public.perfis(id),    -- gerente que liberou
  total_corridas        integer NOT NULL,
  valor_pago            numeric NOT NULL,
  registro_pagamento    jsonb,              -- {metodo, comprovante_url, obs}
  criado_em             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_acertos_valor CHECK (valor_pago >= 0),
  CONSTRAINT check_acertos_corridas CHECK (total_corridas >= 0)
);

COMMENT ON TABLE public.entregador_acertos IS 'Registro de pagamentos a motoboys. Suporta fluxo pingado (corrida a corrida) e diária.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_acertos_loja_id ON public.entregador_acertos (loja_id);
CREATE INDEX IF NOT EXISTS idx_acertos_entregador_id ON public.entregador_acertos (entregador_id);
CREATE INDEX IF NOT EXISTS idx_acertos_criado_em ON public.entregador_acertos (loja_id, criado_em DESC);

-- RLS
ALTER TABLE public.entregador_acertos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_acertos" ON public.entregador_acertos;
CREATE POLICY "admin_master_pode_visualizar_acertos" ON public.entregador_acertos
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

-- Apenas admin_loja e gerente_loja — staff_loja NÃO vê pagamentos
DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_acertos" ON public.entregador_acertos;
CREATE POLICY "equipe_loja_pode_visualizar_acertos" ON public.entregador_acertos
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );
