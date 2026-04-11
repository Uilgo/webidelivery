# Módulo: `suporte`

Gerencia o Serviço de Atendimento ao Cliente (SAC) interno da plataforma, onde Lojas podem contactar a equipe de Suporte (Master).

---

## Tabelas

| Arquivo                  | Tabela             | Propósito                                                                                 |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------------------- |
| `01-tickets.md`          | `tickets`          | A abstração central de "Ocorrência" ou "Conversa" com seu status de SLA                   |
| `02-ticket-mensagens.md` | `ticket_mensagens` | O anexo de mensagens entre os integrantes (cliente/suporte) da ocorrência                 |
| `03-ticket-notas.md`     | `ticket_notas`     | Notas internas de investigação que são estritamente invisíveis para o lado "cliente/loja" |

---

## Princípios do Módulo

### Simplicidade Direta (Loja → Master)

Com a nova arquitetura multi-tenant simplificada (sem a antiga hierarquia de Whitelabels), o fluxo de suporte é reto. Todas as lojas buscam atendimento de suporte abrindo tickets que caem diretamente na fila de usuários `admin_master` e `gerente_master` da plataforma.

### Flexibilidade de Canal (Chat ou Ticket Clássico)

O backend não acopla severamente um layout. A mesma arquitetura serve tanto para carregar uma aba "Meus Tickets" clássica (Aberto, Em andamento, Resolvido) quanto flutuar um "WhatsApp like" chat head.

### Histórico Perpétuo e Resolubilidade

Nenhuma mensagem ou ticket é deletada arbitrariamente. Soft keys e triggers matem a segurança intacta. O Master é blindado com "Ticket Notas", facilitando muito a vida dos atendentes trocando turno sem que o franqueado visualize anotações internas.

---

## RLS — Cargos e Acessos

| Cargo            | Visão de Tickets        | Visão de Notas Internas |
| ---------------- | ----------------------- | ----------------------- |
| `admin_master`   | Todos os tickets        | Todas                   |
| `gerente_master` | Todos os tickets        | Todas                   |
| `admin_loja`     | Tickets da própria loja | Nenhum                  |
| `gerente_loja`   | Tickets da própria loja | Nenhum                  |
| `staff_loja`     | Tickets da própria loja | Nenhum                  |
| Público (anon)   | Sem acesso              | Nenhum                  |

---

## Estrutura desta pasta

```
backend/suporte/
├── 00-visao-geral.md               ← este arquivo
├── 01-tickets.md                   ← tickets (cabecalho)
├── 02-ticket-mensagens.md          ← thread
└── 03-ticket-notas.md              ← anotações blindadas
```
