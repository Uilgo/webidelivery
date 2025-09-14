// Exemplos de uso dos componentes Button e Input com ícones do Lucide React
// Este arquivo serve como documentação e referência para desenvolvedores

import {
  ChevronDown,
  Edit,
  Eye,
  Lock,
  Mail,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, InputWithIcon } from "@/components/ui/input";

// ============================================================================
// EXEMPLOS DE USO DO BUTTON COM ÍCONES
// ============================================================================

export function ButtonExamples() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Botões com ícones</h3>

      {/* Botão padrão com ícone à esquerda */}
      <Button>
        <Plus className="w-4 h-4" />
        Adicionar
      </Button>

      {/* Botão com ícone à direita */}
      <Button variant="outline">
        Configurações
        <ChevronDown className="w-4 h-4" />
      </Button>

      {/* Botões apenas com ícone */}
      <div className="flex gap-2">
        <Button size="icon" variant="outline">
          <Edit className="w-4 h-4" />
        </Button>

        <Button size="icon" variant="destructive">
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button size="icon-sm" variant="ghost">
          <Search className="w-3 h-3" />
        </Button>

        <Button size="icon-lg" variant="secondary">
          <User className="w-5 h-5" />
        </Button>
      </div>

      {/* Botão com múltiplos ícones */}
      <Button variant="outline" className="gap-3">
        <Mail className="w-4 h-4" />
        Enviar E-mail
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ============================================================================
// EXEMPLOS DE USO DO INPUT COM ÍCONES
// ============================================================================

export function InputExamples() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Inputs com ícones</h3>

      {/* Input básico sem ícone */}
      <Input type="email" placeholder="E-mail básico" />

      {/* Input com ícone à esquerda */}
      <InputWithIcon
        type="email"
        placeholder="Seu e-mail"
        leftIcon={<Mail className="w-4 h-4" />}
      />

      {/* Input com ícone à direita (não clicável) */}
      <InputWithIcon
        type="text"
        placeholder="Buscar..."
        rightIcon={<Search className="w-4 h-4" />}
      />

      {/* Input com ícones dos dois lados */}
      <InputWithIcon
        type="text"
        placeholder="Usuário"
        leftIcon={<User className="w-4 h-4" />}
        rightIcon={<Search className="w-4 h-4" />}
      />

      {/* Input de senha com toggle automático */}
      <InputWithIcon
        type="password"
        placeholder="Sua senha"
        rightIcon={<Eye className="h-4 w-4" />}
      />

      {/* Input de senha sem toggle */}
      <Input type="password" placeholder="Confirmar senha" />

      {/* Input de senha com ícone adicional à esquerda */}
      <InputWithIcon
        type="password"
        placeholder="Senha com ícone"
        leftIcon={<Lock className="w-4 h-4" />}
      />
    </div>
  );
}

// ============================================================================
// EXEMPLO DE FORMULÁRIO COMPLETO
// ============================================================================

export function FormExample() {
  return (
    <form className="space-y-4 max-w-md">
      <h3 className="font-medium">Formulário com ícones</h3>

      {/* Campo de usuário */}
      <div>
        <label htmlFor="usuario" className="text-sm font-medium">
          Usuário
        </label>
        <InputWithIcon
          id="usuario"
          type="text"
          placeholder="Digite seu usuário"
          leftIcon={<User className="w-4 h-4" />}
        />
      </div>

      {/* Campo de e-mail */}
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <InputWithIcon
          id="email"
          type="email"
          placeholder="seu@email.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      {/* Campo de senha com toggle */}
      <div>
        <label htmlFor="senha" className="text-sm font-medium">
          Senha
        </label>
        <InputWithIcon
          id="senha"
          type="password"
          placeholder="Digite sua senha"
          rightIcon={<Eye className="h-4 w-4" />}
        />
      </div>

      {/* Campo de busca */}
      <div>
        <label htmlFor="busca" className="text-sm font-medium">
          Buscar
        </label>
        <InputWithIcon
          id="busca"
          type="text"
          placeholder="Buscar produtos..."
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 pt-2">
        <Button className="flex-1">
          <Plus className="w-4 h-4" />
          Cadastrar
        </Button>

        <Button variant="outline">Cancelar</Button>

        <Button size="icon" variant="ghost">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// COMPONENTE PERSONALIZADO: SEARCH INPUT
// ============================================================================

export function SearchInput({
  onSearch,
  placeholder = "Buscar...",
  ...props
}: {
  onSearch?: (value: string) => void;
  placeholder?: string;
} & Omit<React.ComponentProps<"input">, "type">) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <InputWithIcon
      type="text"
      placeholder={placeholder}
      leftIcon={<Search className="w-4 h-4" />}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

// ============================================================================
// TIPOS DE ÍCONES MAIS USADOS NO PROJETO
// ============================================================================

// Interface, Navegação e Ações
// Plus, Minus, Edit, Trash2, Save, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight

// Usuário e Autenticação
// User, Users, Mail, Lock, Eye, EyeOff, LogIn, LogOut, UserPlus, Shield

// E-commerce e Delivery
// ShoppingCart, Package, Truck, MapPin, Clock, Star, Heart, Tag, CreditCard, Banknote

// Interface
// Search, Filter, Settings, Menu, Home, Bell, Info, AlertCircle, CheckCircle, XCircle

// Comunicação
// Phone, MessageCircle, Send, Share, Download, Upload, Link, Copy
