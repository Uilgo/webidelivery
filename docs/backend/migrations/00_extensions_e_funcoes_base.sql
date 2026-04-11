-- Título: 00 - Extensões e Funções Base
-- Descrição: Ativação de extensões do PostgreSQL (uuid-ossp, unaccent, etc) e criação da trigger de updated_at. (Executar Primeiro)

-- ============================================================
-- Migration: 00_extensions_e_funcoes_base.sql
-- Módulo: Infraestrutura Base
-- Dependências: Nenhuma (deve ser executada PRIMEIRO)
-- Descrição: Extensões do PostgreSQL, função de trigger
--            updated_at reutilizável e helpers de segurança.
-- ============================================================

-- ===========================================
-- 1. EXTENSÕES
-- ===========================================

-- Geração de UUIDs v4 (gen_random_uuid)
-- Já vem habilitada por padrão no Supabase, mas garantimos aqui
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- 2. FUNÇÃO: Trigger de updated_at
-- Reutilizada em todas as tabelas que possuem
-- a coluna updated_at para auto-atualização
-- ===========================================

CREATE OR REPLACE FUNCTION public.fn_trigger_update_modtime()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Comentário explicativo para documentação no banco
COMMENT ON FUNCTION public.fn_trigger_update_modtime()
  IS 'Trigger genérica que atualiza a coluna updated_at automaticamente em qualquer tabela que a utilize. Aplicada via CREATE TRIGGER em cada tabela individual.';


