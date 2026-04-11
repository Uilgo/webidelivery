# Módulo Logística (Gestão de Entregas)

Este módulo foi desenhado com um princípio blindado: **Simplicidade e Isolamento**. Não tenta construir um marketplace global como Uber ou iFood. Ele atua de forma Multitenant, servindo como uma infraestrutura de frota de terceiros **nativa para cada loja**.

---

## Estrutura do Módulo

```
backend/logistica/
├── 00-visao-geral.md                 ← este arquivo
├── 01-entregadores.md                ← perfis isolados (motoristas por loja) e RPCs de concorrência
└── 02-entregador-acertos.md          ← controle de fechamento de caixa e acertos de corridas
```

---

## Filosofia Arquitetural

### 1. Entregadores Isolados por `loja_id`

A arquitetura nega a permissividade de um banco logístico aberto. Cada motoboy tem seu cadastro atrelado estritamente a um `loja_id`, protegido pela constraint `UNIQUE(loja_id, email)`. Ele poderá ter uma conta operando na Pizzaria A, e outra inteiramente separada operando na Hamburgueria B.

### 2. Payload Flexível de Perfil (JSONB)

A CNH, o modelo da moto, placa e a chave Pix não inflacionam o banco de dados. Eles estão guardados de forma limpa na estrutura JSONB (`perfil_logistico`) da tabela principal de entregadores. Apenas dados vitais para indexação (como `telefone` e `cpf` fiscal) estão alocados em colunas nativas `text`.

### 3. Fila de Pedidos Cega & Concorrência Limpa

Em vez de depender de Subscriptions em tempo real pesadas e custosas, entregadores logados disputam as entregas através de um painel passivo. Quando o entregador clica em "Assumir Entrega" (RPC `fn_rpc_assumir_entrega`), rodamos um **bloqueio de linha** (Lock) nativo no PostgreSQL que garante, organicamente e com zero atrito, que apenas um motociclista tome a direção do pedido na rua.

### 4. Caixas Independentes de Complexidade

Zero burocracia contábil com custódia de dinheiro e Carteiras Digitais sofisticadas no MVP. O gerente aperta um botão para registrar que repassou o dia do motoqueiro, documentando um recibo virtual blindado que comporta o pagamento "pingado" (por corrida) e a Diária completa em lote.
