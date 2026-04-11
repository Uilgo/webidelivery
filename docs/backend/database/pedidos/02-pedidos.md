# Tabela: `pedidos`

O coração da operação da loja. Toda as compras convergem para cá.
Graças à adoção moderna de JSONB, **eliminamos as antigas tabelas fragmentadas de itens e adicionais**, prevenindo corrupção de histórico caso o dono apague uma pizza do cardápio dois meses depois (o recibo do cliente ficará intacto para sempre).

---

## Propósito

- Escudo analítico e financeiro faturado.
- Snapshot fotográfico do que foi cobrado, o que estava no carrinho e de onde estava endereçado.
- Substitui `pedido_itens` e sub-tabelas herdando tudo no formato `carrinho` (JSONB).
- Compatível sem restrições com a nossa limpeza Anti-Whitelabel.

---

## Colunas Principais

### Head & Tracking

| Coluna                | Tipo    | Nullable | Descrição                                                       |
| --------------------- | ------- | -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `id`                  | uuid    | NO       | PK `gen_random_uuid()`                                          |
| `loja_id`             | uuid    | NO       | FK → `lojas.id`                                                 |
| `cliente_id`          | uuid    | NO       | FK → `clientes.id` (A amarração do Híbrido)                     |
| `cupom_id`            | uuid    | YES      | FK → `cupons.id` se houve promoção bruta aplicada               |
| `numero`              | integer | NO       | —                                                               | Número sequencial legível da loja (ex: #153). Gerado automaticamente via trigger — ver seção abaixo |
| `codigo_rastreamento` | text    | NO       | Usado na URL de acompanhamento público sem Auth. ex: `WBD-4F9Q` |

### Snapshots (Fotografias congeladas da compra)

| Coluna             | Tipo  | Nullable | Descrição                                                                                                |
| ------------------ | ----- | -------- | -------------------------------------------------------------------------------------------------------- |
| `cliente_nome`     | text  | NO       | Copiado de clientes. Garante que se ele mudar o nome daqui 1 ano, o recibo 153 continua c/ o nome antigo |
| `cliente_telefone` | text  | YES      | Cópia imutável do telefone usado.                                                                        |
| `carrinho`         | jsonb | NO       | O array completo da cesta, preços originais, sabores e observação geral do pedido ('tirar cebola').      |

### Operação e Finanças

| Coluna         | Tipo    | Nullable | Descrição                                                                                                                               |
| -------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `logistica`    | jsonb   | NO       | Centraliza tipo de entrega, valor da taxa cobrada, tracking e o próprio `endereco` de destino (Extrema flexibilidade)                   |
| `subtotal`     | numeric | NO       | Soma bruta do carrinho (sem taxas)                                                                                                      |
| `desconto`     | numeric | NO       | Valor descontado pelo cupom                                                                                                             |
| `total`        | numeric | NO       | O valor final pago (apenas isso mantido em Numeric puro para permitir relatórios otimizados com `SUM(total)`)                           |
| `pagamento`    | jsonb   | NO       | Detalhes de faturamento e troco. Ex: `{"metodo": "pix_site", "confirmado": true}`                                                       |
| `estado_atual` | jsonb   | NO       | **Substituto universal do Status.** Aceita fases orgânicas da loja e aglomera detalhes como `motivo_cancelamento` nas chaves embutidas. |

### Integrantes Opcionais (Logística de Delivery Interno)

| Coluna          | Tipo | Nullable | Descrição                                                                                                      |
| --------------- | ---- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `entregador_id` | uuid | YES      | FK → vinculada aos perfis de tipo `entregador`. Usada para rastreamento interno nativo ou prestacao de contas. |

---

## Constraints Inteligentes (Filtradas)

| Nome                         | Tipo  | Expressão de Avaliação                            |
| ---------------------------- | ----- | ------------------------------------------------- |
| `pedidos_pkey`               | PK    | `id`                                              |
| `pedidos_loja_id_fkey`       | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE         |
| `pedidos_cliente_id_fkey`    | FK    | `cliente_id` → `clientes(id)` ON DELETE RESTRICT  |
| `pedidos_cupom_id_fkey`      | FK    | `cupom_id` → `cupons(id)` ON DELETE SET NULL      |
| `pedidos_entregador_id_fkey` | FK    | `entregador_id` → `perfis(id)` ON DELETE SET NULL |
| `check_pedidos_financeiro`   | CHECK | `total >= 0`                                      |

> **`ON DELETE RESTRICT` no `cliente_id`**: Impede deleção acidental de um cliente que possui pedidos. A deleção deve ser feita via RPC/Server Route que trata a cascata corretamente.
> **`ON DELETE SET NULL` no `cupom_id`**: Se o cupom for excluído, o pedido mantém o registro histórico (o desconto já consta no snapshot `total`).
> **`ON DELETE SET NULL` no `entregador_id`**: Se o entregador for removido da equipe, os pedidos dele permanecem intactos.

---

## Trigger: Geração do `numero` sequencial

```
CREATE FUNCTION fn_trigger_pedido_numero()
RETURNS trigger AS $$
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1
    INTO NEW.numero
    FROM pedidos
   WHERE loja_id = NEW.loja_id
     FOR UPDATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedido_numero
  BEFORE INSERT ON pedidos
  FOR EACH ROW EXECUTE FUNCTION fn_trigger_pedido_numero();
```

> O `FOR UPDATE` garante atomicidade — mesmo sob concorrência alta, duas transações simultâneas nunca recebem o mesmo número para a mesma loja.

---

## Exemplo do Poder do JSONB `carrinho`

Se amanhã deletarmos a "Pizza de Calabresa" do menu `produtos`, a nota não se corrompe porque toda a estrutura foi transferida e congelada. (O ID original vai junto apenas pra contar Estatísticas).

```json
[
	{
		"produto_id": "uuid-da-pizza",
		"nome": "Pizza Meio a Meio (Calabresa / Queijo)",
		"quantidade": 1,
		"preco_unitario_aplicado": 45.0,
		"observacao": "Sem orégano",
		"sabores": ["uuid-calabresa", "uuid-queijo"],
		"adicionais": [
			{
				"nome": "Borda de Catupiry",
				"preco": 10.0
			}
		]
	}
]
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                           |
| ---------------- | ---------------------------------------- |
| `admin_master`   | Todos os pedidos                         |
| `gerente_master` | Todos os pedidos                         |
| `admin_loja`     | Pedidos da própria loja                  |
| `gerente_loja`   | Pedidos da própria loja                  |
| `staff_loja`     | Pedidos da própria loja                  |
| Público (anon)   | Apenas via RPC por `codigo_rastreamento` |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política                       | Operação | Descrição                                                               |
| -------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `admin_master_pode_visualizar_pedidos` | SELECT   | Master e Gerente Master veem todos                                      |
| `equipe_loja_pode_visualizar_pedidos`  | SELECT   | Admin/Gerente/Staff veem pedidos da própria loja (via `perfis.loja_id`) |

> Público não tem política SELECT — rastreamento via RPC exclusivamente.

---

## Funções RPC

| Nome da Função                 | Restrição de Execução  | Ação Transacional                                                                                                                       |
| ------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_pedido`          | Público / Auth         | Checa cupons (fraude), consolida carrinho para JSONB, processa LTV/Total de compras em `clientes`, e grava tudo blindado.               |
| `fn_rpc_modificar_fase_pedido` | admin_loja, staff_loja | Permite as transições no `estado_atual` da loja e **automaticamente** lança o insert em `pedido_historico` na mesma transação.          |
| `fn_rpc_efetuar_cancelamento`  | admin_loja             | Obriga a loja a mandar o motivo na chave, realiza rollbacks de Cupons descontados, finaliza pedido cancelado na view.                   |
| `fn_rpc_rastrear_pedido`       | Anon / Auth            | Passando o uuid forte `codigo_rastreamento`, devolve a interface pública espelhada (Status Atual + Carrinho) mascarando dados sigilosos |
