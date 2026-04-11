# Tabela: `lgpd_consentimentos`

Registro de consentimentos LGPD dos usuários. Cada aceite de termos, política ou permissão de marketing gera um registro imutável com IP e user_agent.

---

## Propósito

- Comprova legalmente que o usuário aceitou os termos de uso e política de privacidade
- Armazena IP e user_agent no momento do aceite — prova crítica em disputes (chargebacks)
- Registra a versão exata do documento aceito — permite rastrear mudanças nos termos
- Registro imutável append-only — revogação é um novo INSERT com `aceito = false`
- Cobre os requisitos do Art. 7º e Art. 8º da LGPD (consentimento livre, informado e inequívoco)

---

## Colunas

| Coluna       | Tipo        | Nullable | Default             | Descrição                                                                    |
| ------------ | ----------- | -------- | ------------------- | ---------------------------------------------------------------------------- |
| `id`         | uuid        | NO       | `gen_random_uuid()` | PK                                                                           |
| `perfil_id`  | uuid        | NO       | —                   | FK → `perfis.id` — usuário que consentiu                                     |
| `tipo`       | text        | NO       | —                   | Tipo do consentimento — ver valores válidos abaixo                           |
| `versao`     | text        | NO       | —                   | Versão do documento aceito (ex: `v1.0`, `v2.1`) — deve bater com o publicado |
| `aceito`     | boolean     | NO       | —                   | `true` = aceitou / `false` = revogou                                         |
| `ip_address` | text        | NO       | —                   | IP no momento do aceite — obrigatório, coletado no servidor Nuxt             |
| `user_agent` | text        | NO       | —                   | User-Agent — prova de dispositivo/navegador em disputes                      |
| `created_at` | timestamptz | NO       | `now()`             | Data/hora exata do consentimento — imutável                                  |

> Sem `updated_at` e sem `deleted_at` — registro imutável, append-only.  
> Para revogar um consentimento, insere novo registro com `aceito = false`.

---

## Constraints

| Nome                              | Tipo  | Colunas / Referência                                                                                                |
| --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| `lgpd_consentimentos_pkey`        | PK    | `id`                                                                                                                |
| `lgpd_consentimentos_perfil_fkey` | FK    | `perfil_id` → `perfis(id)` ON DELETE CASCADE                                                                        |
| `check_lgpd_consentimentos_tipo`  | CHECK | `tipo IN ('termos_uso', 'politica_privacidade', 'marketing_email', 'marketing_whatsapp', 'compartilhamento_dados')` |

---

## Índices

| Nome                                  | Colunas                              | Observação                                   |
| ------------------------------------- | ------------------------------------ | -------------------------------------------- |
| `lgpd_consentimentos_pkey`            | `id`                                 | PK                                           |
| `idx_lgpd_consentimentos_perfil_id`   | `perfil_id`                          | Busca de consentimentos por usuário          |
| `idx_lgpd_consentimentos_tipo`        | `tipo`                               | Filtro por tipo                              |
| `idx_lgpd_consentimentos_created_at`  | `created_at DESC`                    | Ordenação cronológica                        |
| `idx_lgpd_consentimentos_perfil_tipo` | `(perfil_id, tipo, created_at DESC)` | Busca do consentimento mais recente por tipo |

---

## Valores de `tipo`

| Valor                    | Quando é registrado                                  |
| ------------------------ | ---------------------------------------------------- |
| `termos_uso`             | Ao criar conta ou ao aceitar nova versão dos termos  |
| `politica_privacidade`   | Ao criar conta ou ao aceitar nova versão da política |
| `marketing_email`        | Ao optar por receber comunicações por e-mail         |
| `marketing_whatsapp`     | Ao optar por receber comunicações por WhatsApp       |
| `compartilhamento_dados` | Ao autorizar compartilhamento de dados com parceiros |

---

## Como consultar o consentimento atual

O consentimento vigente é sempre o registro mais recente por `(perfil_id, tipo)`:

```sql
SELECT DISTINCT ON (perfil_id, tipo)
  perfil_id, tipo, versao, aceito, ip_address, created_at
FROM lgpd_consentimentos
WHERE perfil_id = $1
ORDER BY perfil_id, tipo, created_at DESC;
```

---

## Fluxo de Aceite (Signup)

```
1. Usuário preenche formulário de cadastro
2. Marca checkbox "Aceito os Termos de Uso e Política de Privacidade"
3. Servidor Nuxt coleta ip_address e user_agent do request
4. RPC insere registro com aceito = true
5. perfis.termos_aceitos_em e perfis.privacidade_aceita_em são atualizados
```

> `ip_address` e `user_agent` são coletados no servidor (Nuxt), **nunca no frontend** — evita adulteração.

---

## Fluxo de Nova Versão dos Termos

```
1. Admin Master publica nova versão dos termos (ex: v2.0)
2. Sistema detecta usuários com versão desatualizada
3. Na próxima sessão, exibe modal obrigatório de aceite
4. Usuário aceita → novo registro com versao = 'v2.0'
5. Usuário recusa → logout forçado
```

---

## Uso em Disputes (Chargebacks)

| Campo           | Valor como prova                                                     |
| --------------- | -------------------------------------------------------------------- |
| `ip_address`    | Prova que o aceite veio do mesmo IP do cliente                       |
| `user_agent`    | Prova de dispositivo/navegador — dificulta alegação de fraude        |
| `versao`        | Prova que o cliente aceitou os termos que cobrem cobrança recorrente |
| `created_at`    | Prova de quando aceitou — antes da primeira cobrança                 |
| `aceito = true` | Prova de consentimento explícito                                     |

---

## Regras de Negócio

- `ip_address` e `user_agent` são **obrigatórios** — coletados no servidor Nuxt, nunca no frontend
- Registro é **imutável** — nunca atualizado. Revogação = novo registro com `aceito = false`
- O consentimento vigente é sempre o mais recente por `(perfil_id, tipo)`
- `termos_uso` e `politica_privacidade` são obrigatórios no signup — sem eles o cadastro não é concluído
- `marketing_email` e `marketing_whatsapp` são opcionais — opt-in voluntário
- Ao publicar nova versão dos termos, todos os usuários precisam reaceitar antes do próximo login

---

## Relacionamentos

```
perfis (N:1)
  └── lgpd_consentimentos (append-only)
```

---

## RLS (Row Level Security)

| Cargo            | O que pode ver                    |
| ---------------- | --------------------------------- |
| `admin_master`   | Todos os consentimentos           |
| `gerente_master` | Todos os consentimentos           |
| `admin_loja`     | Apenas os próprios consentimentos |
| demais cargos    | Apenas os próprios consentimentos |

> Apenas INSERT via **RPC com SECURITY DEFINER** — nunca UPDATE ou DELETE.

### Políticas

| Nome da Política              | Operação | Descrição                                                                       |
| ----------------------------- | -------- | ------------------------------------------------------------------------------- |
| `lgpd_consent_select_master`  | SELECT   | Master e Gerente Master veem todos os consentimentos                            |
| `lgpd_consent_select_proprio` | SELECT   | Demais cargos veem apenas os próprios consentimentos (`perfil_id = auth.uid()`) |

---

## Funções RPC

> Todas as funções usam `SECURITY DEFINER`. A função `fn_rpc_registrar_consentimento` é chamada pelo servidor Nuxt — nunca pelo cliente — garantindo que `ip_address` e `user_agent` sejam coletados server-side.

| Nome da Função                             | Quem pode chamar       | Função                                                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fn_rpc_registrar_consentimento`           | Sistema (Nuxt)         | Insere registro de aceite. Chamada pelo servidor — `ip_address` e `user_agent` são extraídos do request server-side. Valida que `tipo` é um valor permitido e que `versao` está preenchida. Executa em transação única |
| `fn_rpc_revogar_consentimento`             | Próprio usuário        | Insere novo registro com `aceito = false` para o `tipo` informado. Valida que `perfil_id = auth.uid()` — usuário só revoga o próprio consentimento                                                                     |
| `fn_rpc_buscar_consentimento_atual`        | Próprio usuário, admin | Retorna o consentimento mais recente por `(perfil_id, tipo)` usando `DISTINCT ON`. Admin Master pode consultar qualquer `perfil_id`. Usuário comum só consulta o próprio                                               |
| `fn_rpc_listar_usuarios_sem_consentimento` | admin_master           | Retorna perfis sem registro `aceito = true` para uma `versao` específica de um `tipo` — identifica quem precisa reaceitar após nova versão dos termos. Valida cargo `admin_master`. Suporta paginação                  |
