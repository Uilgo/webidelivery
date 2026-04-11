# Fluxo PLG Completo: Jornada do Cliente (`admin_loja`)

Este documento detalha a jornada fim a fim do cliente, desde a captura na Landing Page até o bloqueio e pagamento da mensalidade, consolidando as regras estabelecidas nas tabelas de `core` e `assinaturas`.

---

## 1. Landing Page → Clique no Plano

A conversão inicial não exige nenhum dado sensível.

- Quando o usuário clica em "Começar grátis" (ou similar) em um plano na sua Landing Page, o `plano_id` escolhido é temporariamente salvo.
- **Implementação:** Salvar no `localStorage` ou como _query param_ na URL (ex: `/signup?plano=uuid-do-plano`).
- Nenhum dado de pagamento é solicitado neste momento.

---

## 2. Signup (Sem burocracia)

- Na tela de cadastro, o usuário fornece **apenas Nome, Email e Senha**.
- O **Supabase Auth** gerencia a criação em `auth.users`.
- Uma _Trigger_ no banco cria a linha em `perfis`:
  - `role`: `'admin_loja'`
  - `onboarding_status`: `'pendente'`
- **Ponto Chave:** Nenhuma empresa, loja ou assinatura existe ainda. Estão todos nulos no perfil do recém-chegado.
- **Middleware:** Detecta que o perfil logado tem status `'pendente'` e bloqueia acesso ao dashboard, forçando o redirecionamento incondicional para a rota `/admin/onboarding`.

---

## 3. Onboarding Wizard (A Ativação)

O lojista preenche num fluxo passo-a-passo os dados mínimos para a plataforma ter vida.

- **Passo 1:** Nome do estabelecimento e Slug.
  - _Em tempo real_, a API consulta `fn_rpc_verificar_slug_disponivel` para evitar duplicidade.
- **Passos Seguintes:** WhatsApp, segmento/categoria, ativação de pelo menos uma forma de pagamento.

Ao finalizar o wizard, o frontend invoca a transação principal do sistema: **`fn_rpc_criar_empresa_onboarding`**, enviando os dados da loja recém-preenchidos, o `plano_id` e o `ciclo` (ex: `mensal`, `anual`) selecionados na Landing Page.

**O que essa RPC Atômica faz internamente:**

1. Cria a `empresas`.
2. Cria a matriz em `lojas` (linkada a empresa).
3. Cria a `assinaturas` (linkando empresa ao plano escolhido e cravando o `ciclo` na base):
   - Definindo o `status` mágico como **'trial'**.
   - Calculando o prazo como `renova_em = timezone('utc', now()) + interval '7 days'`.
   - Cita a marca oficial de cobrança ali pra começar como `gateway_provider = 'manual'`.
4. Atualiza o `perfis` principal daquele usuário com:
   - Os UUIDs recém-criados de `empresa_id` e `loja_id`.
   - Sobe o `onboarding_status` de 'pendente' para **'concluido'**.

O Cliente é imediatamente redirecionado para `/admin/dashboard` e sua loja está live.

---

## 4. O Período de Trial

Os próximos 7 dias são um test drive completo do software.

- Ele usa 100% dos relatórios, envia e recebe pedidos, etc.
- Componente de Topbar: Aconselha-se ter um alerta visual no header (ex: amarelo) avisando: _"Você possui X dias de teste grátis"_ com um botão direto apontando para a rota de Pagamento.
- **Neste momento:** A cada F5 e navegação de rotas, o Middleware observa que a data dele no `renova_em` ainda não bateu no nosso tempo `now()`.

---

## 5. Fim da Festa: O Bloqueio do Inadimplente

Passadas exatas as horas do banco, quando o código de Middleware observar que as colunas mudaram e `renova_em` ficou menor que a data de agora (`renova_em < now()`), ele engatilha o modo "Hard Block".

- Nenhuma tela da área administrativa carrega, forçando o _redirect_ para `/admin/billing`.
- Uma Server Route (rodando via Worker externo no servidor Node, ou acionada no próprio acesso do lojista à tela de billing) extrai dinamicamente o valor do plano.
- Cria uma nova linha transacional em `faturas` na cor vermelha/aguardando (`status = 'pendente'`).

> _Nota:_ A loja do cliente (o Cardápio pro público consumidor dele acessar) também pode ser derrubada ou pausada dependendo de como você quiser arquitetar a view do catálogo. O comum é botar a loja inteira em "Pausada".

---

## 6. Fluxo MVP de Liberação (Gateway "Manual" - PIX do Master)

Como o app ainda não tem os Webhooks automáticos implementados pro Dia 1:

1. Na tela de Billing, o sistema desenha a Logo Oficial da Webidelivery (seu Pix estático em QR Code) e o valor da fatura pendente.
2. **Troca de Plano ou Ciclo (Opcional):** Se o usuário quiser escolher um plano melhor ou rever periodicidade (ex: Mensal p/ Anual) antes de pagar, a tela exibirá "Mudar Plano".
   - Ao escolher o novo modelo, o frontend chama `/api/assinaturas/me/plano.put.ts`.
   - O servidor atualiza `assinaturas.plano_id` e/ou `assinaturas.ciclo`.
   - O servidor **cancela a fatura pendente antiga** e **gera uma nova fatura pendente** com o valor do novo plano/ciclo lido do JSON.
   - A tela de billing recarrega mostrando o novo valor.
3. O lojista pega o próprio app do banco e transfere o valor cobrado.
4. Na própria tela tem um botão Upload "Enviar Comprovante". Ele aciona a Server Route protegida `/api/faturas/comprovante.post.ts`.
5. Essa rota envia a imagem de Print para o Supabase Storage e salva apenas a URL limpa de volta lá na tabela em `faturas.comprovante_url`. A fatura passa visualmente pro cliente para o passo "Pagamento Em Análise".

### O Lado do Admin Master: Ativação

1. O seu Master (`admin_master`) entra no Backoffice dele global do SaaS.
2. Puxa a listagem da Server Route `/api/admin/faturas/pendentes` (filtrando pra quem subiu print).
3. "Bate o olho" no extrato do seu banco confirmando o PIX.
4. Clica numa ação de "Aprovar Fatura".

O Clique chama o `/api/admin/faturas/[id]/aprovar.post.ts`, que numa porrada atômica só:

- Passa o `faturas.status` daquela pendência inteira pra `'paga'` com registro eterno da `data_pagamento`.
- Vai até a `assinaturas` atrelada do dono, troca de `trial / atrasada` para `'ativa'`.
- Chuta o `renova_em` pra frente obedecendo à propriedade `ciclo` mapeada (Ex. `+ 1 month` ou `+ 1 year`).

**Resultado:** O lojista dá F5 no computador dele, o Middleware abre a cancela imediatamente, e ele loga feliz pelo próximo mês.

---

## 7. Próximos Ciclos (Mês subsequente)

O fluxo se repete pro dia 30, dia 60 e etc. Um script Server Side (NodeJS worker externo) criará no dia do vencimento uma fatura `pendente`. Caso não pague nos dias de tolerância, derruba a `assinaturas.status` e ativa as travas.
Quando você evoluir a empresa e conectar a **Stripe/Asaas/Cakto**, esse mesmo fluxo ali da "parte 6" será feito magicamente pelo Webhook externo.
Ao invés do "Clique" visual pra provar PIX, o evento baterá na nossa Rota de Webhook (`/api/webhooks/[provider]`). A rota inserirá o payload JSON bruto de forma segura na tabela **`gateway_eventos`** (que atua como uma barreira de idempotência via banco, bloqueando notificações repetidas ou duplicadas). Se for um evento válido e não-processado, a própria rota atualizará a `faturas` para `'paga'` e fará o avanço idêntico na `assinaturas`. O lojista nem percebe, é magiapura!

---

## 8. Tratamento de Exceções ("Casos Reais de Negócio")

Nossa arquitetura `core/assinaturas` foi desenhada para resolver as dores reais do empresário SaaS (flexibilidade sem quebrar as regras de sistema). Veja como tratamos cenários customizados:

### A: O Plano "Vitalício" (Lifetime Deal)

Muitos SaaS no começo lançam promoções de "pague 1x e tenha pra sempre". O sistema está perfeitamente pronto para isso:

1. O administrador cria (ou edita) um plano via JSONB e adiciona o ciclo: `"vitalicio": { "ativo": true, "valor": 997.00 }`.
2. A `assinaturas` vai gravar a coluna `ciclo = 'vitalicio'` (agora suportada na tabela).
3. E o vencimento? O servidor automaticamente define o `renova_em = 'infinity'` (ou `2099-12-31`).
4. **Resultado:** A data atual `now()` jamais ultrapassará o Infinito. O lojista usará o sistema para sempre sem disparar 1 única linha no código de Middleware para bloqueá-lo e o sistema não gera novas faturas automáticas.

### B: Adiar o Vencimento (Bônus, Tolerância ou "Me dá mais 15 dias?")

_O lojista liga pro suporte: "Meu cartão virou, só recebo dia 15, dá pra adiar sem me bloquear pra não parar o meu delivery?"_

**Perfeitamente possível, e muito simples:**

1. O Middleware de bloqueio **não é** atrelado a faturas não-pagas ou ao ciclo rigidamente. Ele só olha exclusivamente uma coisa: _A data de hoje é maior que a coluna `renova_em`?_
2. Em seu painel Admin Master existe um botão chamado "Estender Prazo".
3. Essa interface envia um PATCH/PUT simples para as Server Routes que editam a Assinatura, alterando pontualmente a coluna `renova_em` de `2026-05-30` para `2026-06-15`.
4. **Resultado:** O Middleware instantaneamente volta a liberar o acesso do lojista pelas próximas quinzenas. A fatura antiga contínua existindo, aguardando o pagamento. Isso é "Grace Period" em estado puro, totalmente suportado pelo design que implementamos na base de dados.
