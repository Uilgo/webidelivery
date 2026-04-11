/\*\*

- =============================================
- WebIDelivery — Tipos do Banco de Dados
- =============================================
-
- Ponto de entrada principal para todos os tipos.
-
- Uso:
- import type { Pedido, CarrinhoItem, RpcCriarPedidoParams } from '@/backend/types'
-
- Organização:
- - database/ → Row types (SELECT) — o que vem do banco
- - jsonb/ → Shapes de campos JSONB — subtipos reutilizáveis
- - rpc/ → Parâmetros de RPCs (CUD) — o que vai pro banco
    \*/

// Row types (leitura)
export \* from "./database";

// JSONB shapes (subtipos)
export \* from "./jsonb";

// RPC types (CUD params)
export \* from "./rpc";
