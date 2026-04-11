# Tabela: `entregador_acertos`

Auditoria blindada para o dono do estabelecimento bater o caixa, projetada para aterrissar como uma luva nos dois fluxos reais das pizzarias:

- **Fluxo "Pingado" (Corrida a Corrida):** O motoboy faz a entrega, volta e o caixa já dá a nota de R$ 5,00 na mão dele. O sistema gera a entrada com `total_corridas` igual a 1.
- **Fluxo "Fim de Noite" (Diária):** O motoboy roda o expediente inteiro. Às 3 da madrugada, o gerente soma e paga tudo num PIX único. O sistema gera a entrada com `total_corridas` igual a 15, por exemplo.

---

## Colunas

| Coluna               | Tipo        | Nullable | Descrição                                                                      |
| -------------------- | ----------- | -------- | ------------------------------------------------------------------------------ |
| `id`                 | uuid        | NO       | PK                                                                             |
| `loja_id`            | uuid        | NO       | Isolamento multitenant.                                                        |
| `entregador_id`      | uuid        | NO       | Quem recebeu a grana (FK `entregadores.id`).                                   |
| `fechado_por`        | uuid        | NO       | UUID do Gerente que liberou o dinheiro do Caixa/Tirou do Pix (FK `perfis.id`). |
| `total_corridas`     | integer     | NO       | Número inteiro da soma de entregas fechadas neste acerto (Ex: 15).             |
| `valor_pago`         | numeric     | NO       | Montante financeiro acertado.                                                  |
| `registro_pagamento` | jsonb       | YES      | Tipo: `{"metodo": "pix", "comprovante_url": "...", "obs": "adiantou frete"}`.  |
| `criado_em`          | timestamptz | NO       | Data do acerto da diária.                                                      |

---

## RLS (Row Level Security)

Nenhum entregador tem visão ou acesso liberado nesta tabela (os caixas da franquia pertencem à franquia). Apenas administradores do estabelecimento acessam o livro-razão logístico.

| Cargo                   | O que pode ver                             |
| ----------------------- | ------------------------------------------ |
| `admin_master`          | Todos os acertos (Auditoria de plataforma) |
| `gerente_master`        | Todos os acertos                           |
| `admin_loja`            | Acertos de sua própria loja (`loja_id`)    |
| `gerente_loja`          | Acertos de sua própria loja                |
| `staff_loja`            | Não enxerga pagamentos do chefe de caixa   |
| `entregadores` / `anon` | Totalmente bloqueado                       |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política                       | Operação | Descrição                                                                 |
| -------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_acertos` | SELECT   | Master e Gerente Master veem a rede                                       |
| `equipe_loja_pode_visualizar_acertos`  | SELECT   | Admin e Gerente verificam acertos da própria loja (via `perfis.loja_id`). |
