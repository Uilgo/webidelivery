# View: `vw_extracao_produtos_vendidos`

A adoção do "Carrinho Imutável" JSONB na tabela de `pedidos` gerou uma parede para o tradicional ranking `JOIN`. Esta View expande esse JSONB nativamente e tabula o conteúdo para que o componente "Produtos Mais Vendidos" na Dashboard brilhe.

---

## Propósito

- Extrair através da função `jsonb_array_elements(...)` do PostgreSQL os nós do array de Itens presentes dentro dos Carrinhos de Pedidos da plataforma.
- Facilitar a agregação para descobrir o "Top 10 Pizzas mais pedidas" ou "Adicionais mais agregados".

---

## Colunas Tabulares Expandidas

| Coluna                | Tipo    | Descrição                                                                                                                                            |
| --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_pedido`           | uuid    | Referência para saber a qual transação primária esse item (agora extraído) pertencia.                                                                |
| `loja_id`             | uuid    | Retido para garantir segurança Multi-tenant (RLS).                                                                                                   |
| `produto_original_id` | uuid    | Caso mantido no snapshot JSONB, indica o produto relacional originário.                                                                              |
| `nome_produto`        | text    | Extraído do snapshot (ex: "Pizza Calabresa"). Imutável, garante que contagens retroativas existam mesmo se a pizzaria apagar o produto do menu hoje. |
| `quantidade_comprada` | numeric | A qtd na bolsa (ex: 3). Extraída do JSONB e transformada de String JSON para Numeric.                                                                |
| `valor_total_item`    | numeric | O preço cobrado isoladamente naquele item.                                                                                                           |

---

## Agregação Nativa (View Alternativa Opcional)

Se o objetivo for estrito a ranking (`vw_ranking_produtos_mais_vendidos`), os dados acima podem ser providos usando `GROUP BY nome_produto` devolvendo nativamente:

1. `nome_produto`
2. `frequencia_aparecimentos`
3. `soma_quantidade`
4. `subtotal_fat_gerado`

Desta forma, o Client só busca `limit(5)` da view.

---

## RLS e Segurança

Padrão de Criação Obrigatório:

> Deverá ser gerada como `CREATE VIEW vw_extracao_produtos_vendidos WITH (security_invoker = true)`

Com `security_invoker = true`, a view herda automaticamente as políticas RLS da tabela subjacente (`pedidos`). O campo `loja_id` retido garante que o filtro multi-tenant é aplicado transparentemente — `admin_loja` vê apenas produtos vendidos na própria loja, `admin_master` vê todos. Nenhuma política RLS adicional precisa ser criada na view.

---

## Utilização

Seu frontend consome como se fosse uma tabela comum de Itens, tirando o peso matemático do render e colocando o parser focado eficientemente na CPU do PostgreSQL.
