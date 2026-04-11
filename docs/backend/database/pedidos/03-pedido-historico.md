# Tabela: `pedido_historico`

O registro imutável do Ciclo de Vida linear do processamento de um pedido dentro do restaurante.

---

## Propósito

- Nunca permitir apagarem uma trilha de quando algo ficou "Pronto" e só saiu 40 minutos depois (Auditoria de Atrasos).
- Funcionar como o esqueleto do "iFood Tracking" onde o cliente final consegue ver bolinhas ativando de horário e status (`Pendente` → `Cozinha` → `Saiu`).

---

## Colunas

| Coluna        | Tipo        | Nullable | Default             | Descrição                                                                      |
| ------------- | ----------- | -------- | ------------------- | ------------------------------------------------------------------------------ |
| `id`          | uuid        | NO       | `gen_random_uuid()` | PK                                                                             |
| `pedido_id`   | uuid        | NO       | —                   | FK → `pedidos.id` ON DELETE CASCADE                                            |
| `status_novo` | text        | NO       | —                   | Qual o stage da vida do pedido que foi atingido (Idêntico ao restrito da head) |
| `perfil_id`   | uuid        | YES      | —                   | Quem carimbou este estágio (O operador do Caixa, O sistema auto)               |
| `criado_em`   | timestamptz | NO       | `now()`             | Carimbo intocável da hora em que houve a mudança                               |

---

## Constraints

| Nome                              | Tipo | Colunas / Referência                          |
| --------------------------------- | ---- | --------------------------------------------- |
| `pedido_historico_pkey`           | PK   | `id`                                          |
| `pedido_historico_pedido_id_fkey` | FK   | `pedido_id` → `pedidos(id)` ON DELETE CASCADE |
| `pedido_historico_perfil_id_fkey` | FK   | `perfil_id` → `perfis(id)` ON DELETE SET NULL |

> **Sem CHECK constraint em `status_novo`** — seguindo o mesmo padrão de `gateway_provider`, `origem` e `metodo` em outras tabelas: o banco aceita qualquer texto; os valores permitidos são validados pelo **Zod no servidor Nuxt** antes do INSERT. Isso permite adicionar novos estados (ex: `aguardando_retirada`, `devolvido`) ou reorganizar o fluxo sem migration, sem lock de tabela, sem downtime.

## Valores de `status_novo` (referência — validados via Zod no Nuxt)

| Valor          | Descrição                                      |
| -------------- | ---------------------------------------------- |
| `pendente`     | Pedido recém-criado, aguardando aceite da loja |
| `aceito`       | Loja aceitou o pedido                          |
| `em_preparo`   | Pedido está sendo preparado na cozinha         |
| `pronto`       | Pedido pronto para retirada/entrega            |
| `saiu_entrega` | Motoboy saiu para entregar                     |
| `entregue`     | Pedido entregue ao cliente                     |
| `cancelado`    | Pedido cancelado (por qualquer parte)          |

> Novos valores podem ser adicionados apenas atualizando o schema Zod do servidor — sem migration, sem lock de tabela.

## Restrições de Imutabilidade

- Ninguém (nem `admin_master`) tem permissão de `UPDATE/DELETE` livre aqui. A tabela suporta estritamente `INSERT`, consolidando-se como "Ledger/Log".
- A validação dos valores de `status_novo` é feita pelo **Zod no servidor Nuxt** antes de chamar a RPC de inserção.

---

## Índices de Performance

`idx_pedido_historico_busca` atrelado em `(pedido_id, criado_em DESC)` -> Garante retorno na velocidade da luz para o Client-side WebApp preencher a Timeline na tela de Onde está Meu Pedido.

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                           |
| ---------------- | ---------------------------------------- |
| `admin_master`   | Todos os históricos                      |
| `gerente_master` | Todos os históricos                      |
| `admin_loja`     | Históricos dos pedidos da própria loja   |
| `gerente_loja`   | Históricos dos pedidos da própria loja   |
| `staff_loja`     | Históricos dos pedidos da própria loja   |
| Público (anon)   | Apenas via RPC de rastreamento do pedido |

> Todo CUD via **RPC com SECURITY DEFINER**. Mutações diretas são bloqueadas.

### Políticas

| Nome da Política                         | Operação | Descrição                                                                  |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_historico` | SELECT   | Master e Gerente Master veem todos                                         |
| `equipe_loja_pode_visualizar_historico`  | SELECT   | Admin/Gerente/Staff veem históricos da própria loja (via `perfis.loja_id`) |

> Público não tem política SELECT direta.

---

## Funções RPC

Não há RPCs nativos publicos projetados no Histórico para inserção pura. A tabela assopra dados transacionalmente pelos engates das RPCs mestre do Módulo `pedidos` (como o `fn_rpc_modificar_fase_pedido` e o `fn_rpc_criar_pedido`). Ninguem pode inserir aqui diretamente pulando o pedido mestre.
