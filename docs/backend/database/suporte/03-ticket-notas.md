# Tabela: `ticket_notas`

Anotações cegas anexadas a um ticket — exclusivamente legíveis e operáveis pela equipe da Plataforma.

---

## Propósito

- Suporte N1 avisa o Suporte N2 sobre características escondidas do cliente.
- Diagnósticos não resolvidos que não interessam o board do cliente.
- Repositório de links internos atrelados aquele problema específico.
- Acesso à essa tabela pelo grupo "lojas" (clientes do WebIDelivery) é bloqueado com nível hard (RLS cego).

---

## Colunas

| Coluna       | Tipo        | Nullable | Default             | Descrição                                     |
| ------------ | ----------- | -------- | ------------------- | --------------------------------------------- |
| `id`         | uuid        | NO       | `gen_random_uuid()` | PK                                            |
| `ticket_id`  | uuid        | NO       | —                   | FK → `tickets.id`                             |
| `autor_id`   | uuid        | NO       | —                   | FK → `perfis.id` (obrigatoriamente um Master) |
| `conteudo`   | text        | NO       | —                   | Texto confidencial do sistema                 |
| `created_at` | timestamptz | NO       | `now()`             | Data/hora                                     |

---

## Constraints

| Nome                       | Tipo | Colunas / Referência                          |
| -------------------------- | ---- | --------------------------------------------- |
| `ticket_notas_pkey`        | PK   | `id`                                          |
| `ticket_notas_ticket_fkey` | FK   | `ticket_id` → `tickets(id)` ON DELETE CASCADE |
| `ticket_notas_autor_fkey`  | FK   | `autor_id` → `perfis(id)` ON DELETE CASCADE   |

---

## RLS (Row Level Security)

> RLS mais agressivo do módulo. Se não for membro Master, a View entrega Array Void = Zero.

| Cargo            | O que pode ver                               |
| ---------------- | -------------------------------------------- |
| `admin_master`   | Todas as notas internas de auditoria técnica |
| `gerente_master` | Todas as notas                               |
| demais cargos    | VÁCUO (Zero resultados)                      |

### Políticas

| Nome da Política             | Operação | Descrição                                     |
| ---------------------------- | -------- | --------------------------------------------- |
| `ticket_notas_select_master` | SELECT   | Autorizado estrito via Auth JWT `perfil_role` |

---

## Funções RPC

| Nome da Função             | Quem pode chamar             | Propósito de Validação Rígida                                                                     |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_nota_ticket` | admin_master, gerente_master | Desencoraja clients externos ao garantir server-level check antes do insert transacional secreto. |
