# Módulo: `marketing`

Gerencia as ações e estratégias de vendas da loja, permitindo a exibição de banners no cardápio público e o uso de cupons de desconto por código no checkout.

---

## Tabelas

| Arquivo         | Tabela    | Propósito                                                                               |
| --------------- | --------- | --------------------------------------------------------------------------------------- |
| `01-banners.md` | `banners` | Banners promocionais e decorativos exibidos no topo do cardápio público de cada loja    |
| `02-cupons.md`  | `cupons`  | Cupons de desconto ativados por código pelo cliente no checkout (fixo, %, frete grátis) |

---

## Princípios do Módulo

### Banners Dinâmicos

Banners são configurados para o cardápio público com opções de roteamento interno ou links externos. Eles suportam vinculação polimórfica (produtos, categorias ou combos) para servir como atalhos de navegação otimizados.

### Cupons não são Promoções

Enquanto o módulo `catalogo` gerencia `promocoes` (aplicadas automaticamente ao cardápio), o módulo `marketing` cuida dos `cupons`. Cupons são **estritamente acionados por código** digitado pelo usuário.

### Monitoramento de Uso e Limites

Cupons suportam limites totais (`limite_total`) ou individuais (`limite_por_cliente`) processados via RPC no momento da confirmação do pedido para proteção contra uso excessivo.

---

## RLS — Cargos do Novo Sistema

O sistema de marketing opera com a hierarquia das 6 roles do sistema sem whitelabel:

| Cargo            | Acesso ao Marketing                         |
| ---------------- | ------------------------------------------- |
| `admin_master`   | Gerencia/Lê tudo de qualquer loja           |
| `gerente_master` | Lê tudo de qualquer loja                    |
| `admin_loja`     | CUD completo no marketing da própria loja   |
| `gerente_loja`   | CUD no marketing da própria loja (restrito) |
| `staff_loja`     | Leitura do marketing da própria loja        |
| `entregador`     | Sem acesso ao marketing                     |
| Público (`anon`) | Leitura de banners e validação de cupons    |

---

## Operações CUD (RPCs)

Toda escrita ou validação passa pelo banco de dados por meio de RPCs seguras usando `SECURITY DEFINER`, para que detalhes estratégicos sobre validade de cupons e limitações não sejam evadidos no lado do cliente.

---

## Estrutura desta pasta

```
backend/marketing/
├── 00-visao-geral.md               ← este arquivo
├── 01-banners.md                   ← carrossel do cardápio público
└── 02-cupons.md                    ← configuração de cupons de desconto
```
