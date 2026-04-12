---
inclusion: always
description: Índice de todos os guias de desenvolvimento e boas práticas
---

# 📚 Guias de Desenvolvimento - Índice

Bem-vindo aos guias de desenvolvimento! Esta coleção de documentos estabelece padrões e boas práticas para criar software de qualidade.

---

## 🎯 VISÃO GERAL

Estes guias são **universais** e aplicáveis a qualquer projeto de desenvolvimento de software, independente do domínio ou tecnologia específica.

### Objetivo

- ✅ Estabelecer padrões consistentes
- ✅ Melhorar qualidade do código
- ✅ Facilitar manutenção e escalabilidade
- ✅ Acelerar onboarding de novos desenvolvedores
- ✅ Reduzir bugs e débito técnico

---

## 📖 GUIAS DISPONÍVEIS

### 🌍 Guias Universais (Aplicáveis a Qualquer Projeto)

Estes guias contêm princípios e padrões que podem ser aplicados em qualquer projeto de software, independente da tecnologia ou framework.

#### 1. [Clean Code](./03-clean-code.md)

**Foco:** Código limpo, legível e manutenível

**Tópicos:**

- Nomenclatura de variáveis, funções e classes
- Tamanho e complexidade de funções
- Uso de comentários
- Formatação e organização
- Tratamento de erros
- Constantes vs Magic Numbers
- TypeScript rigoroso
- Composables e Stores

**Quando usar:** Sempre! Este é o guia fundamental para escrever código de qualidade.

---

#### 2. [Princípios SOLID](./04-solid-principles.md)

**Foco:** Design orientado a objetos escalável

**Tópicos:**

- **S** - Single Responsibility Principle
- **O** - Open/Closed Principle
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

**Quando usar:** Ao projetar classes, interfaces e módulos. Especialmente importante em projetos médios/grandes.

---

#### 3. [Princípios de Design](./05-design-principles.md)

**Foco:** Princípios fundamentais além do SOLID

**Tópicos:**

- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren't Gonna Need It)
- Separation of Concerns
- Composition Over Inheritance
- Law of Demeter
- Fail Fast
- Convention Over Configuration

**Quando usar:** Durante todo o desenvolvimento. Estes princípios complementam SOLID e Clean Code.

---

#### 4. [Padrões de Arquitetura](./06-architecture-patterns.md)

**Foco:** Organização e estrutura de código

**Tópicos:**

- Layered Architecture
- Feature-Based Architecture
- Repository Pattern
- Service Layer Pattern
- Factory Pattern
- Strategy Pattern
- Observer Pattern
- Dependency Injection

**Quando usar:** Ao estruturar projetos novos ou refatorar projetos existentes.

---

### 🎨 Guia de Design System

Este guia é **universal** e aplicável a qualquer projeto web moderno.

#### 5. [Design System](./07-design-system.md)

### 🎨 Guia de Design System

**Foco:** Criar e manter um Design System escalável e consistente

**Tópicos:**

- Design Tokens (cores OKLCH, espaçamentos, tipografia)
- Sistema de Cores (7 cores × 11 tons)
- Componentes (anatomia, variantes, estados)
- Arquitetura CSS (Tailwind v4 + variáveis CSS)
- Boas Práticas (acessibilidade, performance, manutenção)
- Exemplos Práticos (Button, Input, Card)
- Ferramentas e Recursos

**Quando usar:** Ao criar um novo projeto do zero ou padronizar componentes existentes.

**Princípios aplicados:** DRY, KISS, YAGNI, Separation of Concerns

---

### 🎯 Guias Específicos do Projeto

Estes guias são específicos para o projeto atual e suas tecnologias.

#### 6. [Guia Nuxt 4](./08-nuxt-4.md)

**Foco:** Estrutura de pastas e padrões específicos do Nuxt 4

**Tópicos:**

- Estrutura de pastas do projeto
- Nomenclatura de arquivos
- Configuração do Nuxt
- Padrões Vue/Nuxt específicos
- Tailwind CSS v4

**Quando usar:** Ao trabalhar neste projeto Nuxt 4 específico.

---

#### 7. [Guia Supabase](./09-supabase.md)

**Foco:** Integração com @nuxtjs/supabase

**Tópicos:**

- Configuração do módulo
- Autenticação
- RLS e RPC
- Server-side usage
- TypeScript types

**Quando usar:** Ao trabalhar com Supabase neste projeto.

---

## 🚀 COMO USAR ESTES GUIAS

### Para Novos Projetos

1. **Planejamento:**
   - Leia [Padrões de Arquitetura](./06-architecture-patterns.md)
   - Defina estrutura de pastas e camadas
   - Escolha padrões apropriados para o projeto

2. **Desenvolvimento:**
   - Siga [Clean Code](./03-clean-code.md) diariamente
   - Aplique [SOLID](./04-solid-principles.md) ao criar classes/módulos
   - Consulte [Princípios de Design](./05-design-principles.md) ao tomar decisões

3. **Revisão:**
   - Use checklists de cada guia
   - Revise código contra os princípios
   - Refatore quando necessário

### Para Projetos Existentes

1. **Auditoria:**
   - Avalie código atual contra os guias
   - Identifique violações críticas
   - Priorize refatorações

2. **Refatoração Incremental:**
   - Comece com [Clean Code](./03-clean-code.md) (impacto rápido)
   - Aplique [DRY](./05-design-principles.md#dry) (elimine duplicação)
   - Introduza [Repository Pattern](./06-architecture-patterns.md#repository-pattern) (desacople dados)

3. **Manutenção:**
   - Novo código segue os guias
   - Refatore código antigo gradualmente
   - Documente decisões arquiteturais

---

## 📊 NÍVEIS DE APLICAÇÃO

### Nível 1: Essencial (Obrigatório)

**Aplique sempre, em qualquer projeto:**

- ✅ Nomenclatura clara e descritiva
- ✅ Funções pequenas (máx 20-30 linhas)
- ✅ DRY (não duplique código)
- ✅ KISS (mantenha simples)
- ✅ Fail Fast (valide cedo)
- ✅ Single Responsibility Principle

**Impacto:** Alto | **Esforço:** Baixo

---

### Nível 2: Recomendado (Projetos Médios)

**Aplique em projetos com múltiplos desenvolvedores:**

- ✅ Todos os princípios SOLID
- ✅ Separation of Concerns
- ✅ Repository Pattern
- ✅ Dependency Injection
- ✅ Feature-Based Architecture

**Impacto:** Alto | **Esforço:** Médio

---

### Nível 3: Avançado (Projetos Grandes)

**Aplique em projetos complexos e de longa duração:**

- ✅ Layered Architecture completa
- ✅ Service Layer Pattern
- ✅ Factory Pattern
- ✅ Strategy Pattern
- ✅ Observer Pattern
- ✅ Composition Over Inheritance

**Impacto:** Médio | **Esforço:** Alto

---

## 🎯 CHECKLISTS RÁPIDOS

### Antes de Commitar

- [ ] Código segue nomenclatura padrão?
- [ ] Funções têm no máximo 20-30 linhas?
- [ ] Não há código duplicado?
- [ ] Não há magic numbers?
- [ ] Tipos TypeScript estão corretos (sem `any`)?
- [ ] Comentários explicam "por quê", não "o quê"?
- [ ] Validações estão no início das funções?

### Antes de Code Review

- [ ] Cada arquivo tem responsabilidade única?
- [ ] Código está organizado em camadas?
- [ ] Dependências são injetadas?
- [ ] Interfaces são pequenas e focadas?
- [ ] Código é extensível sem modificação?
- [ ] Testes cobrem casos principais?

### Antes de Deploy

- [ ] Arquitetura está documentada?
- [ ] Padrões estão consistentes?
- [ ] Não há débito técnico crítico?
- [ ] Performance está adequada?
- [ ] Segurança foi revisada?

---

## 🔄 PROCESSO DE MELHORIA CONTÍNUA

### Revisão Semanal

- Revise PRs contra os guias
- Identifique padrões de violação
- Compartilhe aprendizados com o time

### Revisão Mensal

- Atualize guias com novos aprendizados
- Refatore código problemático
- Meça métricas de qualidade

### Revisão Trimestral

- Avalie arquitetura geral
- Planeje refatorações grandes
- Atualize documentação

---

## 📚 RECURSOS COMPLEMENTARES

### Livros Recomendados

1. **Clean Code** - Robert C. Martin
   - Fundamentos de código limpo
   - Exemplos práticos em Java (aplicável a qualquer linguagem)

2. **The Pragmatic Programmer** - Andrew Hunt & David Thomas
   - Princípios atemporais de desenvolvimento
   - Dicas práticas para o dia a dia

3. **Design Patterns** - Gang of Four
   - Padrões clássicos de design
   - Soluções reutilizáveis para problemas comuns

4. **Clean Architecture** - Robert C. Martin
   - Arquitetura de software escalável
   - Separação de camadas e dependências

### Recursos Online

- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
- [Refactoring Guru](https://refactoring.guru/)
- [Martin Fowler's Blog](https://martinfowler.com/)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)

---

## 🤝 CONTRIBUINDO

Estes guias são vivos e devem evoluir com o tempo.

### Como Contribuir

1. Identifique gaps ou melhorias
2. Proponha mudanças com exemplos
3. Discuta com o time
4. Atualize documentação
5. Compartilhe aprendizados

### Princípios para Contribuições

- ✅ Mantenha exemplos práticos e realistas
- ✅ Explique "por quê", não apenas "como"
- ✅ Inclua exemplos de código ruim e bom
- ✅ Mantenha linguagem clara e objetiva
- ✅ Foque em princípios, não em tecnologias específicas

---

## 💡 DICAS FINAIS

### Para Desenvolvedores

- 📖 Leia um guia por semana
- 🎯 Aplique um princípio por vez
- 🔄 Refatore código antigo gradualmente
- 🤝 Compartilhe conhecimento com o time
- 📝 Documente decisões arquiteturais

### Para Tech Leads

- 📊 Monitore métricas de qualidade
- 🎓 Promova sessões de estudo
- 👀 Revise código contra os guias
- 🏆 Reconheça boas práticas
- 🔧 Facilite refatorações

### Para Arquitetos

- 🏗️ Defina arquitetura base
- 📐 Estabeleça padrões do projeto
- 🎯 Priorize débito técnico
- 📚 Mantenha documentação atualizada
- 🔍 Revise decisões periodicamente

---

## ❓ FAQ

**P: Devo aplicar todos os princípios em todos os projetos?**
R: Não. Use o [Níveis de Aplicação](#níveis-de-aplicação) como guia. Projetos pequenos precisam apenas do essencial.

**P: E se meu código violar algum princípio?**
R: Avalie o contexto. Às vezes há boas razões para violar um princípio. Documente a decisão.

**P: Como convencer o time a seguir estes guias?**
R: Comece pequeno. Aplique em código novo. Mostre benefícios com exemplos concretos.

**P: Quanto tempo leva para dominar estes princípios?**
R: Varia. Conceitos básicos: 1-2 meses. Domínio completo: 1-2 anos de prática consistente.

**P: Posso adaptar estes guias para meu projeto?**
R: Sim! Estes são guias, não regras absolutas. Adapte conforme necessário, mas documente mudanças.

---

## 📞 SUPORTE

Dúvidas ou sugestões sobre os guias?

- 📧 Abra uma issue no repositório
- 💬 Discuta com o time
- 📝 Proponha melhorias via PR

---

**Última atualização:** Fevereiro 2026

**Versão:** 1.0.0

**Licença:** MIT (use livremente em seus projetos!)
