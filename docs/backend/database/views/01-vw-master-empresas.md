# View: `vw_master_empresas`

Uma visão SQL consolidada e dinâmica (`CREATE VIEW` padrão) para uso exclusivo do painel de administração global (`admin_master`). Puxa informações vitais cruzadas do módulo _Core_ e do módulo _Finanças_ para retornar uma listagem puramente plana (flat), ideal para os componentes de tabela (`DataTable`) no Frontend.

---

## Propósito

- Evitar que o Frontend Nuxt precise cruzar múltiplas sub-queries no PostgREST para montar o "Card de Gestão" do lógista.
- Resolver a modelagem inversa de propriedade: Como a `empresas` não possui a coluna `owner_id`, a view encontra ativamente quem é o primeiro `admin_loja` atrelado aquela empresa em `perfis` e fixa ele como o "Dono da Conta".
- Compilar o número total de lojas que a empresa tem atualmente.
- Agregar o status financeiro num único fôlego para fácil filtro na tela do Painel Administrativo.

---

## Colunas (Output)

| Coluna              | Tipo        | Origem (Join)             | Descrição                                                    |
| ------------------- | ----------- | ------------------------- | ------------------------------------------------------------ |
| `empresa_id`        | uuid        | `empresas.id`             | ID base do Tenant                                            |
| `nome_fantasia`     | text        | `empresas.nome_fantasia`  | Nome comercial do negócio                                    |
| `cnpj`              | text        | `empresas.cnpj`           | CNPJ para buscas de auditoria                                |
| `empresa_status`    | text        | `empresas.status`         | Status global do tenant (ex: suspensa, ativa)                |
| `dono_id`           | uuid        | `perfis.id`               | ID do perfil dono da conta (`role = admin_loja`)             |
| `dono_nome`         | text        | `perfis.nome + sobrenome` | Nome completo do proprietário para o CRM Master              |
| `dono_email`        | text        | `perfis.email`            | Contato direto via e-mail                                    |
| `dono_whatsapp`     | text        | `perfis.whatsapp`         | WhatsApp associado ao criador da conta                       |
| `lojas_qtd`         | integer     | `COUNT(lojas.id)`         | Número total de Lojas filiais atreladas a esta empresa       |
| `plano_nome`        | text        | `planos.nome`             | Qual plano essa empresa está neste momento?                  |
| `assinatura_status` | text        | `assinaturas.status`      | Flag financeiro: `trial`, `ativa`, `atrasada`, `cancelada`   |
| `renova_em`         | timestamptz | `assinaturas.renova_em`   | Data limite de operação antes do Middleware aplicar bloqueio |

---

## RLS (Row Level Security)

Views convencionais no Postgres ignoram as políticas de RLS e são executadas utilizando as permissões do ser que instanciou a View (`definer`). Para manter a blindagem do nosso banco Supabase, esta **não** deve ser uma Security Definer, ou o Master deve ser restrito rigidamente.

Padrão de Criação Obrigatório:

> Deverá ser gerada como `CREATE VIEW vw_master_empresas WITH (security_invoker = true)`

Políticas de Visualização de View:

- O acesso a esta View é bloqueado para qualquer cargo que não seja estritamente `admin_master` ou `gerente_master`.

| Cargo                             | O que pode ver          |
| --------------------------------- | ----------------------- |
| `admin_master` / `gerente_master` | Select Irrestrito       |
| Demais Usuários e Anônimos        | Bloqueados inteiramente |

---

## Consumo no PostgREST / Nuxt

Para acessar essa prateleira de dados, o backend Node ou o Client Nuxt apenas invoca uma seleção simples com paginação:

```typescript
const { data: empresados } = await supabase
	.from("vw_master_empresas")
	.select("*")
	.eq("assinatura_status", "atrasada") // Permite filtros simples numa view plana!
	.range(0, 19); // Paginação perfeita e sem peso de Join.
```
