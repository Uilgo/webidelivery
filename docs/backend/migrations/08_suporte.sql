-- Título: 08 - Suporte (Tickets)
-- Descrição: Atendimento B2B: tickets de suporte abertos pelas lojas/empresas para a plataforma Master, com mensagens e notas.

-- ============================================================
-- Migration: 08_suporte.sql
-- Módulo: Suporte (Tickets B2B)
-- Dependências: 01_core.sql (lojas, perfis)
-- Tabelas: tickets, ticket_mensagens, ticket_notas
-- ============================================================

-- ===========================================
-- SEQUENCE: numeração global de tickets
-- ===========================================

CREATE SEQUENCE IF NOT EXISTS public.tickets_numero_seq;

-- ===========================================
-- TABELA: tickets
-- Conversas de suporte Loja <-> Plataforma.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.tickets (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id               uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  aberto_por            uuid NOT NULL REFERENCES public.perfis(id),
  atribuido_a           uuid REFERENCES public.perfis(id),       -- membro master responsável
  numero                integer NOT NULL UNIQUE DEFAULT nextval('public.tickets_numero_seq'),
  titulo                text NOT NULL,
  categoria             text,
  prioridade            text NOT NULL DEFAULT 'normal',          -- validado via Zod
  status                text NOT NULL DEFAULT 'aberto',          -- validado via Zod
  resolvido_em          timestamptz,
  fechado_em            timestamptz,
  csat_nota             integer,
  csat_comentario       text,
  csat_respondido_em    timestamptz,
  canal                 text NOT NULL DEFAULT 'chat',
  ultima_mensagem_em    timestamptz,
  nao_lidas_cliente     integer NOT NULL DEFAULT 0,
  nao_lidas_suporte     integer NOT NULL DEFAULT 0,
  metadata              jsonb NOT NULL DEFAULT '{}',             -- contexto técnico (browser, url, sys info)
  deleted_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_tickets_csat_nota CHECK (csat_nota IS NULL OR csat_nota BETWEEN 1 AND 5),
  CONSTRAINT check_tickets_nao_lidas CHECK (nao_lidas_cliente >= 0 AND nao_lidas_suporte >= 0)
);

COMMENT ON TABLE public.tickets IS 'Tickets de suporte B2B (Loja <-> Plataforma). Suporta chat e ticket clássico. CSAT nativo.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_atribuido_a ON public.tickets (atribuido_a);
CREATE INDEX IF NOT EXISTS idx_tickets_loja_id ON public.tickets (loja_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ultima_msg ON public.tickets (loja_id, ultima_mensagem_em DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_tickets_modtime ON public.tickets;
CREATE TRIGGER trg_tickets_modtime
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_tickets" ON public.tickets;
CREATE POLICY "admin_master_pode_visualizar_tickets" ON public.tickets
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_tickets" ON public.tickets;
CREATE POLICY "equipe_loja_pode_visualizar_tickets" ON public.tickets
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

-- ===========================================
-- TABELA: ticket_mensagens
-- Thread de conversa (append-only).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.ticket_mensagens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  autor_id    uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  lado        text NOT NULL,                  -- 'cliente' ou 'suporte'
  conteudo    text,                           -- null aceito se tiver anexo
  anexos      jsonb NOT NULL DEFAULT '[]',    -- [{nome, url, tipo}]
  lida_em     timestamptz,                    -- check de leitura
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- Deve ter conteúdo OU anexo
  CONSTRAINT check_ticket_mensagens_lado CHECK (lado IN ('cliente', 'suporte')),
  CONSTRAINT check_ticket_mensagens_conteudo CHECK (conteudo IS NOT NULL OR jsonb_array_length(anexos) > 0)
);

COMMENT ON TABLE public.ticket_mensagens IS 'Thread de conversa do ticket. Append-only — conteúdo nunca editado. Lado deduzido do JWT.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_ticket_mensagens_ticket_id ON public.ticket_mensagens (ticket_id, created_at);

-- RLS
ALTER TABLE public.ticket_mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_ticket_mensagens" ON public.ticket_mensagens;
CREATE POLICY "admin_master_pode_visualizar_ticket_mensagens" ON public.ticket_mensagens
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_ticket_mensagens" ON public.ticket_mensagens;
CREATE POLICY "equipe_loja_pode_visualizar_ticket_mensagens" ON public.ticket_mensagens
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja')
    AND EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_mensagens.ticket_id AND t.loja_id = public.fn_get_perfil_loja_id()
    )
  );

-- ===========================================
-- TABELA: ticket_notas
-- Notas internas — visíveis APENAS para Master.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.ticket_notas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  autor_id    uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  conteudo    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ticket_notas IS 'Notas internas confidenciais do suporte. RLS mais restritivo — lojas NÃO veem.';

-- RLS (mais restritivo do sistema)
ALTER TABLE public.ticket_notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_ticket_notas" ON public.ticket_notas;
CREATE POLICY "admin_master_pode_visualizar_ticket_notas" ON public.ticket_notas
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

-- NENHUMA policy para lojas — resultado é sempre vazio
