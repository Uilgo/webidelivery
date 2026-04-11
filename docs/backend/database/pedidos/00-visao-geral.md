# Módulo: `pedidos`

O núcleo transacional de e-commerce e entregas estrito à loja (Multitenant via `loja_id`).
A nova arquitetura rompeu com a fragmentação tradicional em múltiplas sub-tabelas (Itens, Adicionais, Fretes Avulsos) abraçando estruturas robustas em JSONB. Isso garante blindagem na fidedignidade analítica de faturamento e extrema velocidade de I/O.

---

## Estrutura do Módulo

```
backend/pedidos/
├── 00-visao-geral.md                ← este arquivo
├── 01-clientes.md                   ← identidade híbrida de consumidores
├── 02-pedidos.md                    ← central mestre de caixa (a venda)
├── 03-pedido-historico.md           ← escrivão inalterável da esteira (logs)
└── 04-avaliacoes.md                 ← relatórios de CSAT
```

---

## Filosofia e Princípios de Arquitetura

### 1. Clientes sem Barreiras (CRM Dinâmico)

Nenhum checkout obriga o cliente à "criar uma conta e validar sua senha na hora exata em que está com fome". O sistema aceita convidados usando um gatilho de _device_token_. Posteriormente ele pode ser seduzido a registrar-se, fundindo ambos os trânsitos de cestas em um login canônico imutável (`loja_id`, `email`). Ele é portador do `perguntas_crm` em JSONB que absorve CPF, datas de nascimento ou qualquer variável inventada pelo lojista.

### 2. Carrinho em JSON (Imutável)

O pedido guarda o estado atual de preço, quantidade e nome nominal do sabor. Se a padaria apagar um item master no Catálogo hoje à tarde, a compra de três meses atrás manterá seu recibo intacto garantindo conformidade fiscal e analítica de LTV real em vez de ser desidratada ou re-calculada erroneamente.

### 3. Logística Agrupada

Em vez de depender de colunas engessadas de `taxa`, `bairro de entrega` e `nome do entregador`, integramos a _Logística e Status Plenos_ nos objetos `logistica` e `estado_atual` da tabela `pedidos`. É possível inserir o nome da Empresa 3rd Party (como a Loggi) junto aos logs nativos.

### 4. Transações Protegidas

Operações sensíveis como Aceitar Pedido, Cancelar ou Transitar para "Pronto" rodam acopladas. Na mesma fração de segundo em que o Backend via RPC altera o `estado_atual` matriz da loja, ele bate um `INSERT` irrevogável na tabela de `pedido_historico` com o UUID do Operador. Falsificar atrasos da cozinha tornou-se matematicamente impossível.

---

## Segurança (RLS Contextual)

- O sistema desliga totalmente o acesso _Select Query_ à visitantes da internet.
- Clientes leem sua compra exclusivamente possuindo a Request formatada do Endpoint Rastrear com seus Identificadores Sigilosos.
- Todas as mídias pagas (Dashboard de Vendedores Totais `SUM(total)`) e gráficos via SQL ignoram filtros de Join custosos, buscando valores diretamente nos numéricos absolutos que guardamos na linha transacional `pedidos`.
