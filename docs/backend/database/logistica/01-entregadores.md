# Módulo Logística (Entregadores Locais)

Mantendo a promessa de **Zero Overengineering** e isolamento estrito.
Os entregadores não formam um marketplace global e complexo. Eles são "recursos de logística" de cada `loja_id`.
Um mesmo entregador João pode ter cadastro na Pizzaria A e na Hamburgueria B, existindo como duas entidades de `entregadores` completamente separadas nos bancos de dados de cada loja. Isso replica a elegância da nossa recém modelada tabela híbrida de `clientes`.

---

## 1. Tabela: `entregadores`

| Coluna             | Tipo    | Nullable | Default             | Descrição                                                                            |
| ------------------ | ------- | -------- | ------------------- | ------------------------------------------------------------------------------------ |
| `id`               | uuid    | NO       | `gen_random_uuid()` | PK                                                                                   |
| `loja_id`          | uuid    | NO       | —                   | FK estrita para a tabela de lojas.                                                   |
| `auth_user_id`     | uuid    | YES      | —                   | Vincula ao UUID do Supabase Auth para motoboys que logarem no app PWA do entregador. |
| `email`            | text    | YES      | —                   | Usado para invites ou pareamento de login.                                           |
| `telefone`         | text    | NO       | —                   | Essencial para disparo de WhatsApp e contato do Gerente.                             |
| `cpf`              | text    | YES      | —                   | Campo preparado para futura trava fiscal. Nulo no MVP (Fricção Zero).                |
| `nome_completo`    | text    | NO       | —                   | Nome de exibição na loja.                                                            |
| `perfil_logistico` | jsonb   | NO       | `{}`                | Dados voláteis não relacionais (ex: Placa da Moto, CNH, Cor).                        |
| `status_trabalho`  | text    | NO       | `'offline'`         | Valores esperados: `offline`, `disponivel`, `ocupado_em_corrida`.                    |
| `ativo`            | boolean | NO       | `true`              | Se desativado, o gerente cortou esse motoqueiro da loja.                             |

**Índices & Restrições:**

- `UNIQUE (loja_id, email)` - Garante unicidade por loja (igual fizemos em Clientes).
- `UNIQUE (loja_id, auth_user_id)` - Garante que o usuário logado só possui 1 conta de entregador naquela loja.

---

## JSONB: `perfil_logistico`

Para não criar colunas engessadas na tabela (banco de dados), a CNH, a Placa, e o Veículo moram todos num payload JSON flexível. Se no futuro um motoboy começar a entregar de Patinete ou Drone, você não precisa alterar o banco. O telefone saiu do JSON para ser uma coluna fixa nativa para ligações rápidas e disparos automatizados de WhatsApp!.

```json
{
	"tipo_veiculo": "moto",
	"placa": "ABC-1234",
	"modelo": "Honda CG 160",
	"cnh": "01234567890",
	"cor_veiculo": "Vermelha",
	"conta_bancaria": {
		"tipo": "pix",
		"chave": "123.456.789-00"
	}
}
```

---

## 2. As RPCs Dinâmicas (Atreladas a tabela `pedidos`)

Para permitir concorrência justa (o famoso "dedo mais rápido pega a corrida") sem falhas, as funções de logistica tocam no coração da tabela mãe `pedidos` travando as linhas sob transação (SECURITY DEFINER).

### A. `fn_rpc_assumir_entrega(p_pedido_id)`

- **Mecânica:** O sistema roda um `SELECT ... FOR UPDATE` no pedido. Se a chave `logistica->'entregador_id'` for nula e o status for "pronto", acopla o UUID do entregador ali dentro.
- **Resultado:** O Pedido vai para o estado `em_rota_entrega`. Outros entregadores olhando a tela recebem "Este pedido não está mais disponível" pelas próprias queries, já que ele sumiu do pool. Insere `pedido_historico` automático com "João assumiu a entrega".

### B. `fn_rpc_abandonar_entrega(p_pedido_id, p_motivo_jsonb)`

- **A Peça Chave Anti-Fricção!** O pneu furou ou o cara bateu a moto. Ele clica em cancelar no PWA.
- **Mecânica:** O RPC volta a chave `logistica->'entregador_id'` para `null`. O `estado_atual` volta magicamente para `"pronto"`, fazendo o card brotar ou pingar de novo na tela dos outros motoqueiros logados.
- **Auditoria:** Lança uma row no `pedido_historico` guardando o Timestamp e o motivo exato de abandono do entregador João.

### C. `fn_rpc_finalizar_entrega(p_pedido_id)`

- O entregador sinaliza que apertou a campainha e o cliente pegou. RPC converte para "concluido", tranca a row em transação, lança a última nota na timeline de `pedido_historico`.

---

## RLS (Row Level Security Padrão)

Apoiando sua decisão visionária: Sem Supabase Realtime! Usaremos sockets HTTP do provedor que você escolher acoplados no Backend Node/Edge, que puxa dados do Postgres da mesma forma via tokens JWT passados.

| Nome da Política                                | Operação | Descrição                                                                                                                  |
| ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `admin_master_pode_visualizar_entregadores`     | SELECT   | Master veem toda a rede                                                                                                    |
| `equipe_loja_pode_visualizar_entregadores`      | SELECT   | Visualiza/Aprova a listagem de motoboys vinculada ao `perfil.loja_id`.                                                     |
| `proprio_entregador_pode_visualizar_seus_dados` | SELECT   | Entregador logado filtra `WHERE auth.uid() = auth_user_id` em sua própria fileira para renderizar o Perfil Pessoal no App. |
