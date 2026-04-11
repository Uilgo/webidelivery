# Tabela: `produtos`

Produtos do cardápio de uma loja. Vinculados a uma categoria.

---

## Propósito

- Representa cada item do cardápio disponível para pedido
- Não armazena preço diretamente — preço fica em `produto_variacoes` (mínimo 1 variação obrigatória)
- Controla visibilidade, destaque e disponibilidade por horário
- Configurações de divisão de sabores (meia a meia) ficam aqui, não na categoria

---

## Colunas

| Coluna             | Tipo        | Nullable | Default             | Descrição                                                                    |
| ------------------ | ----------- | -------- | ------------------- | ---------------------------------------------------------------------------- |
| `id`               | uuid        | NO       | `gen_random_uuid()` | PK                                                                           |
| `loja_id`          | uuid        | NO       | —                   | FK → `lojas.id` — desnormalizado para queries diretas sem JOIN em categorias |
| `categoria_id`     | uuid        | NO       | —                   | FK → `categorias.id`                                                         |
| `nome`             | text        | NO       | —                   | Nome do produto                                                              |
| `descricao`        | text        | YES      | —                   | Descrição exibida no cardápio                                                |
| `imagem_url_light` | text        | YES      | —                   | URL da imagem otimizada para temas claros (light mode)                       |
| `imagem_url_dark`  | text        | YES      | —                   | URL da imagem otimizada para temas escuros (dark mode)                       |
| `ordem`            | integer     | NO       | `0`                 | Ordem de exibição dentro da categoria                                        |
| `ativo`            | boolean     | NO       | `true`              | Se está visível no cardápio                                                  |
| `disponibilidade`  | jsonb       | NO       | `{}`                | Restrição de horário de exibição — vazio = sempre disponível                 |
| `config`           | jsonb       | NO       | `{}`                | Metadados extras (tags, calorias, alérgenos, tempo de preparo)               |
| `deleted_at`       | timestamptz | YES      | —                   | Soft delete                                                                  |
| `created_at`       | timestamptz | NO       | `now()`             | Data de criação                                                              |
| `updated_at`       | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_produtos_modtime`             |

---

## Constraints

| Nome                         | Tipo | Colunas / Referência                      |
| ---------------------------- | ---- | ----------------------------------------- |
| `produtos_pkey`              | PK   | `id`                                      |
| `produtos_loja_id_fkey`      | FK   | `loja_id` → `lojas(id)` ON DELETE CASCADE |
| `produtos_categoria_id_fkey` | FK   | `categoria_id` → `categorias(id)`         |

---

## Índices

| Nome                        | Colunas           | Observação                                            |
| --------------------------- | ----------------- | ----------------------------------------------------- |
| `produtos_pkey`             | `id`              | PK                                                    |
| `idx_produtos_loja_id`      | `loja_id`         | WHERE `deleted_at IS NULL`                            |
| `idx_produtos_categoria_id` | `categoria_id`    | WHERE `deleted_at IS NULL`                            |
| `idx_produtos_config`       | `config`          | GIN index para busca eficiente em atributos dinâmicos |
| `idx_produtos_busca`        | `(loja_id, nome)` | WHERE `deleted_at IS NULL` — busca textual            |

---

## JSONB: `disponibilidade`

Mesma estrutura de `categorias.disponibilidade`. Quando preenchido, sobrescreve a disponibilidade da categoria para este produto específico.

```json
{
	"dias_semana": [5, 6],
	"horario_inicio": "18:00",
	"horario_fim": "23:00"
}
```

> `dias_semana`: 0 = domingo, 1 = segunda, ..., 6 = sábado.

## JSONB: `config`

Metadados extras do produto. Não afetam regras de negócio — usados para exibição e filtragem.

```json
{
	"destaque": true,
	"aceita_divisao_sabores": true,
	"max_sabores": 2,
	"tags": ["vegano", "sem_gluten"],
	"calorias": 450,
	"tempo_preparo_min": 15,
	"alergenos": ["gluten", "lactose"],
	"porcao": "400g"
}
```

---

## Regras de Negócio

- Todo produto deve ter **ao menos uma variação ativa** em `produto_variacoes` — sem variação, não aparece no cardápio
- `loja_id` é desnormalizado (redundante com `categorias.loja_id`) para permitir queries diretas em `produtos` sem JOIN
- `ativo = false` oculta o produto sem afetar outros produtos da categoria
- A flag `config->'aceita_divisao_sabores'` só faz sentido para produtos com múltiplas variações (ex: tamanhos de pizza)
- O limite de sabores `config->'max_sabores'` só é lido se a divisão estiver ativa
- Soft delete: `deleted_at` é preenchido via RPC — cascata em variações e vínculos de grupos

---

## Relacionamentos

```
lojas (N:1)
categorias (N:1)
  └── produtos
        ├── produto_variacoes (1:N) — obrigatório, mínimo 1
        ├── produto_grupos_adicionais (1:N) — opcional
        └── promocoes (1:N) — desconto aplicado ao produto
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                              |
| ---------------- | ------------------------------------------- |
| `admin_master`   | Todos os produtos                           |
| `gerente_master` | Todos os produtos                           |
| `admin_loja`     | Produtos da própria loja                    |
| `gerente_loja`   | Produtos da própria loja                    |
| `staff_loja`     | Produtos da própria loja                    |
| `entregador`     | Sem acesso                                  |
| Público (anon)   | Produtos ativos de lojas com status `ativo` |

> Todo CUD via **RPC com SECURITY DEFINER**. O cliente nunca escreve direto.

### Políticas

| Nome da Política                          | Operação | Descrição                                                                      |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `admin_master_pode_visualizar_produtos`   | SELECT   | Master e Gerente Master veem todos                                             |
| `equipe_loja_pode_visualizar_produtos`    | SELECT   | Admin/Gerente/Staff veem produtos da própria loja (via `perfis.loja_id`)       |
| `publico_pode_visualizar_produtos_ativos` | SELECT   | Anon vê produtos ativos de lojas com `status = 'ativo'` e `deleted_at IS NULL` |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas, o frontend consome diretamente via `Supabase Client`:

- **Cardápio público:** `supabase.from('produtos').select('*, produto_variacoes(*), produto_grupos_adicionais(grupo_adicional_id(*,adicionais(*)))')` → RLS retorna apenas ativos de lojas ativas
- **Destaques:** `supabase.from('produtos').select('*').contains('config', '{"destaque": true}')` → RLS garante isolamento por loja e utiliza o índice GIN
- **Painel da loja:** mesmo select → RLS filtra pela `loja_id` do perfil autenticado, incluindo inativos e com `deleted_at`
- **Painel master:** sem filtro — vê tudo

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` e validam internamente que o `loja_id` pertence ao usuário autenticado antes de executar qualquer operação.

| Nome da Função                    | Quem pode chamar         | Função                                                                                                                                                                          |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_produto`            | admin_loja, gerente_loja | Valida ownership do `loja_id` e do `categoria_id`. Cria produto e a primeira variação obrigatória em uma única transação — bloqueia se nenhuma variação for fornecida           |
| `fn_rpc_atualizar_produto`        | admin_loja, gerente_loja | Valida ownership. Atualiza apenas os campos enviados via `COALESCE` — campos ausentes ou `null` mantêm o valor atual                                                            |
| `fn_rpc_ativar_desativar_produto` | admin_loja, gerente_loja | Valida ownership. Alterna `ativo` — staff também pode chamar para pausar disponibilidade. Não altera `deleted_at`                                                               |
| `fn_rpc_reordenar_produtos`       | admin_loja, gerente_loja | Valida ownership de todos os IDs do batch e que pertencem à mesma loja. Atualiza `ordem` em uma única transação                                                                 |
| `fn_rpc_mover_produto_categoria`  | admin_loja, gerente_loja | Valida ownership do produto e da categoria destino, garantindo que ambos pertencem à mesma loja. Atualiza `categoria_id` em uma única transação                                 |
| `fn_rpc_soft_delete_produto`      | admin_loja               | Valida ownership. Preenche `deleted_at` no produto e em cascata em todas as variações e vínculos de grupos adicionais. Operação irreversível via interface                      |
| `fn_rpc_buscar_produtos_cardapio` | Público (anon)           | Não requer autenticação. Retorna produtos ativos com variações ativas e promoções vigentes de uma loja ativa — filtra `deleted_at IS NULL` e `ativo = true` em todas as camadas |
