# Tabela: `perfis`

Perfis de usuários do sistema. Cada registro espelha um usuário do `auth.users` do Supabase e carrega todas as informações de identidade, cargo e contexto de acesso.

---

## Propósito

- Armazena dados complementares ao `auth.users` (que só guarda email/senha)
- Define o **cargo** do usuário via `role_id` e a qual tenant ele pertence (empresa + loja)
- Controla o status do onboarding (configuração inicial da loja)
- É a tabela central para todas as políticas RLS do sistema

---

## Colunas

| Coluna                    | Tipo        | Nullable | Default | Descrição                                                                                                                                               |
| ------------------------- | ----------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                      | uuid        | NO       | —       | PK — mesmo UUID do `auth.users` (não gerado aqui)                                                                                                       |
| `role_id`                 | uuid        | NO       | —       | FK → `roles.id` — cargo do usuário (define permissões e visibilidade)                                                                                   |
| `permissoes_customizadas` | jsonb       | YES      | `null`  | Permissões específicas deste usuário. Se `null`, herda o JSONB exato do cargo `roles`. Se preenchido, sobrepõe as permissões do cargo.                  |
| `empresa_id`              | uuid        | YES      | —       | FK → `empresas.id` — preenchido para cargos de loja. Todo `admin_loja` tem exatamente uma empresa, criada junto com a loja matriz no onboarding via RPC |
| `loja_id`                 | uuid        | YES      | —       | FK → `lojas.id` — preenchido para `admin_loja`, `gerente_loja`, `staff_loja`, `entregador`                                                              |
| `nome`                    | text        | NO       | —       | Primeiro nome                                                                                                                                           |
| `sobrenome`               | text        | NO       | —       | Sobrenome                                                                                                                                               |
| `email`                   | text        | NO       | —       | Email (espelho do `auth.users.email`, único)                                                                                                            |
| `avatar_url`              | text        | YES      | —       | URL do avatar no Storage                                                                                                                                |
| `telefone`                | text        | YES      | —       | Telefone no formato `+55 XX XXXXX-XXXX`                                                                                                                 |
| `whatsapp`                | text        | YES      | —       | WhatsApp no formato `+55 XX XXXXX-XXXX` — pode ser diferente do telefone fixo                                                                           |
| `is_demo`                 | boolean     | NO       | `false` | Conta de demonstração — bloqueia CUD no banco, operações ficam apenas no estado local                                                                   |
| `status`                  | text        | NO       | `ativo` | Status do usuário no sistema — `ativo`, `inativo`, `bloqueado`                                                                                          |
| `onboarding_status`       | text        | YES      | `null`  | Status da configuração inicial — apenas `admin_loja`. Demais cargos: `null`                                                                             |
| `senha_temporaria`        | boolean     | NO       | `false` | `true` quando a senha foi gerada pelo sistema (força troca no próximo login)                                                                            |
| `ultimo_acesso_em`        | timestamptz | YES      | —       | Atualizado a cada login bem-sucedido                                                                                                                    |
| `termos_aceitos_em`       | timestamptz | YES      | —       | Data/hora em que o usuário aceitou os Termos de Uso                                                                                                     |
| `privacidade_aceita_em`   | timestamptz | YES      | —       | Data/hora em que o usuário aceitou a Política de Privacidade                                                                                            |
| `preferencias`            | jsonb       | NO       | `{}`    | Preferências pessoais (tema, idioma, notificações)                                                                                                      |
| `created_at`              | timestamptz | NO       | `now()` | Data de criação                                                                                                                                         |
| `updated_at`              | timestamptz | NO       | `now()` | Atualizado automaticamente via trigger                                                                                                                  |

---

## Constraints

| Nome                     | Tipo   | Colunas / Referência                                                 |
| ------------------------ | ------ | -------------------------------------------------------------------- |
| `perfis_pkey`            | PK     | `id`                                                                 |
| `perfis_id_fkey`         | FK     | `id` → `auth.users(id)` ON DELETE CASCADE ON UPDATE NO ACTION        |
| `perfis_role_id_fkey`    | FK     | `role_id` → `roles(id)` ON DELETE RESTRICT ON UPDATE NO ACTION       |
| `perfis_empresa_id_fkey` | FK     | `empresa_id` → `empresas(id)` ON DELETE RESTRICT ON UPDATE NO ACTION |
| `perfis_loja_id_fkey`    | FK     | `loja_id` → `lojas(id)` ON DELETE RESTRICT ON UPDATE NO ACTION       |
| `perfis_email_key`       | UNIQUE | `email`                                                              |

> **Sobre `status` e `onboarding_status`**: Migrado para o universo Zod/Nuxt. Acompanha o standard evitando enrijecer perfis em banco (adições de sub-status como `bloqueado_pagamento` e `trial` não necessitam atualizações nas instâncias da API).

> **`perfis_id_fkey` (auth.users):** `ON DELETE CASCADE` — quando o Supabase Auth deleta o usuário (`auth.admin.deleteUser()`), o perfil é removido automaticamente em cascata. Este é o mecanismo central de deleção — a server route sempre parte do Auth, nunca deleta `perfis` diretamente.

> **FKs de negócio (roles, empresas, lojas):** `ON DELETE RESTRICT` — o banco bloqueia qualquer tentativa de deletar diretamente essas entidades enquanto houver perfis vinculados. Toda deleção de negócio é feita exclusivamente via server routes, nunca por RPC chamada do cliente.

---

## Índices

| Nome                    | Colunas      | Observação                                            |
| ----------------------- | ------------ | ----------------------------------------------------- |
| `perfis_pkey`           | `id`         | PK                                                    |
| `perfis_email_key`      | `email`      | UNIQUE                                                |
| `idx_perfis_role_id`    | `role_id`    | Filtros por tipo de usuário                           |
| `idx_perfis_empresa_id` | `empresa_id` | Busca de usuários por empresa                         |
| `idx_perfis_loja_id`    | `loja_id`    | Busca de usuários por loja                            |
| `idx_perfis_is_demo`    | `is_demo`    | WHERE is_demo = true — filtra contas demo rapidamente |

---

## JSONB: `preferencias`

Preferências pessoais do usuário. Não afetam regras de negócio — são apenas configurações de interface.

```json
{
	"timezone": "America/Sao_Paulo",
	"locale": "pt-BR",
	"currency": "BRL",
	"theme": "light",
	"notifications": {
		"email": true,
		"push": false,
		"sms": false
	}
}
```

---

## Metadados de Status para a UI

> [!NOTE]
> Os valores de `status` e `onboarding_status` são checados e retidos rigorosamente via **Zod/Server**. Os **metadados de exibição** (label em português, cor do badge, ícone) devem ser definidos como constantes da interface — sem JOIN, sem tabela extra, sem migration para alterar.

**O frontend deve criar constantes fixas mapeando cada status ao seu label, cor e ícone:**

| status / onboarding_status | Label sugerido          | Cor sugerida         | Ícone sugerido  |
| -------------------------- | ----------------------- | -------------------- | --------------- |
| `ativo`                    | Ativo                   | verde (`#22c55e`)    | `check-circle`  |
| `inativo`                  | Inativo                 | cinza (`#94a3b8`)    | `pause-circle`  |
| `bloqueado`                | Bloqueado               | vermelho (`#ef4444`) | `ban`           |
| `pendente`                 | Aguardando configuração | amarelo (`#f59e0b`)  | `clock`         |
| `em_progresso`             | Em progresso            | azul (`#3b82f6`)     | `loader-circle` |
| `concluido`                | Concluído               | verde (`#22c55e`)    | `circle-check`  |

**Por que não tabela relacional nem JSONB no banco:**

- `status` e `onboarding_status` são **estados de máquina** — suas transições estão hardcoded em RPCs, triggers e middleware de qualquer forma
- Adicionar um novo status sempre exige alterar código (RLS, lógica de negócio, telas) — a "flexibilidade" do banco seria ilusória
- Trocar label ou cor é feito em **uma linha de código**, sem migration e sem risco de regressão

---

## Regras de Vínculo — Cargo x Contexto

| Cargo (role)     | `empresa_id` | `loja_id`    |
| ---------------- | ------------ | ------------ |
| `admin_master`   | `null`       | `null`       |
| `gerente_master` | `null`       | `null`       |
| `admin_loja`     | preenchido   | preenchido ¹ |
| `gerente_loja`   | preenchido   | preenchido   |
| `staff_loja`     | preenchido   | preenchido   |
| `entregador`     | preenchido   | preenchido   |

¹ O `loja_id` do `admin_loja` aponta sempre para a **loja matriz**. Se o plano permitir múltiplas lojas, ele pode criar lojas adicionais — todas vinculadas à mesma `empresa_id`. O `loja_id` do perfil não muda.

---

## Conta Demo (`is_demo = true`)

A conta demo é uma conta fixa com email e senha públicos, exibida na landing page para que potenciais clientes possam explorar o painel antes de contratar.

**Comportamento:**

- `is_demo = true` → o composable `useDemoMode()` intercepta toda operação CUD no frontend
- Operações de criação, edição e exclusão são redirecionadas para o estado local em vez de chamar RPCs
- O banco permanece intacto — mesmo que alguém tente chamar uma RPC diretamente, a RPC verifica `is_demo` e rejeita

**Criação:**

- Criada manualmente pelo `admin_master` via painel ou diretamente no banco
- `is_demo = true` nunca pode ser definido via signup público

---

## Trigger: `on_auth_user_created`

Disparado automaticamente após cada INSERT em `auth.users`. Cria o registro correspondente em `perfis` com os dados enviados no `raw_user_meta_data` durante o signup.

**Campos preenchidos na criação:**

- `id` — mesmo UUID do `auth.users`
- `email` — espelho do `auth.users.email`
- `nome` e `sobrenome` — vindos do `raw_user_meta_data`
- `role_id` — UUID da role enviado no `raw_user_meta_data` (Pode ser `admin_loja` para donos de restaurante assinantes, ou `entregador` se for motoboy via self-signup).
- `onboarding_status` — definido como `'pendente'` se o cargo for `admin_loja`, `null` para os demais

**Campos não preenchidos no trigger** (preenchidos depois via onboarding/server route):

- `empresa_id` e `loja_id` — Se for `admin_loja`, criados no onboarding. Se for `entregador` em self-signup, o `loja_id` já deve vir do link/QR Code de indicação no `raw_user_meta_data`.
- `telefone`, `whatsapp`, `avatar_url` — editáveis pelo usuário após login

> **Regra de Self-Signup:** No signup público (`/cadastro`), só são permitidos dois cargos: `admin_loja` (donos) ou `entregador` (motoboys ativando cadastro via link da loja).
> Cargos internos (`gerente_loja` e `staff_loja`) **nunca** passam pelo signup público — são sempre criados internamente pelo painel do `admin_loja` (Server Route) gerando senha temporária.
> _Nota:_ O `admin_loja` também pode criar um `entregador` manualmente por dentro do painel, gerando senha temporária para ele mudar no primeiro login, ignorando o fluxo sem atrito de self-signup, caso prefira mais controle.

---

## Fluxo de Onboarding

O onboarding acontece em rota dedicada `/onboarding`. O middleware detecta `onboarding_status = 'pendente'` e redireciona — o usuário não acessa o painel enquanto não concluir.

**Transições de estado:**

| De             | Para           | Gatilho                                                      |
| -------------- | -------------- | ------------------------------------------------------------ |
| `pendente`     | `em_progresso` | Usuário salva qualquer campo no onboarding pela primeira vez |
| `em_progresso` | `concluido`    | Todos os campos obrigatórios foram salvos com sucesso        |

**Campos obrigatórios para `concluido`:**

| Campo                                 | Tabela  | Observação                                                            |
| ------------------------------------- | ------- | --------------------------------------------------------------------- |
| Nome da loja                          | `lojas` | `nome_estabelecimento IS NOT NULL AND nome_estabelecimento != ''`     |
| WhatsApp                              | `lojas` | `whatsapp IS NOT NULL AND whatsapp != ''`                             |
| Slug / URL                            | `lojas` | `slug IS NOT NULL AND slug != ''`                                     |
| Pelo menos 1 forma de pagamento ativa | `lojas` | `config_geral->'formas_pagamento'` com ao menos 1 item `ativo = true` |

---

## Deleção de Contas

> [!CAUTION]
> Não existe soft delete em `perfis` — o campo `status` (`inativo`, `bloqueado`) já cumpre o papel de bloquear acesso sem remover dados. A deleção é **permanente, irreversível e em cascata**. Só é permitida em dois cenários.

### Por que não há `deleted_at`

- `status = 'inativo'` bloqueia o acesso sem perder histórico
- `status = 'bloqueado'` suspende a conta por violação
- Deleção real é um evento raro e crítico — merece fluxo próprio, não um simples flag
- Ter `deleted_at` exigiria filtrar `WHERE deleted_at IS NULL` em toda query e toda RLS — complexidade sem benefício

---

### Cenário 1 — `admin_loja` deleta a própria conta (autodeleção)

O `admin_loja` decide encerrar a conta. A operação deleta **tudo** vinculado à empresa dele.

**Cascata completa:**

```
admin_loja (auth.users → perfis)
  └── empresa
        ├── lojas (todas)
        │     ├── perfis dos funcionários → auth.users de cada um
        │     ├── categorias, produtos, adicionais, combos
        │     ├── pedidos, pedido_itens
        │     ├── clientes
        │     ├── cupons, banners, promoções
        │     └── ... todos os dados da loja
        └── assinaturas, faturas
```

**Fluxo obrigatório de confirmação:**

```
1. admin_loja clica em "Encerrar minha conta"
2. Supabase RPC `fn_rpc_listar_preview_delecao` chamada pelo Frontend
   → retorna o resumo completo do que será deletado:
     {
       empresa: "Pizzaria da Maria",
       lojas: 3,
       funcionarios: 12,   // perfis que serão deletados do Auth
       pedidos: 847,
       clientes: 203
     }
3. Frontend exibe modal de confirmação com todos os dados acima
4. Usuário confirma a deleção utilizando os mecanismos de segurança do painel (ex: digitando a senha atual)
5. DELETE /api/perfil/encerrar-conta
   → valida credencial de segurança enviada no payload
   → deleta funcionários do Auth (auth.admin.deleteUser loop)
   → deleta admin_loja do Auth (auth.admin.deleteUser)
   → CASCADE no banco apaga tudo via FK
```

---

### Cenário 2 — `admin_master` deleta conta de um `admin_loja`

Mesmo fluxo de cascata, mas iniciado pelo Master (por violação, inadimplência, etc.).

**Fluxo:**

```text
1. admin_master acessa o painel de empresas
2. Clica em "Deletar empresa" de um cliente
3. Supabase RPC `fn_rpc_listar_preview_delecao` chamada pelo Frontend (painel do Master)
   → retorna o mesmo resumo de cascata
4. Master confirma utilizando o ID do usuário admin_loja e o ID da empresa (como segurança)
5. DELETE /api/admin/empresas/:empresa_id
   → recebe o `admin_loja_id` no payload para buscar e deletar a conta certa no Auth
   → mesmo processo de deleção em cascata
```

> Ambas as rotas são **exclusivas do servidor** — nunca via RPC. O Service Role Key do Supabase (usada nas server routes) é a única que pode chamar `auth.admin.deleteUser()` em múltiplos usuários.

---

## Relacionamentos

```
auth.users (Supabase Auth)
  └── perfis (1:1)
        ├── roles (N:1) — cargo do usuário
        ├── empresas (N:1)
        ├── lojas (N:1)
        └── perfil_permissoes (1:N) — overrides individuais
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                                  |
| ---------------- | ----------------------------------------------- |
| `admin_master`   | Todos os perfis + o próprio                     |
| `gerente_master` | Todos os perfis + o próprio                     |
| `admin_loja`     | Perfis com mesmo `empresa_id` + o próprio       |
| `gerente_loja`   | Perfis com mesmo `loja_id` + o próprio          |
| `staff_loja`     | **Apenas o próprio perfil** (`id = auth.uid()`) |
| `entregador`     | **Apenas o próprio perfil** (`id = auth.uid()`) |

> [!IMPORTANT]
> A política `usuario_pode_visualizar_proprio_perfil` é **obrigatória e universal** — sem ela, todo usuário recebe erro 403 imediatamente após o login, já que a primeira operação do app é buscar o próprio perfil.

> Toda operação de **escrita** (INSERT / UPDATE / DELETE) em `perfis` ocorre exclusivamente via **server routes** (`server/api/`) com token de sessão validado no servidor. Nunca via RPC chamada do cliente.

### Políticas

| Nome da Política                         | Operação | FOR (roles)   | USING                                             | Descrição                                           |
| ---------------------------------------- | -------- | ------------- | ------------------------------------------------- | --------------------------------------------------- |
| `usuario_pode_visualizar_proprio_perfil` | SELECT   | authenticated | `id = auth.uid()`                                 | **Universal** — qualquer cargo vê o próprio perfil  |
| `admin_master_pode_visualizar_perfis`    | SELECT   | authenticated | `role.slug IN ('admin_master', 'gerente_master')` | Master e Gerente Master veem todos os perfis ativos |
| `admin_loja_pode_visualizar_perfis`      | SELECT   | authenticated | `empresa_id = perfil_empresa_id()`                | Admin Loja vê perfis com mesmo `empresa_id`         |
| `gerente_loja_pode_visualizar_perfis`    | SELECT   | authenticated | `loja_id = perfil_loja_id()`                      | Gerente Loja vê perfis com mesmo `loja_id`          |

> **`staff_loja` e `entregador` não possuem política própria.** Eles são totalmente cobertos pela política universal `usuario_pode_visualizar_proprio_perfil` (`id = auth.uid()`), pois **não têm visibilidade além do próprio perfil**. As demais políticas acima apenas expandem o que certos cargos podem enxergar — `staff_loja` e `entregador` não têm essa expansão, então nenhuma política adicional deve ser criada para eles.

---

## Funções RPC

> [!WARNING]
> Algumas operações críticas na tabela `perfis` (como deleções em cascata e criação/alteração de senhas) ocorrem via **Server Routes**. No entanto, **operações de leitura, verificações públicas simples e escritas não-críticas** (como atualizar progresso de onboarding ou data de último acesso) devem ser tratadas via RPC no banco de dados para garantir alta performance e acesso direto pelo Supabase Client.

| Nome da Função                       | Quem pode chamar             | Descrição                                                                              |
| ------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------- |
| `fn_rpc_atualizar_onboarding_status` | admin_loja                   | Atualiza progresso do onboarding (ex: de `pendente` para `em_progresso`)               |
| `fn_rpc_registrar_ultimo_acesso`     | trigger / middleware ou auth | Atualiza `ultimo_acesso_em` a cada login bem-sucedido                                  |
| `fn_rpc_verificar_email_disponivel`  | anon (público)               | Verifica se um email já está cadastrado (para step 1 do signup) — leitura rápida       |
| `fn_rpc_listar_preview_delecao`      | admin_loja, admin_master     | Retorna resumo de cascata (qtd. de lojas, pedidos, etc.) antes da deleção — leitura    |
| `fn_rpc_listar_membros_equipe`       | admin_loja+, admin_master    | Lista membros com filtros e paginação aplicados à view do admin — leitura              |
| `fn_rpc_atualizar_preferencias`      | Próprio (authenticated)      | Salva temas e preferências de interface no campo JSONB `preferencias`                  |
| `fn_rpc_atualizar_perfil`            | Próprio (authenticated)      | Atualiza dados públicos não-críticos da tabela perfis (nome, WhatsApp, avatar)         |
| `fn_rpc_aceitar_termos`              | Próprio (authenticated)      | Registra a aceitação obrigatória de termos e privacidade (`termos_aceitos_em = now()`) |

> [!IMPORTANT]
> **Padrão de Segurança Obrigatório**
> Absolutamente todas as funções RPC (`CREATE FUNCTION`) neste sistema devem impreterivelmente utilizar as seguintes práticas de defesa:
>
> 1. **`SECURITY DEFINER`**: Quando aplicável para elevar escopo temporariamente (ex: permitir consulta de email vazio via client `/anon`), sempre garantindo validações de contexto interno (como checar o JWT `auth.uid()`).
> 2. **`SET search_path = ''`**: Obrigatório em _todas_ as funções `SECURITY DEFINER` para blindar contra injeção de schema/função ou ataques de elevação de privilégios.
> 3. **Uso de `COALESCE()` em Updates**: Quando a RPC for de alteração (como `onboarding_status`), blindar os inputs com `COALESCE` para impedir atualização predatória para nulo nos campos críticos, ou para lidar com dados legados sem estourar quebra de tipagem no PostgreSQL.
> 4. **Tipagem e Cast Específico**: Tratar os retornos dos parâmetros diretamente no cabeçalho antes de injetar nas PL/pgSQL clauses.

---

## Server Routes (Nitro)

> Nota geral: A tabela `perfis` em si é atualizada pelo frontend dinamicamente via RPCs/PostgREST. Rotas de servidor são reservadas **estritamente** para modificações de credenciais sensíveis (que manipulam o Supabase `auth.users`), escalação de privilégios ou operações destrutivas pesadas. Não existem rotas de leitura (GET) nesta camada.

| Route                                                 | Método | Quem pode chamar         | Operações Auth Admin                  | Descrição                                                                               |
| ----------------------------------------------------- | ------ | ------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------- |
| `server/api/perfil/credenciais.put.ts`                | PUT    | Próprio (authenticated)  | Atualização restrita via API          | Muta a conta no Supabase Auth: atualiza exclusivamente o email de login e/ou senha      |
| `server/api/perfil/encerrar-conta.delete.ts`          | DELETE | admin_loja (autenticado) | `auth.admin.deleteUser()`             | Autodeleção total da conta e empresa vinculada (requer confirmação/senha)               |
| `server/api/admin/membros/index.post.ts`              | POST   | admin_master, admin_loja | `auth.admin.createUser()`             | Cria novo membro — valida que o cargo alvo está dentro do escopo do admin               |
| `server/api/admin/membros/[id].put.ts`                | PUT    | admin_master, admin_loja | `auth.admin.updateUserById()`         | Atualiza credenciais do membro e gerencia desativações do Auth — dentro do escopo       |
| `server/api/admin/membros/[id].delete.ts`             | DELETE | admin_master, admin_loja | `auth.admin.deleteUser()`             | Hard delete do membro (Auth + PostgreSQL) — alvo estritamente dentro do escopo do admin |
| `server/api/admin/membros/[id]/resetar-senha.post.ts` | POST   | admin_master, admin_loja | `auth.admin.generateLink()`           | Gera senha temporária/link e força troca no próximo login                               |
| `server/api/admin/empresas/[id].delete.ts`            | DELETE | admin_master             | `auth.admin.deleteUser()` (múltiplos) | Hard delete total da empresa, extinguindo usuários primeiro p/ ativar cascata de lojas  |

> Nota sobre Hierarquias: As rotas de membros respeitam estritamente os níveis de cargo (ex: admin tem nível 3, não pode editar ou excluir ninguém de nível 1 a 3, apenas 4 em diante).
