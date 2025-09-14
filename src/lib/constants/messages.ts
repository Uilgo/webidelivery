export const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS:
      "Já existe uma conta criada com este e-mail. Faça login para continuar.",
    PASSWORD_MISMATCH: "As senhas não coincidem",
    LOGIN_SUCCESS: "Login realizado com sucesso!",
    REGISTER_SUCCESS: "Conta criada! Vamos configurar sua empresa.",
    INVALID_CREDENTIALS: "E-mail ou senha incorretos",
    FORGOT_PASSWORD_SENT:
      "Enviamos um e-mail com instruções para redefinir sua senha.",
  },

  ONBOARDING: {
    WELCOME: "Bem-vindo! Vamos configurar sua empresa.",
    SLUG_AVAILABLE: "Disponível ✅",
    SLUG_UNAVAILABLE: "Indisponível ❌",
    COMPANY_CREATED: "Empresa criada com sucesso!",
    SPACE_TO_HYPHEN: "Espaços serão convertidos automaticamente em hífens",
  },

  CARDAPIO: {
    CATEGORIA_CREATED: "Categoria criada com sucesso",
    PRODUTO_CREATED: "Produto adicionado com sucesso",
    PRODUTO_UPDATED: "Produto atualizado com sucesso",
    CATEGORIA_EMPTY: "Nenhum produto nesta categoria",
    ADD_FIRST_PRODUCT: "Adicionar Primeiro Produto",
  },

  MARKETING: {
    CUPOM_CREATED: "Cupom criado com sucesso",
    BANNER_CREATED: "Banner criado com sucesso",
    PROMOCAO_CREATED: "Promoção criada com sucesso",
    CUPOM_APPLIED: "Cupom aplicado com desconto de R$ {valor}",
    CUPOM_INVALID: "Cupom inválido ou expirado",
    PROMOCAO_ACTIVE: "Promoção ativa",
    PROMOCAO_EXPIRED: "Promoção expirada",
  },

  PUBLIC_MENU: {
    OPEN_NOW: "Aberto agora",
    CLOSED_NOW: "Fechado no momento",
    CLOSES_AT: "Fecha às {hora}",
    ADD_TO_CART: "Adicionar ao carrinho",
    FINISH_ORDER: "Finalizar pedido",
    UNAVAILABLE: "Indisponível",
  },

  FORM: {
    REQUIRED_FIELD: "Este campo é obrigatório",
    SAVE: "Salvar",
    CANCEL: "Cancelar",
    EDIT: "Editar",
    DELETE: "Excluir",
    CONFIRM_DELETE: "Tem certeza que deseja excluir?",
    LOADING: "Carregando...",
    SAVING: "Salvando...",
  },
} as const;
