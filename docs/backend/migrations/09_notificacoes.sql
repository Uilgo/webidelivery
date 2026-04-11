-- Título: 09 - Notificações
-- Descrição: Sistema consolidado de notificações in-app (plataforma) para usuários e admin, com controle de leitura.

-- ============================================================
-- Migration: 09_notificacoes.sql
-- Módulo: Notificações
-- Dependências: 01_core.sql (perfis, lojas)
-- Tabelas: notificacoes
-- ============================================================

-- ===========================================
-- TABELA: notificacoes
-- Notificações in-app (sino 🔔 do painel).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id   uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  loja_id     uuid REFERENCES public.lojas(id) ON DELETE CASCADE,   -- null = notificação de sistema
  tipo        text NOT NULL,                  -- identificador do evento (pedido_novo, sistema_aviso, etc)
  payload     jsonb NOT NULL DEFAULT '{}',    -- {titulo, mensagem, link, icone, cor, meta}
  lida        boolean NOT NULL DEFAULT false,
  lida_em     timestamptz,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notificacoes IS 'Notificações in-app. Base persistente flexível — pode ser integrada com qualquer serviço de push externo.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificacoes_perfil_nao_lida
  ON public.notificacoes (perfil_id, created_at DESC)
  WHERE lida = false AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notificacoes_perfil_todas
  ON public.notificacoes (perfil_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- RLS — baseado na identidade do recebedor, sem hierarquia de cargos
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_pode_ver_proprias_notificacoes" ON public.notificacoes;
CREATE POLICY "usuario_pode_ver_proprias_notificacoes" ON public.notificacoes
  FOR SELECT USING (perfil_id = auth.uid());
