# Módulo: `catalogo`

Gerencia o cardápio completo de cada loja — categorias, produtos, variações de preço, grupos de adicionais, combos e promoções de desconto.

---

## Tabelas

| Arquivo                           | Tabela                      | Propósito                                                                     |
| --------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `01-categorias.md`                | `categorias`                | Agrupadores visuais do cardápio — seções navegáveis (ex: "Pizzas", "Bebidas") |
| `02-produtos.md`                  | `produtos`                  | Itens do cardápio vinculados a uma categoria — sem preço próprio              |
| `03-produto-variacoes.md`         | `produto_variacoes`         | Variações de um produto (tamanho, sabor base) — onde o preço vive             |
| `04-grupos-adicionais.md`         | `grupos_adicionais`         | Grupos de complementos reutilizáveis entre produtos (ex: "Bordas", "Molhos")  |
| `05-adicionais.md`                | `adicionais`                | Itens individuais dentro de um grupo de adicionais                            |
| `06-produto-grupos-adicionais.md` | `produto_grupos_adicionais` | Vínculo N:N entre produtos e grupos de adicionais                             |
| `07-combos.md`                    | `combos`                    | Combos com preço fixo definido pelo admin                                     |
| `08-combo-grupos.md`              | `combo_grupos`              | Grupos de escolha dentro de um combo (etapas de montagem)                     |
| `09-combo-grupo-opcoes.md`        | `combo_grupo_opcoes`        | Produtos disponíveis para escolha em cada grupo de combo                      |
| `10-promocoes.md`                 | `promocoes`                 | Promoções polimórficas aplicadas a produtos ou categorias                     |

---

## Hierarquia do Cardápio

```
lojas (1:N)
  └── categorias
        └── produtos
              ├── produto_variacoes (1:N) — obrigatório, mínimo 1
              └── produto_grupos_adicionais (N:N)
                    └── grupos_adicionais
                          └── adicionais (1:N)

lojas (1:N)
  └── combos
        └── combo_grupos (1:N)
              └── combo_grupo_opcoes (1:N) ──→ produtos

lojas (1:N)
  └── promocoes (polimórfico) ──→ produto | categoria
```

---

## Princípios do Módulo

### Preço vive na variação, não no produto

Produtos não têm preço direto. O preço está em `produto_variacoes`. Todo produto deve ter **ao menos uma variação ativa** — sem variação ele não aparece no cardápio.

Quando há apenas 1 variação, o cliente não vê seleção — o preço é exibido diretamente. Quando há múltiplas variações, o cliente escolhe uma antes de adicionar ao carrinho.

### Adicionais são reutilizáveis

Um grupo de adicionais é criado no nível da loja — não do produto. O mesmo grupo (ex: "Bordas Recheadas") pode ser vinculado a múltiplos produtos via `produto_grupos_adicionais`.

### Combos têm preço fixo

O preço do combo é definido pelo admin. O preço original (para exibir a economia) é calculado via query — não armazenado. Um combo pode ter grupos de escolha onde o cliente seleciona os itens.

### Promoções são polimórficas

A tabela `promocoes` centraliza todos os descontos. O campo `entidade_tipo` identifica o alvo: `produto` ou `categoria`. Uma promoção de categoria afeta todos os produtos dela. Quando há conflito, a maior desconto vence.

### Soft delete no catálogo

Diferente das tabelas core, o catálogo usa `deleted_at` porque:

- Produtos podem ser temporariamente removidos e restaurados
- Histórico de pedidos referencia itens que podem ter sido deletados
- Cascata é controlada via RPC (não via FK `ON DELETE CASCADE`)

---

## Segurança e Escrita

### Leituras (PostgREST Nativo)

Com RLS configurado, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** `supabase.from('produtos').select('*, produto_variacoes(*)')` — RLS retorna apenas ativos de lojas ativas
- **Painel da loja:** mesmo select, RLS filtra pela `loja_id` do perfil autenticado
- **Painel master:** sem filtro — vê tudo

### CUD (RPCs com SECURITY DEFINER)

Todas as operações de escrita (INSERT, UPDATE, DELETE) no catálogo passam por **RPCs com `SECURITY DEFINER`**. Cada RPC:

1. Valida que o `loja_id` alvo pertence ao usuário autenticado (ownership check)
2. Executa a operação dentro de uma transação única
3. Usa `COALESCE` nos UPDATEs — campos ausentes ou `null` mantêm o valor atual
4. Revalida constraints de negócio após COALESCE antes de commitar

> Não há Server Routes no módulo de catálogo — nenhuma operação aqui envolve `auth.admin`.

---

## RLS — Cargos do Novo Sistema

O catálogo opera com **6 cargos** (sem whitelabel):

| Cargo            | Acesso ao catálogo                       |
| ---------------- | ---------------------------------------- |
| `admin_master`   | Lê catálogo de qualquer loja             |
| `gerente_master` | Lê catálogo de qualquer loja             |
| `admin_loja`     | CUD completo no catálogo da própria loja |
| `gerente_loja`   | CUD no catálogo da própria loja          |
| `staff_loja`     | Leitura do catálogo da própria loja      |
| `entregador`     | Sem acesso ao catálogo                   |
| Público (`anon`) | Leitura de itens ativos de lojas ativas  |

---

## Convenções deste Módulo

- Tabelas: `snake_case` plural
- PKs: `id` (uuid, `gen_random_uuid()`)
- FKs: `{tabela_singular}_id`
- Soft delete: `deleted_at timestamptz NULL` — `WHERE deleted_at IS NULL` em todo índice parcial
- Triggers: `update_{tabela}_modtime` em toda tabela com `updated_at`
- RPCs: `fn_rpc_{verbo}_{substantivo}` — sempre `SECURITY DEFINER`
- Políticas RLS: `{cargo}_pode_{acao}_{contexto}`

---

## Estrutura desta pasta

```
backend/catalogo/
├── 00-visao-geral.md               ← este arquivo
├── 01-categorias.md                ← categorias do cardápio
├── 02-produtos.md                  ← produtos do cardápio
├── 03-produto-variacoes.md         ← variações de preço por produto
├── 04-grupos-adicionais.md         ← grupos de complementos reutilizáveis
├── 05-adicionais.md                ← itens dentro dos grupos de adicionais
├── 06-produto-grupos-adicionais.md ← vínculo N:N produto ↔ grupo adicional
├── 07-combos.md                    ← combos com preço fixo
├── 08-combo-grupos.md              ← grupos de escolha dentro de combos
├── 09-combo-grupo-opcoes.md        ← opções de produtos em cada grupo de combo
└── 10-promocoes.md                 ← promoções polimórficas (produto/categoria)
```
