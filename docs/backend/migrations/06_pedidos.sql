-- Título: 06 - Pedidos
-- Descrição: Motor central do delivery: clientes das lojas, sistema de pedidos, histórico de status e avaliações dos pedidos.

-- ============================================================
-- Migration: 06_pedidos.sql
-- Módulo: Pedidos
-- Dependências: 01_core.sql (lojas, perfis), 05_marketing.sql (cupons)
-- Tabelas: clientes, pedidos, pedido_historico, pedido_avaliacoes
-- ============================================================

-- ===========================================
-- TABELA: clientes
-- Clientes finais das lojas (híbrido visitante/registrado).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id           uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  tipo_cadastro     text NOT NULL DEFAULT 'visitante',  -- visitante ou registrado
  device_token      uuid,                                -- cookie silencioso do visitante
  email             text,                                -- obrigatório se registrado
  senha_hash        text,                                -- bcrypt, obrigatório se registrado
  nome              text NOT NULL,
  telefone          text NOT NULL,
  enderecos_salvos  jsonb NOT NULL DEFAULT '[]',
  perfil_crm        jsonb NOT NULL DEFAULT '{}',         -- aniversário, pontos, CPF, opt-in marketing
  total_pedidos     integer NOT NULL DEFAULT 0,
  total_gasto       numeric NOT NULL DEFAULT 0.00,       -- LTV
  ultimo_pedido_em  timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,                         -- LGPD

  -- Registrado precisa de email e senha
  CONSTRAINT check_clientes_requisitos CHECK (
    tipo_cadastro != 'registrado' OR (email IS NOT NULL AND senha_hash IS NOT NULL)
  ),
  CONSTRAINT check_clientes_tipo CHECK (tipo_cadastro IN ('visitante', 'registrado'))
);

COMMENT ON TABLE public.clientes IS 'Clientes finais das lojas. Sistema híbrido visitante/registrado. Isolados por loja (multitenancy verdadeiro).';

-- Unique: email único por loja para registrados não deletados
CREATE UNIQUE INDEX IF NOT EXISTS clientes_email_loja_uidx
  ON public.clientes (loja_id, email)
  WHERE tipo_cadastro = 'registrado' AND deleted_at IS NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_loja_telefone ON public.clientes (loja_id, telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_crm_ultimo_pedido ON public.clientes (loja_id, ultimo_pedido_em);
CREATE INDEX IF NOT EXISTS idx_clientes_device_token ON public.clientes (loja_id, device_token);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_clientes_modtime ON public.clientes;
CREATE TRIGGER trg_clientes_modtime
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_clientes" ON public.clientes;
CREATE POLICY "admin_master_pode_visualizar_clientes" ON public.clientes
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_clientes" ON public.clientes;
CREATE POLICY "equipe_loja_pode_visualizar_clientes" ON public.clientes
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

-- Público NÃO tem SELECT direto — acesso via RPC exclusivamente

-- ===========================================
-- TABELA: pedidos
-- Coração da operação. Carrinho imutável via JSONB.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.pedidos (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id                 uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  cliente_id              uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  cupom_id                uuid REFERENCES public.cupons(id) ON DELETE SET NULL,
  entregador_id           uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  numero                  integer NOT NULL,            -- gerado via trigger (sequencial por loja)
  codigo_rastreamento     text NOT NULL,               -- ex: 'WBD-4F9Q'

  -- Snapshots imutáveis
  cliente_nome            text NOT NULL,
  cliente_telefone        text,
  carrinho                jsonb NOT NULL,              -- array completo da cesta com preços congelados

  -- Operação e finanças
  logistica               jsonb NOT NULL,              -- tipo_entrega, taxa, endereço, tracking
  subtotal                numeric NOT NULL,
  desconto                numeric NOT NULL DEFAULT 0,
  total                   numeric NOT NULL,
  pagamento               jsonb NOT NULL,              -- método, confirmação, troco
  estado_atual            jsonb NOT NULL,              -- status dinâmico com metadados (motivo_cancelamento, etc)

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_pedidos_financeiro CHECK (total >= 0)
);

COMMENT ON TABLE public.pedidos IS 'Pedidos com carrinho imutável via JSONB. Elimina tabelas de pedido_itens. Snapshot garante integridade histórica.';

-- ===========================================
-- TRIGGER: Geração do número sequencial por loja
-- FOR UPDATE garante atomicidade sob concorrência
-- ===========================================

CREATE OR REPLACE FUNCTION public.fn_trigger_pedido_numero()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1
    INTO NEW.numero
    FROM public.pedidos
   WHERE loja_id = NEW.loja_id
     FOR UPDATE;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedido_numero ON public.pedidos;
CREATE TRIGGER trg_pedido_numero
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_pedido_numero();

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_loja_id ON public.pedidos (loja_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON public.pedidos (cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_codigo_rastreamento ON public.pedidos (codigo_rastreamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos (loja_id, created_at DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_pedidos_modtime ON public.pedidos;
CREATE TRIGGER trg_pedidos_modtime
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_update_modtime();

-- RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_pedidos" ON public.pedidos;
CREATE POLICY "admin_master_pode_visualizar_pedidos" ON public.pedidos
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_pedidos" ON public.pedidos;
CREATE POLICY "equipe_loja_pode_visualizar_pedidos" ON public.pedidos
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );

-- Público acessa via RPC de rastreamento (codigo_rastreamento), não via SELECT direto

-- ===========================================
-- TABELA: pedido_historico
-- Timeline imutável do ciclo de vida do pedido.
-- ===========================================

CREATE TABLE IF NOT EXISTS public.pedido_historico (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id     uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  status_novo   text NOT NULL,              -- ex: pendente, aceito, em_preparo, pronto, saiu_entrega, entregue, cancelado
  perfil_id     uuid REFERENCES public.perfis(id) ON DELETE SET NULL,  -- quem carimbou (null = sistema)
  criado_em     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pedido_historico IS 'Timeline imutável (append-only) do ciclo de vida do pedido. Nunca UPDATE/DELETE.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedido_historico_busca ON public.pedido_historico (pedido_id, criado_em DESC);

-- RLS
ALTER TABLE public.pedido_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_historico" ON public.pedido_historico;
CREATE POLICY "admin_master_pode_visualizar_historico" ON public.pedido_historico
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_historico" ON public.pedido_historico;
CREATE POLICY "equipe_loja_pode_visualizar_historico" ON public.pedido_historico
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedido_historico.pedido_id AND p.loja_id = public.fn_get_perfil_loja_id()
    )
  );

-- ===========================================
-- TABELA: pedido_avaliacoes
-- CSAT do pedido. Relação 1:1 com pedidos (PK = pedido_id).
-- ===========================================

CREATE TABLE IF NOT EXISTS public.pedido_avaliacoes (
  pedido_id             uuid PRIMARY KEY REFERENCES public.pedidos(id) ON DELETE CASCADE,
  loja_id               uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  cliente_id            uuid NOT NULL REFERENCES public.clientes(id) ON DELETE SET NULL,
  nota                  integer NOT NULL,
  comentarios_internos  text,
  tags_problema         jsonb,              -- ex: ["demora", "embalagem_vazada"]
  criado_em             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_avaliacao_nota CHECK (nota BETWEEN 1 AND 5)
);

COMMENT ON TABLE public.pedido_avaliacoes IS 'Avaliação CSAT 1:1 com pedido. PK = pedido_id garante relação exclusiva.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_avaliacoes_loja_id ON public.pedido_avaliacoes (loja_id);

-- RLS
ALTER TABLE public.pedido_avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_master_pode_visualizar_avaliacoes" ON public.pedido_avaliacoes;
CREATE POLICY "admin_master_pode_visualizar_avaliacoes" ON public.pedido_avaliacoes
  FOR SELECT USING (public.fn_get_perfil_role() IN ('admin_master', 'gerente_master'));

DROP POLICY IF EXISTS "equipe_loja_pode_visualizar_avaliacoes" ON public.pedido_avaliacoes;
CREATE POLICY "equipe_loja_pode_visualizar_avaliacoes" ON public.pedido_avaliacoes
  FOR SELECT USING (
    public.fn_get_perfil_role() IN ('admin_loja', 'gerente_loja', 'staff_loja')
    AND loja_id = public.fn_get_perfil_loja_id()
  );
