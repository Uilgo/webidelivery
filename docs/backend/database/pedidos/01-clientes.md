# Tabela: `clientes`

Módulo dedicado aos clientes finais das lojas. Sistema híbrido suportando checkout limpo "frictionless" (Visitantes) e Opt-ins de lealdade (Registrados), isolados estritamente por loja.

---

## Propósito

- Suportar clientes anônimos (Guests) para zero fricção no ambiente de vitrine / carrinho de compras.
- Permitir conversão assíncrona (Opt-in) onde o visitante adiciona Email e Senha (com hash) para ter vantagens (Fidelização, histórico salvo online, endereço na nuvem, presentinhos de aniversário).
- Garantir de ponta a ponta o **Multitenancy verdadeiro**: O e-mail `ana@email.com` pode criar contas separadas, com senhas únicas, na Loja X e na Loja Y sem colisão global.

---

## Colunas

| Coluna             | Tipo        | Nullable | Default             | Descrição                                                                             |
| ------------------ | ----------- | -------- | ------------------- | ------------------------------------------------------------------------------------- |
| `id`               | uuid        | NO       | `gen_random_uuid()` | PK                                                                                    |
| `loja_id`          | uuid        | NO       | —                   | FK → `lojas.id`                                                                       |
| `tipo_cadastro`    | text        | NO       | `'visitante'`       | Restrito: `'visitante'` ou `'registrado'`                                             |
| `device_token`     | uuid        | YES      | —                   | Cookie silencioso de acompanhamento do visitante (identificador provisório front-end) |
| `email`            | text        | YES      | —                   | **Obrigatório se** `tipo_cadastro = 'registrado'`                                     |
| `senha_hash`       | text        | YES      | —                   | Hash isolado (Bcrypt gerado pelo servidor) da senha da conta daquela loja             |
| `nome`             | text        | NO       | —                   | Nome principal                                                                        |
| `telefone`         | text        | NO       | —                   | Telefone / WhatsApp principal.                                                        |
| `enderecos_salvos` | jsonb       | NO       | `[]`                | O índice `0` pode ser extraído sempre como endereço principal automático no front     |
| `perfil_crm`       | jsonb       | NO       | `{}`                | Extrema flexibilidade: Aniversários, pontos, CPF, opt-in de marketing, etc            |
| `total_pedidos`    | integer     | NO       | `0`                 | Volume contabilizado após transação completa (analítico base)                         |
| `total_gasto`      | numeric     | NO       | `0.00`              | LTV (Life Time Value) faturado com sucesso na base para a loja                        |
| `ultimo_pedido_em` | timestamptz | YES      | —                   | Data analítica de recência. Ideal para automações como "Saudades! Peça com desconto!" |
| `created_at`       | timestamptz | NO       | `now()`             | Criação orgânica                                                                      |
| `updated_at`       | timestamptz | NO       | `now()`             | Auto trigger update natural                                                           |
| `deleted_at`       | timestamptz | YES      | —                   | Soft delete / Adequação básica LGPD (anonimização / exclusão solicitada).             |

---

## Constraints e Integridade

| Nome                        | Tipo         | Colunas / Condição                                                                                         |
| --------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `clientes_pkey`             | PK           | `id`                                                                                                       |
| `clientes_loja_id_fkey`     | FK           | `loja_id` → `lojas(id)` ON DELETE CASCADE                                                                  |
| `clientes_email_loja_uidx`  | UNIQUE INDEX | `(loja_id, email)` WHERE `tipo_cadastro = 'registrado' AND deleted_at IS NULL` (A Mágica da Independência) |
| `check_clientes_requisitos` | CHECK        | Se for `registrado`, `email` e `senha_hash` **MUST NOT BE NULL**.                                          |
| `check_clientes_tipo`       | CHECK        | Tipagem base: `tipo_cadastro IN ('visitante', 'registrado')`                                               |

---

## Índices de Performance

| Nome                             | Colunas                       | Observação                                                                       |
| -------------------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `idx_clientes_loja_telefone`     | `(loja_id, telefone)`         | Agilizar buscas rápidas do Admin pelo zap do cliente em tela de CRM.             |
| `idx_clientes_crm_ultimo_pedido` | `(loja_id, ultimo_pedido_em)` | Indexação essencial para filtros temporais do Marketing nas automações inativas. |
| `idx_clientes_device_token`      | `(loja_id, device_token)`     | Identificar velozmente cestas em andamento quando abrir a Home da web.           |

---

## Estratégia de Identidade e Segurança

Como a conta não atrela as regras unitárias do banco de usuários internos do Supabase (o `auth.users`), os clientes finais e o Frontend **não interagem de forma direta** com o PostgREST para mutações ou leituras (Sem sessão padrão de App).

Tudo roda através do backend central que age protegendo os registros e servindo JSON tokens via API em camadas para os usuários finais isolados (Service Role Bypass ou rotas de Edge Functions conectadas).

## RLS (Row Level Security)

| Cargo            | O que pode ver                        |
| ---------------- | ------------------------------------- |
| `admin_master`   | Todos os clientes                     |
| `gerente_master` | Todos os clientes                     |
| `admin_loja`     | Clientes da própria loja              |
| `gerente_loja`   | Clientes da própria loja              |
| `staff_loja`     | Clientes da própria loja              |
| Público (anon)   | Nenhum acesso direto (Apenas via RPC) |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política                        | Operação | Descrição                                                                |
| --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `admin_master_pode_visualizar_clientes` | SELECT   | Master e Gerente Master veem todos                                       |
| `equipe_loja_pode_visualizar_clientes`  | SELECT   | Admin/Gerente/Staff veem clientes da própria loja (via `perfis.loja_id`) |

> Público não tem política SELECT direta — acesso via rotas protegidas pelo backend.

---

## Funções RPC Auxiliares do Módulo

| Nome da Função                             | Segurança        | Resumo do Comportamento                                                                                                                                                                                               |
| ------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_upgrade_visitante_para_registrado` | SECURITY DEFINER | Pega o id do Visitante gerado com endereço preenchido de um carrinho. Valida se o email requerido colide com restrições locais de loja. Hasha a senha. Vira `'registrado'`.                                           |
| `fn_rpc_incrementar_contadores_compra`     | SECURITY DEFINER | Após processamento financeiro do Order aprovado, incrementa a row de `total_pedidos`, o ticket de `total_gasto` numéricamente seguro e bate novo timestamp orgânico.                                                  |
| `fn_rpc_mesclar_visitante_em_auth`         | SECURITY DEFINER | Quando uma cliente Registrada antiga entra num dispositivo novo pelo link limpo e forma um carrinho fantasma; Após o log nela, o banco migra os itens novos dessa session cega fantasma e apaga a recém-criada visit. |
