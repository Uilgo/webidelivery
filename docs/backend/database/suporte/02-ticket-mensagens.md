# Tabela: `ticket_mensagens`

Thread das conversas e envios multimidia (arquivos log) dentro de um ticket de Suporte.

---

## Propósito

- Contém todo o histórico linear da conversa
- Permite renderização de balões UI de chat baseando-se no pilar Lado
- Funciona como "append-only log", ninguém (nem admin) deve deletar ou alterar mensagens enviadas
- Dispara contadores de update instantâneos na tabela de `tickets` cabecalho

---

## Colunas

| Coluna       | Tipo        | Nullable | Default             | Descrição                                                                 |
| ------------ | ----------- | -------- | ------------------- | ------------------------------------------------------------------------- |
| `id`         | uuid        | NO       | `gen_random_uuid()` | PK                                                                        |
| `ticket_id`  | uuid        | NO       | —                   | FK → `tickets.id`                                                         |
| `autor_id`   | uuid        | NO       | —                   | FK → `perfis.id` — dono do disparo                                        |
| `lado`       | text        | NO       | —                   | `cliente` (loja) ou `suporte` (Master) — evita calculo de role on-the-fly |
| `conteudo`   | text        | YES      | —                   | A string base em raw text. NULL é aceito se tiver arquivo jsonb anexado.  |
| `anexos`     | jsonb       | NO       | `[]`                | Array de URLs (PDFs de recibo, screenshots de bugs, etc)                  |
| `lida_em`    | timestamptz | YES      | —                   | Responsável por colocar o check "Lido / visto" do wpp se habilitado       |
| `created_at` | timestamptz | NO       | `now()`             | Auto injetado                                                             |

---

## Constraints

| Nome                              | Tipo  | Colunas / Referência                                     |
| --------------------------------- | ----- | -------------------------------------------------------- |
| `ticket_mensagens_pkey`           | PK    | `id`                                                     |
| `ticket_mensagens_ticket_fkey`    | FK    | `ticket_id` → `tickets(id)` ON DELETE CASCADE            |
| `ticket_mensagens_autor_fkey`     | FK    | `autor_id` → `perfis(id)` ON DELETE CASCADE              |
| `check_ticket_mensagens_lado`     | CHECK | `lado IN ('cliente', 'suporte')`                         |
| `check_ticket_mensagens_conteudo` | CHECK | `conteudo IS NOT NULL OR jsonb_array_length(anexos) > 0` |

---

## Índices

| Nome                             | Colunas                   | Observação                          |
| -------------------------------- | ------------------------- | ----------------------------------- |
| `idx_ticket_mensagens_ticket_id` | `(ticket_id, created_at)` | Para rápida varredura e GET history |

---

## Exemplo do Payload Dinâmico (Anexos)

```json
[
	{
		"nome": "painel-travado-log.png",
		"url": "https://<supabase-storage>/tickets/bug-001/painel.png",
		"tipo": "image/png"
	}
]
```

---

## Regras de Negócio CUD

- **Append-only log**: É impossível rodar um `UPDATE` em uma row de `ticket_mensagens` alterando a prop `conteudo`. Isso seria burlar a confiança B2B. Apenas campos como `lida_em` sofrem update interno pelas Triggers de limpeza de View.
- Ninguém envia manualmente a string `lado`; a RPC obrigatoriamente decodifica a `role` ligada ao Token JWT pra forçar o label autêntico e impedir spoofing.
- Inserir linha aqui = Forçar Incremento em `tickets.nao_lidas_*`

---

## RLS (Row Level Security)

Exatamente a mesma hierarquia de herança do Cabeçalho Tickets.

| Nome da Política                 | Operação | Descrição                                                  |
| -------------------------------- | -------- | ---------------------------------------------------------- |
| `ticket_mensagens_select_master` | SELECT   | Master veem tudo                                           |
| `ticket_mensagens_select_loja`   | SELECT   | Lojas validam via sub-query simples contra dono de tickets |

---

## Funções RPC

| Nome da Função                  | Quem pode chamar           | Descrição da Camada de Validação                                                                                      |
| ------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_enviar_mensagem_ticket` | Membros habilitados em RLS | Impede escrita em tickets cujo `status='fechado'`. Avalia seu cargo para classificar dinamicamente o valor de `lado`. |
