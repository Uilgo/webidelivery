# 🧪 Conta de Demonstração Pública — Admin Loja

> Dados para criação manual no painel do Supabase (Authentication + Table Editor).
> Siga a ordem: **1. Auth → 2. Empresa → 3. Loja → 4. Perfil**

---

## 1. Autenticação (`Authentication > Users > Add User`)

| Campo | Valor               |
| ----- | ------------------- |
| Email | `demo@delivery.com` |
| Senha | `Admin@123`         |

> Após criar, copie o **UUID** gerado — você vai precisar para a tabela `perfis`.

---

## 2. Empresa (`Table Editor > public.empresas`)

| Coluna                     | Valor                                 |
| -------------------------- | ------------------------------------- |
| `id`                       | _(gerado automaticamente pelo banco)_ |
| `nome`                     | `Sabor Total`                         |
| `slug`                     | `sabor-total`                         |
| `status`                   | `ativa`                               |
| `dominio_personalizado`    | `NULL`                                |
| `dominio_ssl_ativo`        | `false`                               |
| `configuracoes`            | `{}`                                  |
| `impersonation_cud_master` | `false`                               |
| `plano_id`                 | `NULL`                                |

> Após salvar, copie o **UUID** gerado — você vai precisar para a tabela `lojas` e `perfis`.

---

## 3. Loja (`Table Editor > public.lojas`)

| Coluna                  | Valor                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| `empresa_id`            | _(UUID da empresa "Sabor Total" criada acima)_                      |
| `is_matriz`             | `true`                                                              |
| `nome_estabelecimento`  | `Sabor Total — Lanchonete & Sorveteria`                             |
| `slug`                  | `sabor-total`                                                       |
| `status`                | `ativo`                                                             |
| `categoria`             | `lanchonete`                                                        |
| `descricao`             | `Pizzas, hambúrgueres, açaís, sorvetes, doces e salgados. Peça já!` |
| `telefone`              | `(11) 99999-0001`                                                   |
| `whatsapp`              | `5511999990001`                                                     |
| `email`                 | `contato@sabortotal.com.br`                                         |
| `endereco_rua`          | `Rua das Delícias`                                                  |
| `endereco_numero`       | `42`                                                                |
| `endereco_complemento`  | `Loja A`                                                            |
| `endereco_bairro`       | `Centro`                                                            |
| `endereco_cidade`       | `São Paulo`                                                         |
| `endereco_estado`       | `SP`                                                                |
| `endereco_cep`          | `01001-000`                                                         |
| `aberto`                | `true`                                                              |
| `forcar_fechado`        | `false`                                                             |
| `horario_funcionamento` | `{}`                                                                |
| `config_geral`          | `{}`                                                                |
| `config_tema`           | `{}`                                                                |
| `setup_status`          | `{}`                                                                |
| `redes_sociais`         | `{}`                                                                |

> Após salvar, copie o **UUID** gerado — você vai precisar para a tabela `perfis`.

---

## 4. Perfil (`Table Editor > public.perfis`)

| Coluna                    | Valor                                                                 |
| ------------------------- | --------------------------------------------------------------------- |
| `id`                      | _(UUID copiado do Auth — passo 1)_                                    |
| `role_id`                 | _(UUID da linha onde `slug = 'admin_loja'` na tabela `public.roles`)_ |
| `empresa_id`              | _(UUID da empresa "Sabor Total" — passo 2)_                           |
| `loja_id`                 | _(UUID da loja — passo 3)_                                            |
| `nome`                    | `Demo`                                                                |
| `sobrenome`               | `Lanchonete`                                                          |
| `email`                   | `demo@webidelivery.com.br`                                            |
| `telefone`                | `(11) 99999-0001`                                                     |
| `whatsapp`                | `5511999990001`                                                       |
| `is_demo`                 | `true`                                                                |
| `status`                  | `ativo`                                                               |
| `senha_temporaria`        | `false`                                                               |
| `preferencias`            | `{}`                                                                  |
| `permissoes_customizadas` | `NULL`                                                                |
| `avatar_url`              | `NULL`                                                                |
| `onboarding_status`       | `NULL`                                                                |

---

## ✅ Resumo Final para o Usuário Demo

| Item        | Valor                                                 |
| ----------- | ----------------------------------------------------- |
| **Email**   | `demo@delivery.com`                                   |
| **Senha**   | `Admin@123`                                           |
| **Cargo**   | `admin_loja`                                          |
| **Empresa** | `Sabor Total`                                         |
| **Loja**    | `Sabor Total — Lanchonete & Sorveteria`               |
| **Slug**    | `sabor-total`                                         |
| **is_demo** | `true` _(campo que identifica conta demo no sistema)_ |
