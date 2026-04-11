# Tabela: `banners`

Banners do carrossel do cardápio público de uma loja.

---

## Propósito

- Exibe imagens promocionais no topo do cardápio público
- Cada banner pode ter um link de destino (produto, categoria, combo ou URL externa)
- Controla período de exibição e ordem no carrossel

---

## Colunas

| Coluna             | Tipo        | Nullable | Default             | Descrição                                                                    |
| ------------------ | ----------- | -------- | ------------------- | ---------------------------------------------------------------------------- |
| `id`               | uuid        | NO       | `gen_random_uuid()` | PK                                                                           |
| `loja_id`          | uuid        | NO       | —                   | FK → `lojas.id`                                                              |
| `titulo`           | text        | YES      | —                   | Título do banner — exibido como alt text e no painel                         |
| `imagem_url_light` | text        | NO       | —                   | URL da imagem do banner para temas claros (light mode)                       |
| `imagem_url_dark`  | text        | YES      | —                   | URL da imagem do banner para temas escuros (dark mode)                       |
| `link_tipo`        | text        | YES      | —                   | Tipo do destino: `produto`, `categoria`, `combo`, `link_externo`, `sem_link` |
| `link_id`          | uuid        | YES      | —                   | ID da entidade destino — null para `link_externo` e `sem_link`               |
| `link_url`         | text        | YES      | —                   | URL externa — usado apenas quando `link_tipo = 'link_externo'`               |
| `ordem`            | integer     | NO       | `0`                 | Ordem no carrossel                                                           |
| `inicio`           | timestamptz | YES      | —                   | Início da exibição — null = exibe imediatamente                              |
| `fim`              | timestamptz | YES      | —                   | Fim da exibição — null = sem expiração                                       |
| `ativo`            | boolean     | NO       | `true`              | Se está visível no cardápio                                                  |
| `deleted_at`       | timestamptz | YES      | —                   | Soft delete                                                                  |
| `created_at`       | timestamptz | NO       | `now()`             | Data de criação                                                              |
| `updated_at`       | timestamptz | NO       | `now()`             | Atualizado automaticamente via trigger `update_banners_modtime`              |

---

## Constraints

| Nome                     | Tipo  | Colunas / Referência                                  |
| ------------------------ | ----- | ----------------------------------------------------- |
| `banners_pkey`           | PK    | `id`                                                  |
| `banners_loja_id_fkey`   | FK    | `loja_id` → `lojas(id)` ON DELETE CASCADE             |
| `check_banners_link_url` | CHECK | `link_tipo != 'link_externo' OR link_url IS NOT NULL` |
| `check_banners_periodo`  | CHECK | `inicio IS NULL OR fim IS NULL OR fim > inicio`       |

> **Sobre `link_tipo`**: Tipos como `produto`, `combo` ou `link_externo` seguem sem constraint de array explícita. Uma estrutura expansível como o marketing exige validação baseada em **Zod**, permitindo campanhas futuras atípicas.

---

## Índices

| Nome                  | Colunas                   | Observação                                  |
| --------------------- | ------------------------- | ------------------------------------------- |
| `banners_pkey`        | `id`                      | PK                                          |
| `idx_banners_loja_id` | `loja_id`                 | WHERE `deleted_at IS NULL`                  |
| `idx_banners_ativos`  | `(loja_id, ativo, ordem)` | WHERE `deleted_at IS NULL AND ativo = true` |
| `idx_banners_periodo` | `(loja_id, inicio, fim)`  | Filtro de banners vigentes no cardápio      |

---

## Regras de Negócio

- `link_tipo = 'sem_link'` ou null → banner decorativo, sem ação ao clicar
- `link_tipo = 'link_externo'` → `link_url` é obrigatório, `link_id` é null
- `link_tipo` em `produto`, `categoria`, `combo` → `link_id` aponta para o ID da entidade (sem FK — polimórfico)
- `inicio` e `fim` nulos = banner sempre visível enquanto `ativo = true`
- Soft delete: `deleted_at` é preenchido em vez de deletar

---

## Relacionamentos

```
lojas (N:1)
  └── banners
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                            |
| ---------------- | ----------------------------------------- |
| `admin_master`   | Todos os banners                          |
| `gerente_master` | Todos os banners                          |
| `admin_loja`     | Banners da própria loja                   |
| `gerente_loja`   | Banners da própria loja                   |
| `staff_loja`     | Banners da própria loja                   |
| `entregador`     | Sem acesso                                |
| Público (anon)   | Banners ativos e vigentes de lojas ativas |

> Todo CUD via **RPC com SECURITY DEFINER**.

### Políticas

| Nome da Política                         | Operação | Descrição                                                         |
| ---------------------------------------- | -------- | ----------------------------------------------------------------- |
| `admin_master_pode_visualizar_banners`   | SELECT   | Master e Gerente Master veem todos                                |
| `equipe_loja_pode_visualizar_banners`    | SELECT   | Admin/Gerente/Staff veem banners da própria loja (perfis.loja_id) |
| `publico_pode_visualizar_banners_ativos` | SELECT   | Anon vê banners ativos e vigentes de lojas ativas                 |

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER` — ignoram RLS para escritas e validam permissões manualmente mapeando o authed UID.

| Nome da Função              | Quem pode chamar         | Função                                                                                                                                                     |
| --------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_criar_banner`       | admin_loja, gerente_loja | Valida ownership da `loja_id`, verifica consistência de `link_tipo`/`link_url`/`link_id`, insere o banner em transação única                               |
| `fn_rpc_atualizar_banner`   | admin_loja, gerente_loja | Valida ownership do banner, atualiza apenas os campos fornecidos via `COALESCE`, revalida consistência de `link_tipo`/`link_url` após merge                |
| `fn_rpc_reordenar_banners`  | admin_loja, gerente_loja | Valida ownership de todos os IDs do array, atualiza `ordem` de múltiplos banners em batch dentro de uma única transação — rejeita se algum ID for inválido |
| `fn_rpc_soft_delete_banner` | admin_loja               | Valida ownership do banner, preenche `deleted_at = now()` — bloqueia se cargo for `gerente_loja`                                                           |
