# Tabela: `lojas`

Estabelecimentos/Unidades físicas — restaurantes, deliverys, lanchonetes, etc.

---

## Propósito

- Representa cada estabelecimento operacional vinculado a uma empresa
- É o nível mais granular do multi-tenant — toda operação (pedidos, cardápio, marketing) é isolada por `loja_id`
- Armazena dados públicos do estabelecimento (exibidos no cardápio), configurações operacionais e de tema
- Controla o status de funcionamento em tempo real (`aberto` / `fechado`)

---

## Colunas

### Identificação

| Coluna                 | Tipo    | Nullable | Default             | Descrição                                                                                                                                                                        |
| ---------------------- | ------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | uuid    | NO       | `gen_random_uuid()` | PK                                                                                                                                                                               |
| `empresa_id`           | uuid    | NO       | —                   | FK → `empresas.id`                                                                                                                                                               |
| `is_matriz`            | boolean | NO       | `false`             | Se é a loja principal da empresa — criada junto com a empresa no onboarding. Apenas uma loja por empresa pode ter `is_matriz = true`                                             |
| `nome_estabelecimento` | text    | NO       | —                   | Nome público do estabelecimento                                                                                                                                                  |
| `slug`                 | text    | NO       | —                   | Slug da loja. Na loja matriz: espelho de `empresas.slug`, sincronizado via RPC — único globalmente. Nas filiais: único por empresa, compõe a URL `/{empresa_slug}/{filial_slug}` |
| `status`               | text    | NO       | `rascunho`          | Status da loja. A loja matriz recebe `'ativo'` explicitamente via RPC de onboarding. Filiais nascem `'rascunho'`.                                                                |
| `categoria`            | text    | YES      | —                   | Tipo do negócio (ex: "Pizzaria", "Hamburgueria", "Açaí")                                                                                                                         |
| `descricao`            | text    | YES      | —                   | Descrição exibida no cardápio público                                                                                                                                            |

### Mídia

| Coluna             | Tipo | Nullable | Default | Descrição                      |
| ------------------ | ---- | -------- | ------- | ------------------------------ |
| `logo_light_url`   | text | YES      | —       | URL do logo para tema claro    |
| `logo_dark_url`    | text | YES      | —       | URL do logo para tema escuro   |
| `banner_light_url` | text | YES      | —       | URL do banner para tema claro  |
| `banner_dark_url`  | text | YES      | —       | URL do banner para tema escuro |

### Contato e Dados Legais

| Coluna          | Tipo  | Nullable | Default | Descrição                                                                                        |
| --------------- | ----- | -------- | ------- | ------------------------------------------------------------------------------------------------ |
| `cpf`           | text  | YES      | —       | CPF do responsável pelo estabelecimento                                                          |
| `cnpj`          | text  | YES      | —       | CNPJ do estabelecimento                                                                          |
| `telefone`      | text  | YES      | —       | Telefone de contato                                                                              |
| `whatsapp`      | text  | YES      | —       | WhatsApp exibido no cardápio público                                                             |
| `email`         | text  | YES      | —       | Email de contato — exibido no cardápio público. Independente do email de login do `admin_loja`   |
| `redes_sociais` | jsonb | NO       | `{}`    | Links e handles das redes sociais e plataformas externas — chaves pré-definidas, todos opcionais |

### Endereço

| Coluna                 | Tipo | Nullable | Default | Descrição           |
| ---------------------- | ---- | -------- | ------- | ------------------- |
| `endereco_rua`         | text | YES      | —       | Rua/Logradouro      |
| `endereco_numero`      | text | YES      | —       | Número              |
| `endereco_complemento` | text | YES      | —       | Complemento         |
| `endereco_bairro`      | text | YES      | —       | Bairro              |
| `endereco_cidade`      | text | YES      | —       | Cidade              |
| `endereco_estado`      | text | YES      | —       | Estado (UF)         |
| `endereco_cep`         | text | YES      | —       | CEP (XXXXX-XXX)     |
| `endereco_referencia`  | text | YES      | —       | Ponto de referência |

### Operação

| Coluna                  | Tipo    | Nullable | Default | Descrição                                                                                                                                                            |
| ----------------------- | ------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aberto`                | boolean | NO       | `false` | Status de funcionamento **calculado** — atualizado automaticamente pelo sistema com base em `horario_funcionamento` e `forcar_fechado`. Nunca atualizado manualmente |
| `forcar_fechado`        | boolean | NO       | `false` | Toggle do painel — quando `true` a loja fica **fechada independente do horário**. `false` = modo automático (segue `horario_funcionamento`)                          |
| `horario_funcionamento` | jsonb   | NO       | `{}`    | Horários por dia da semana — define quando a loja abre/fecha automaticamente                                                                                         |
| `config_geral`          | jsonb   | NO       | `{}`    | Configurações operacionais (pagamentos, taxas, tempos, tipos de entrega)                                                                                             |
| `config_tema`           | jsonb   | NO       | `{}`    | Tema visual do cardápio público (4 cores base)                                                                                                                       |
| `setup_status`          | jsonb   | NO       | `{}`    | Progresso do onboarding por seção                                                                                                                                    |

### Controle

| Coluna       | Tipo        | Nullable | Default | Descrição                              |
| ------------ | ----------- | -------- | ------- | -------------------------------------- |
| `created_at` | timestamptz | NO       | `now()` | Data de criação                        |
| `updated_at` | timestamptz | NO       | `now()` | Atualizado automaticamente via trigger |

---

## Constraints

| Nome                      | Tipo  | Colunas / Referência                                                |
| ------------------------- | ----- | ------------------------------------------------------------------- |
| `lojas_pkey`              | PK    | `id`                                                                |
| `lojas_empresa_id_fkey`   | FK    | `empresa_id` → `empresas(id)` ON DELETE CASCADE ON UPDATE NO ACTION |
| `check_lojas_slug_format` | CHECK | `slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'`                             |
| `check_lojas_slug_length` | CHECK | `length(slug) BETWEEN 3 AND 50`                                     |

> **Sobre o `status`**: O banco não bloqueia transições de status. A tabela é flexibilizada e o status é qualificado no **Zod** no ambiente do middleware e das APIs.

---

## Índices

| Nome                     | Colunas              | Observação                                                          |
| ------------------------ | -------------------- | ------------------------------------------------------------------- |
| `lojas_pkey`             | `id`                 | PK                                                                  |
| `idx_lojas_slug_matriz`  | `slug`               | UNIQUE WHERE `is_matriz = true` — slug da matriz único globalmente  |
| `idx_lojas_empresa_slug` | `(empresa_id, slug)` | UNIQUE WHERE `is_matriz = false` — slug de filial único por empresa |
| `idx_lojas_empresa_id`   | `empresa_id`         | Busca de lojas por empresa                                          |
| `idx_lojas_status`       | `status`             | Filtro por status                                                   |
| `idx_lojas_aberto`       | `aberto`             | Filtro rápido para cardápios públicos que exibem só lojas abertas   |

---

## JSONB: `horario_funcionamento`

```json
{
	"segunda": { "aberto": true, "abre": "11:00", "fecha": "23:00" },
	"terca": { "aberto": true, "abre": "11:00", "fecha": "23:00" },
	"quarta": { "aberto": true, "abre": "11:00", "fecha": "23:00" },
	"quinta": { "aberto": true, "abre": "11:00", "fecha": "23:00" },
	"sexta": { "aberto": true, "abre": "11:00", "fecha": "00:00" },
	"sabado": { "aberto": true, "abre": "11:00", "fecha": "00:00" },
	"domingo": { "aberto": false, "abre": null, "fecha": null }
}
```

> [!NOTE]
> O campo `aberto` desta estrutura indica se **aquele dia da semana está no cronógrama**. O campo `lojas.aberto` (boolean na tabela) é o **status em tempo real**, calculado pelo job que compara o dia/hora atual com esses horários, respeitando `forcar_fechado`.

### Lógica do campo `aberto` (tabela)

```
se forcar_fechado = true
  → aberto = false  (independente do horário, independente do dia)

se forcar_fechado = false
  → aberto = calcula(horario_funcionamento, dia_atual, hora_atual)
     - verifica se o dia da semana tem { aberto: true }
     - verifica se hora_atual está entre abre e fecha
     - resultado: true ou false
```

**Toggle no header do painel:** escreve apenas `forcar_fechado`. O campo `aberto` é recalculado automaticamente pelo sistema.

| Toggle visual | `forcar_fechado` | O que acontece                                              |
| ------------- | ---------------- | ----------------------------------------------------------- |
| 🟢 Aberto     | `false`          | Sistema segue o horário definido em `horario_funcionamento` |
| 🔴 Fechado    | `true`           | Loja fechada imediatamente, independente do horário         |

## JSONB: `config_geral`

```json
{
	"aceita_delivery": true,
	"aceita_retirada": true,
	"aceita_consumo_local": false,
	"raio_entrega_km": 10,
	"formas_pagamento": [
		{ "tipo": "pix_online", "label": "Pix", "ativo": true },
		{ "tipo": "pix_entrega", "label": "Pix na entrega", "ativo": true },
		{ "tipo": "dinheiro", "label": "Dinheiro", "ativo": true },
		{ "tipo": "cartao_credito", "label": "Cartão de Crédito", "ativo": true },
		{ "tipo": "cartao_debito", "label": "Cartão de Débito", "ativo": true },
		{ "tipo": "vale_refeicao", "label": "Vale Refeição", "ativo": false },
		{ "tipo": "vale_alimentacao", "label": "Vale Alimentação", "ativo": false }
	],
	"taxa_entrega_padrao": 5.0,
	"pedido_minimo": 20.0,
	"taxa_entrega_gratis_acima": 50.0,
	"tempo_estimado_entrega": 45,
	"tempo_estimado_retirada": 20,
	"troco_maximo": 100.0,
	"som_notificacao": true,
	"imprimir_automatico": false
}
```

## JSONB: `config_tema`

```json
{
	"cor_primaria": "#F97316",
	"cor_secundaria": "#1e293b",
	"cor_fundo": "#ffffff",
	"cor_texto": "#1e293b"
}
```

## JSONB: `redes_sociais`

Chaves pré-definidas — todas opcionais. Novas plataformas são adicionadas sem migration.

```json
{
	"instagram": "@pizzariadamaria",
	"facebook": "pizzariadamaria",
	"tiktok": "@pizzariadamaria",
	"twitter": "@pizzariadamaria",
	"youtube": "UCxxxxxxxxxxxxxx",
	"ifood": "https://ifood.com.br/delivery/...",
	"site_url": "https://pizzariadamaria.com.br"
}
```

> `instagram`, `facebook` e `tiktok` aceitam apenas o **handle** (sem URL) — o frontend monta o link completo. `ifood` e `site_url` aceitam URL completa.

## JSONB: `setup_status`

```json
{
	"info_basica": false,
	"contato": false,
	"endereco": false,
	"horarios": false,
	"pagamentos": false,
	"catalogo": false
}
```

---

## Regras de Negócio

- `slug` da loja matriz é único globalmente e sempre espelha `empresas.slug`
- `slug` das filiais é único por empresa
- Apenas uma loja por empresa pode ter `is_matriz = true`
- A loja matriz sempre é criada já com seu `status = 'ativo'` pela RPC de integração. Lojas filiais adicionais feitas depois pelo painel sempre nascerão como `rascunho`.
- Loja com `status = 'rascunho'` ou `status = 'inativo'` não exibe cardápio público
- `aberto = false` exibe o cardápio mas bloqueia novos pedidos
- `forcar_fechado = true` fecha imediatamente, ignorando `horario_funcionamento`
- O campo `aberto` **nunca é escrito diretamente** — é atualizado pelo job/middleware do servidor
- O número de lojas por empresa não pode ultrapassar o limite do plano

---

## Relacionamentos

```
empresas (N:1)
  └── lojas
        ├── perfis (1:N) — admin_loja, gerente_loja, staff_loja, entregador
        ├── categorias (1:N)
        ├── produtos (1:N)
        ├── pedidos (1:N)
        ├── clientes (1:N)
        ├── cupons (1:N)
        └── banners (1:N)
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                              |
| ---------------- | ------------------------------------------- |
| `admin_master`   | Todas as lojas                              |
| `gerente_master` | Todas as lojas                              |
| `admin_loja`     | Lojas da sua empresa                        |
| `gerente_loja`   | Apenas a própria loja (`loja_id` do perfil) |
| `staff_loja`     | Apenas a própria loja (leitura limitada)    |
| `entregador`     | Apenas a própria loja (leitura limitada)    |

### Políticas

| Nome da Política                          | Operação | Descrição                                                   |
| ----------------------------------------- | -------- | ----------------------------------------------------------- |
| `admin_master_pode_visualizar_lojas`      | SELECT   | Master e Gerente Master veem todas as lojas ativas          |
| `admin_loja_pode_visualizar_suas_lojas`   | SELECT   | Admin Loja vê lojas da sua empresa                          |
| `equipe_loja_pode_visualizar_da_sua_loja` | SELECT   | Gerente/Staff/Entregador veem apenas a própria loja         |
| `publico_pode_visualizar_lojas_ativas`    | SELECT   | Acesso público para lojas com `status = 'ativo'` (cardápio) |

---

## Funções RPC

| Nome da Função                           | Quem pode chamar             | Descrição                                                  |
| ---------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `fn_rpc_criar_loja`                      | admin_master, admin_loja     | Cria nova loja validando limite do plano                   |
| `fn_rpc_atualizar_loja`                  | admin_loja, admin_master     | Atualiza dados da loja                                     |
| `fn_rpc_atualizar_status_loja`           | admin_master                 | Ativa, suspende ou arquiva uma loja                        |
| `fn_rpc_atualizar_horario_funcionamento` | admin_loja, gerente_loja     | Atualiza horários de funcionamento                         |
| `fn_rpc_atualizar_config_geral`          | admin_loja, gerente_loja     | Atualiza configurações operacionais                        |
| `fn_rpc_atualizar_config_tema`           | admin_loja, gerente_loja     | Atualiza cores do tema                                     |
| `fn_rpc_atualizar_setup_status`          | admin_loja                   | Atualiza progresso do onboarding                           |
| `fn_rpc_toggle_forcar_fechado`           | admin_loja, gerente_loja     | Alterna `forcar_fechado` (toggle aberto/fechado do header) |
| `fn_rpc_buscar_loja_por_slug`            | Público (anon)               | Retorna dados públicos pelo slug (cardápio)                |
| `fn_rpc_buscar_loja_por_dominio`         | Público (anon)               | Retorna dados públicos pelo domínio personalizado          |
| `fn_rpc_listar_lojas_com_empresa`        | admin_master, gerente_master | Lista lojas com dados da empresa pai e paginação           |
| `fn_rpc_listar_minhas_lojas`             | admin_loja                   | Lista lojas da própria empresa                             |

---

## Server Routes (Nitro)

| Route                                   | Método | Quem pode chamar | Operações Auth Admin                  | Descrição                                                          |
| --------------------------------------- | ------ | ---------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `server/api/admin/lojas/[id].delete.ts` | DELETE | admin_master     | `auth.admin.deleteUser()` (múltiplos) | Hard delete completo da loja e de todos os seus membros exclusivos |
