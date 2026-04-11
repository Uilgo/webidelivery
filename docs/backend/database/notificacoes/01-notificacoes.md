# Tabela: `notificacoes`

Notificações in-app para os usuários da plataforma.

---

## Propósito

- Centraliza todas as notificações exibidas no sino (🔔) do painel
- Adota eventos de pedidos, marketing, finanças, suporte e sistema
- Cada notificação é direcionada a um `perfil` (`auth.uid()`)
- Suporta link de ação, permitindo redirect rápido com um clique

---

## Colunas

| Coluna       | Tipo        | Nullable | Default             | Descrição                                                              |
| ------------ | ----------- | -------- | ------------------- | ---------------------------------------------------------------------- |
| `id`         | uuid        | NO       | `gen_random_uuid()` | PK                                                                     |
| `perfil_id`  | uuid        | NO       | —                   | FK → `perfis.id` — destinatário da notificação                         |
| `loja_id`    | uuid        | YES      | —                   | FK → `lojas.id` — contexto da loja (null para notificações de sistema) |
| `tipo`       | text        | NO       | —                   | Identificador flexível do evento (ex: `pedido_novo`, `sistema_aviso`)  |
| `payload`    | jsonb       | NO       | `{}`                | Conteúdo dinâmico da notificação (título, mensagem, link, ícone, refs) |
| `lida`       | boolean     | NO       | `false`             | Flag de status vista/nova                                              |
| `lida_em`    | timestamptz | YES      | —                   | Timestamp indicando quando a notificação foi marcada como lida         |
| `deleted_at` | timestamptz | YES      | —                   | Soft delete — preenchido ao realizar suspensão ou delete em cascata    |
| `created_at` | timestamptz | NO       | `now()`             | Data/hora de criação                                                   |

---

## Constraints

| Nome                          | Tipo | Colunas / Referência                         |
| ----------------------------- | ---- | -------------------------------------------- |
| `notificacoes_pkey`           | PK   | `id`                                         |
| `notificacoes_perfil_id_fkey` | FK   | `perfil_id` → `perfis(id)` ON DELETE CASCADE |
| `notificacoes_loja_id_fkey`   | FK   | `loja_id` → `lojas(id)` ON DELETE CASCADE    |

---

## Índices

| Nome                               | Colunas                        | Observação                                                           |
| ---------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| `notificacoes_pkey`                | `id`                           | PK                                                                   |
| `idx_notificacoes_perfil_nao_lida` | `(perfil_id, created_at DESC)` | WHERE `lida = false AND deleted_at IS NULL` — para count visual ágil |
| `idx_notificacoes_perfil_todas`    | `(perfil_id, created_at DESC)` | WHERE `deleted_at IS NULL` — listagem paginada                       |

---

## Integração com Realtime / WebSockets

Como o Supabase Realtime pode ser evitado por questões de custo/escala, esta tabela serve como **Base Persistente** flexível.

- O campo `tipo` é totalmente aberto a nível de banco (sem constraints). O frontend apenas decide como mapear visualmente baseando-se na string.
- O campo `payload` (`jsonb`) empacota exatamente o dado que será mastigado pelo client.
- Você pode utilizar os triggers/webhooks do próprio banco ou uma camada de back-end externa para despachar esse payload diretamente para o serviço de mensageria da sua escolha (Ex: Pusher, Socket.io, Ably, Mercure, etc), emitindo a mensagem num canal como `private-user-[perfil_id]`.

### Exemplo de `payload` (JSONB):

```json
{
	"titulo": "Novo pedido recebido!",
	"mensagem": "Pedido #422 no valor de R$ 45,90",
	"link": "/admin/pedidos/422",
	"icone": "🛒",
	"cor": "green",
	"meta": {
		"pedido_id": "b3e098-..."
	}
}
```

---

## Regras de Negócio

- Notificações são geradas por outras RPCs via background no Postgres (ex: a RPC geradora de pedido embute a call a `fn_rpc_notificar`).
- Os clientes da aplicação (React/Nuxt) apenas acessam o canal para LEITURA e atualização do status `lida`. Nenhuma interface envia notificação raw pro DB.
- Rotinas de clean-up periódicas apagam permanentemente linhas com `deleted_at` com mais de 30-90 dias.

---

## Relacionamentos

```
perfis (N:1)
  └── notificacoes
lojas (N:1, opcional)
  └── notificacoes
```

---

## RLS (Row Level Security)

Neste módulo operamos uma política puramente atrelada à identidade do recebedor, sem necessitar ramificações de hierarquia de negócio:

| Cargo          | O que pode ver                  |
| -------------- | ------------------------------- |
| Qualquer cargo | Apenas as próprias notificações |

### Políticas

| Nome da Política              | Operação | Descrição                                                    |
| ----------------------------- | -------- | ------------------------------------------------------------ |
| `notificacoes_select_proprio` | SELECT   | Usuário vê apenas notificações onde `perfil_id = auth.uid()` |

---

## Funções RPC

> Apenas a leitura e update de status `lida` são expostas aos usuários via client. Escritas devem vir sempre de outras roles db_level (como funções SECURITY DEFINER de outros módulos).

| Nome da Função                           | Quem pode chamar | Função                                                                                                                                                               |
| ---------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_marcar_notificacao_lida`         | Privilégio RLS   | Valida `perfil_id = auth.uid()`, preenche `lida = true` e atualiza timestamp de letura — ignora de forma idempontente se já lida                                     |
| `fn_rpc_marcar_todas_notificacoes_lidas` | Privilégio RLS   | Dá update massivo no batch de linhas com `perfil_id = auth.uid()`, mudando para `lida = true`                                                                        |
| `fn_rpc_contar_notificacoes_nao_lidas`   | Privilégio RLS   | Aggregator Count em `perfil_id = auth.uid() AND lida = false AND deleted_at IS NULL`, entregando ao UI a label redonda numérica do sino em milissegundos sem payload |
