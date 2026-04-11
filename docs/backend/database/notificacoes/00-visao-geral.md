# Módulo: `notificacoes`

Centraliza a comunicação em tempo real e o histórico de eventos relevantes (in-app) para os usuários na plataforma WebIDelivery, operando tanto para administradores quanto para outros perfis do sistema.

---

## Tabelas

| Arquivo              | Tabela         | Propósito                                                                               |
| -------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `01-notificacoes.md` | `notificacoes` | Armazena instâncias de notificações diretas geradas pelo sistema para usuários isolados |

---

## Princípios do Módulo

### Feedback Não-Intrusivo

O sino de notificações é projetado para guiar o usuário pelas atualizações essenciais sem bloquear a navegação, com suporte a redirecionamento contextual (ex: link direto para pedido).

### Isolamento de Eventos (Push via RPC)

A base local de notificações NUNCA é escrita a partir do client frontend; ela funciona como um "sink" alimentado pelo próprio banco de dados, sendo acionada por Triggers nativos ou como parte de RPCs de negócio de outros módulos. Por exemplo, ao chamar um `fn_rpc_criar_pedido`, a própria RPC chama uma inserção na tabela de notificações de background para alertar o dashboard da loja.

### Expiração de Contexto

Notificações perdem valor ao longo do tempo. Elas podem ou receber soft delete (junto da loja ou usuário atrelado) ou limpeza física (`deleted_at IS NOT NULL`) agendada para evitar acúmulo infinito de poeira no banco.

---

## Estrutura desta pasta

```
backend/notificacoes/
├── 00-visao-geral.md               ← este arquivo
└── 01-notificacoes.md              ← alertas do sino in-app
```
