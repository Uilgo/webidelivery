# Módulo: Views (Visualizações e Relatórios)

Este módulo centraliza todas as _Views_ convencionais do banco de dados. (Aviso: Nunca usaremos Materialized Views devido aos gargalos de cache e ausência de realtime dinâmico imposto por essa estrutura no ecossistema Supabase).

## Por que um módulo separado para Views?

Ao invés de misturar Views de leitura e relatórios dentro dos módulos transacionais (onde o foco são as regras de escrita e relacionamentos), isolar as views garante:

1. **Performance Front-end**: As Views encapsulam lógicas complexas de agregação (`GROUP BY`), cruzamentos (`JOIN`) e extrações de JSONB, servindo os Dashboards com relatórios mastigados diretamente para o Nuxt.
2. **Separação de Preocupações**: Os módulos `core`, `pedidos`, etc., ficam focados apenas na transação (CUD). O módulo `views` concentra os KPIs e cruzamentos.
3. **Segurança (RLS) Simplificada**: As regras de permissão (SELECT) em relatórios são diferentes das regras das tabelas vitais. É mais fácil auditar acessos concentrados aqui.

---

## Estrutura das Views

```
backend/views/
├── 00-visao-geral.md                      ← este arquivo
├── 01-vw-master-empresas.md               ← lista detalhada e cruzada de Lojas para o admin_master
├── 02-vw-loja-dashboard-kpis.md           ← KPIs consolidados globais por data para o admin_loja
├── 03-vw-extracao-produtos-vendidos.md    ← expansão do JSONB de pedidos para ranking do cardápio
├── 04-vw-fechamento-caixa-motoboys.md     ← tabela cruzada extraída de logística e pedidos para acertos
└── 05-vw-master-kpi-assinaturas.md        ← métricas totais SaaS e fluxo de faturamento do master
```
