# Tabela: `planos`

Catálogo de pacotes de assinatura do sistema. Define o que cada cliente pode fazer e quantos recursos pode usar. Populado e gerenciado exclusivamente pelo `admin_master`.

---

## Propósito

- Define nomes, valores e limites dos planos disponíveis na plataforma
- Centraliza flags e limites numéricos via JSONB — evita dezenas de colunas voláteis no banco
- Controla quais planos aceitam novos assinantes (`status`)
- Alternar o plano para (`status = 'inativo'`) oculta temporariamente, e para (`status = 'arquivado'`) encerra definitivamente para novas vendas sem quebrar o banco

---

## Colunas

| Coluna             | Tipo        | Nullable | Default                                                          | Descrição                                                                  |
| ------------------ | ----------- | -------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `id`               | uuid        | NO       | `gen_random_uuid()`                                              | PK                                                                         |
| `nome`             | text        | NO       | —                                                                | Nome do plano (ex: "Básico", "Premium")                                    |
| `descricao`        | text        | YES      | —                                                                | Chamada comercial exibida na landing page                                  |
| `ciclos_pagamento` | jsonb       | NO       | `{"mensal": {"ativo": false, "valor": 0, "checkout_url": null}}` | Valores e links de checkout separados por tipo de ciclo — ver seção JSONB  |
| `recursos`         | jsonb       | NO       | `{}`                                                             | Limites e flags do plano — ver seção JSONB                                 |
| `destaque`         | boolean     | NO       | `false`                                                          | Se é o plano mais recomendado (destaque na tela de pricing)                |
| `status`           | text        | NO       | `'ativo'`                                                        | Define a visibilidade do plano. Valores válidos na seção de valores abaixo |
| `created_at`       | timestamptz | NO       | `now()`                                                          | Data de criação                                                            |
| `updated_at`       | timestamptz | NO       | `now()`                                                          | Atualizado automaticamente via trigger                                     |

---

## Constraints

| Nome               | Tipo   | Colunas / Referência                          |
| ------------------ | ------ | --------------------------------------------- |
| `planos_pkey`      | PK     | `id`                                          |
| `planos_nome_key`  | UNIQUE | `nome`                                        |
| `ck_planos_status` | CHECK  | `status IN ('ativo', 'inativo', 'arquivado')` |

---

## Índices

| Nome                  | Colunas    | Observação                                                 |
| --------------------- | ---------- | ---------------------------------------------------------- |
| `planos_pkey`         | `id`       | PK                                                         |
| `idx_planos_status`   | `status`   | Filtro principal para ignorar planos inativos e arquivados |
| `idx_planos_destaque` | `destaque` | Filtro para exibir o plano em destaque                     |

---

## Valores Válidos

### `status`

| Valor       | Descrição                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ativo`     | Em operação normal — exibido na Landing Page e disponível para contratação.                                                                 |
| `inativo`   | Oculto temporariamente (ex: testes A/B ou fim de campanha sazonal).                                                                         |
| `arquivado` | Obsoleto. O plano é preservado apenas para retrocompatibilidade de empresas antigas e relatórios, bloqueado para qualquer nova contratação. |

---

## JSONB: `ciclos_pagamento`

Nesta coluna estruturamos todos os links de venda e valores, encapsulando-os num único lugar. É através desse objeto que o front-end montará os _"toggles"_ (ex: botão Alternar para Anual).

```json
{
	"mensal": {
		"ativo": true,
		"valor": 99.9,
		"checkout_url": "https://pay.kiwify.com.br/xxxxx",
		"gateway_config": {
			"provider": "stripe",
			"price_id": "price_1OqXXX"
		}
	},
	"trimestral": {
		"ativo": false,
		"valor": 0.0,
		"checkout_url": null,
		"gateway_config": {}
	},
	"semestral": {
		"ativo": false,
		"valor": 0.0,
		"checkout_url": null,
		"gateway_config": {}
	},
	"anual": {
		"ativo": true,
		"valor": 990.0,
		"checkout_url": "https://pay.kiwify.com.br/yyyyy",
		"gateway_config": {
			"provider": "asaas",
			"billing_type": "YEARLY",
			"value": 990.0
		}
	}
}
```

---

## JSONB: `recursos`

Centraliza todos os limites e features do plano. Novas funcionalidades são adicionadas sem migration — basta uma nova chave.

```json
{
	"limite_lojas": 1,
	"limite_pedidos_mes": -1,
	"tem_pdv": false,
	"tem_relatorios_avancados": false,
	"taxa_fixa_entrega_permitido": true
}
```

> `-1` em campos numéricos indica **sem limite**. O frontend e as RPCs de validação devem tratar `-1` como `Infinity`.

---

## Relacionamentos

```
planos
  ├── empresas.plano_id (1:N) — empresa contratante
  └── assinaturas.plano_id (1:N) — assinaturas ativas no plano
```

> `ON DELETE RESTRICT` em ambas as FKs — um plano não pode ser deletado enquanto houver empresas ou assinaturas vinculadas. Use `status = 'arquivado'` para aposentar um plano permanentemente.

---

## RLS (Row Level Security)

| Cargo                             | O que pode ver                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Público (`anon`)                  | Planos operacionais (`status = 'ativo'`)                                                              |
| Autenticado (Geral)               | Planos operacionais (`status = 'ativo'`) para contratação                                             |
| `admin_loja`                      | Seu próprio plano contratado (lido via `empresa.plano_id`), mesmo se estiver `inativo` ou `arquivado` |
| `admin_master` / `gerente_master` | Todos os planos (incluindo `inativo` e `arquivado`)                                                   |

### Políticas

| Nome da Política                            | Operação | Descrição                                                                                                                                                                |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `publico_pode_visualizar_planos_ativos`     | SELECT   | Qualquer visitante (anon ou auth) vê planos `status = 'ativo'` — usado na landing page e tela de troca de plano                                                          |
| `admin_loja_pode_visualizar_seu_plano`      | SELECT   | Lojistas autenticados podem ler a linha do plano onde `planos.id = empresas.plano_id` vinculada ao seu usuário, recuperando os limites, mesmo sendo um plano `arquivado` |
| `admin_master_pode_visualizar_todos_planos` | SELECT   | Master e Gerente Master veem todos os planos sem filtro                                                                                                                  |

---

## Leituras (PostgREST)

Com as políticas RLS configuradas acima, **não existe necessidade** de RPCs ou Server Routes para leitura (GET). O Frontend (`Nuxt`) pode consumir diretamente as tabelas pelo `Supabase Client`:

- **Landing Page (Pricing):** `supabase.from('planos').select('*')` → O RLS traz automaticamente apenas os planos `ativos`.
- **Painel Master:** O `admin_master` chamando o mesmo `.select('*')` receberá a lista completa (com inativos e arquivados) sem nenhum código extra, além de poder contar assinaturas associadas usando `.select('*, assinaturas(count)')`.

---

## Server Routes (Nitro)

Gestão de planos é exclusiva do `admin_master` e passa pelo servidor para garantir validação centralizada do corpo JSON antes de qualquer escrita de catálogo.

| Route                                    | Método | Quem pode chamar | Descrição                                                                                         |
| ---------------------------------------- | ------ | ---------------- | ------------------------------------------------------------------------------------------------- |
| `server/api/admin/planos/index.post.ts`  | POST   | admin_master     | Cria novo plano validando payload estrito (checa chaves min/max de recursos)                      |
| `server/api/admin/planos/[id].put.ts`    | PUT    | admin_master     | Atualiza nome, descrição, ciclos_pagamento, recursos ou status — usa COALESCE                     |
| `server/api/admin/planos/[id].delete.ts` | DELETE | admin_master     | Soft Delete lógico: Altera o plano para `status = 'arquivado'`. Bloqueado pelo banco fisicamente. |
