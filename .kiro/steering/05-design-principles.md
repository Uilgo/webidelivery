---
inclusion: auto
description: Guia completo sobre princípios fundamentais de design de software além do SOLID
---

# 🎨 Princípios de Design de Software

Guia completo sobre princípios fundamentais de design de software além do SOLID.
Aplicável a qualquer projeto de desenvolvimento.

---

## 📋 ÍNDICE

1. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
2. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Separation of Concerns](#separation-of-concerns)
5. [Composition Over Inheritance](#composition-over-inheritance)
6. [Law of Demeter](#law-of-demeter)
7. [Fail Fast](#fail-fast)
8. [Convention Over Configuration](#convention-over-configuration)

---

## 1️⃣ DRY - Don't Repeat Yourself

> "Cada pedaço de conhecimento deve ter uma representação única, inequívoca e autoritativa dentro de um sistema"

### Conceito

Evite duplicação de código, lógica ou conhecimento.
Se você precisa mudar algo em múltiplos lugares, está violando DRY.

### Aplicação Prática

#### ❌ RUIM - Código Duplicado

```typescript
// Validação duplicada em múltiplos lugares
function createUser(email: string, password: string) {
	if (!email.includes("@")) {
		throw new Error("Email inválido");
	}
	if (password.length < 8) {
		throw new Error("Senha muito curta");
	}
	// Criar usuário
}

function updateUser(email: string, password: string) {
	if (!email.includes("@")) {
		throw new Error("Email inválido");
	}
	if (password.length < 8) {
		throw new Error("Senha muito curta");
	}
	// Atualizar usuário
}

function validateLogin(email: string, password: string) {
	if (!email.includes("@")) {
		throw new Error("Email inválido");
	}
	if (password.length < 8) {
		throw new Error("Senha muito curta");
	}
	// Validar login
}
```

#### ✅ BOM - Código Reutilizado

```typescript
// Validação centralizada
function validateEmail(email: string): void {
	if (!email.includes("@")) {
		throw new Error("Email inválido");
	}
}

function validatePassword(password: string): void {
	if (password.length < 8) {
		throw new Error("Senha muito curta");
	}
}

function validateCredentials(email: string, password: string): void {
	validateEmail(email);
	validatePassword(password);
}

// Uso
function createUser(email: string, password: string) {
	validateCredentials(email, password);
	// Criar usuário
}

function updateUser(email: string, password: string) {
	validateCredentials(email, password);
	// Atualizar usuário
}

function validateLogin(email: string, password: string) {
	validateCredentials(email, password);
	// Validar login
}
```

### Benefícios

- ✅ Manutenção mais fácil (muda em um lugar só)
- ✅ Menos bugs (lógica consistente)
- ✅ Código mais limpo e legível

### Quando NÃO Aplicar

- ⚠️ Duplicação acidental (código similar, mas com propósitos diferentes)
- ⚠️ Abstrações prematuras (espere ter 3+ casos antes de abstrair)

---

## 2️⃣ KISS - Keep It Simple, Stupid

> "A maioria dos sistemas funciona melhor se forem mantidos simples, não complicados"

### Conceito

Prefira soluções simples e diretas.
Complexidade deve ser justificada por necessidade real, não por "elegância".

### Aplicação Prática

#### ❌ RUIM - Complexidade Desnecessária

```typescript
// Over-engineering com padrões desnecessários
interface IUserFactoryStrategy {
	createUser(data: UserData): User;
}

class StandardUserFactoryStrategy implements IUserFactoryStrategy {
	createUser(data: UserData): User {
		return new User(data);
	}
}

class UserFactoryContext {
	constructor(private strategy: IUserFactoryStrategy) {}

	executeStrategy(data: UserData): User {
		return this.strategy.createUser(data);
	}
}

const factory = new UserFactoryContext(new StandardUserFactoryStrategy());
const user = factory.executeStrategy(userData);
```

#### ✅ BOM - Solução Simples

```typescript
// Simples e direto
function createUser(data: UserData): User {
	return new User(data);
}

const user = createUser(userData);
```

### Benefícios

- ✅ Mais fácil de entender
- ✅ Mais fácil de manter
- ✅ Menos bugs
- ✅ Onboarding mais rápido

### Quando Adicionar Complexidade

- ✅ Requisito real de negócio
- ✅ Múltiplas implementações necessárias
- ✅ Extensibilidade comprovadamente necessária

---

## 3️⃣ YAGNI - You Aren't Gonna Need It

> "Não implemente algo até que seja realmente necessário"

### Conceito

Não adicione funcionalidades "por precaução" ou "para o futuro".
Implemente apenas o que é necessário agora.

### Aplicação Prática

#### ❌ RUIM - Funcionalidade Especulativa

```typescript
// Implementando recursos "para o futuro"
interface User {
	id: string;
	name: string;
	email: string;
	// Campos que "podem ser úteis no futuro"
	middleName?: string;
	nickname?: string;
	preferredLanguage?: string;
	timezone?: string;
	avatar?: string;
	bio?: string;
	website?: string;
	socialLinks?: SocialLinks;
	preferences?: UserPreferences;
	metadata?: Record<string, unknown>;
}

class UserService {
	// Métodos que "podem ser úteis"
	async findByMiddleName(middleName: string) {
		/* ... */
	}
	async findByNickname(nickname: string) {
		/* ... */
	}
	async findByTimezone(timezone: string) {
		/* ... */
	}
	async exportToXML() {
		/* ... */
	}
	async importFromXML() {
		/* ... */
	}
	async syncWithLDAP() {
		/* ... */
	}
}
```

#### ✅ BOM - Apenas o Necessário

```typescript
// Implementa apenas o que é necessário agora
interface User {
	id: string;
	name: string;
	email: string;
}

class UserService {
	async findById(id: string): Promise<User | null> {
		/* ... */
	}
	async findByEmail(email: string): Promise<User | null> {
		/* ... */
	}
	async create(data: CreateUserData): Promise<User> {
		/* ... */
	}
	async update(id: string, data: UpdateUserData): Promise<User> {
		/* ... */
	}
}

// Adicione novos campos/métodos quando realmente precisar
```

### Benefícios

- ✅ Menos código para manter
- ✅ Menos bugs potenciais
- ✅ Desenvolvimento mais rápido
- ✅ Código mais focado

### Quando Planejar para o Futuro

- ✅ Requisito confirmado para próximo sprint
- ✅ Arquitetura base (ex: sistema de plugins)
- ✅ APIs públicas (breaking changes são caros)

---

## 4️⃣ Separation of Concerns

> "Separe seu programa em seções distintas, cada uma abordando uma preocupação específica"

### Conceito

Divida seu código em módulos independentes, cada um responsável por uma preocupação específica.

### Aplicação Prática

#### ❌ RUIM - Preocupações Misturadas

```typescript
// Componente mistura UI, lógica de negócio e acesso a dados
<script setup lang="ts">
const users = ref<User[]>([])
const searchTerm = ref('')

// Acesso a dados
const fetchUsers = async () => {
  const response = await fetch('/api/users')
  const data = await response.json()
  users.value = data
}

// Lógica de negócio
const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Formatação
const formatUserName = (user: User) => {
  return `${user.firstName} ${user.lastName}`
}

onMounted(() => fetchUsers())
</script>

<template>
  <!-- UI -->
  <input v-model="searchTerm" />
  <div v-for="user in filteredUsers">
    {{ formatUserName(user) }}
  </div>
</template>
```

#### ✅ BOM - Preocupações Separadas

```typescript
// 1. Camada de Dados (useUsers.ts)
export const useUsers = () => {
  const users = ref<User[]>([])

  const fetchUsers = async () => {
    const response = await fetch('/api/users')
    users.value = await response.json()
  }

  return { users, fetchUsers }
}

// 2. Camada de Lógica (useUserFilters.ts)
export const useUserFilters = (users: Ref<User[]>) => {
  const searchTerm = ref('')

  const filteredUsers = computed(() => {
    return users.value.filter(user =>
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })

  return { searchTerm, filteredUsers }
}

// 3. Camada de Formatação (formatters.ts)
export function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}

// 4. Camada de UI (UserList.vue)
<script setup lang="ts">
const { users, fetchUsers } = useUsers()
const { searchTerm, filteredUsers } = useUserFilters(users)

onMounted(() => fetchUsers())
</script>

<template>
  <input v-model="searchTerm" />
  <div v-for="user in filteredUsers">
    {{ formatUserName(user) }}
  </div>
</template>
```

### Benefícios

- ✅ Código mais organizado
- ✅ Mais fácil de testar
- ✅ Reutilização de código
- ✅ Manutenção independente

---

## 5️⃣ Composition Over Inheritance

> "Prefira composição de objetos a herança de classes"

### Conceito

Em vez de herdar comportamento, componha objetos com comportamentos necessários.

### Aplicação Prática

#### ❌ RUIM - Herança Profunda

```typescript
class Animal {
	eat() {
		/* ... */
	}
	sleep() {
		/* ... */
	}
}

class Mammal extends Animal {
	giveBirth() {
		/* ... */
	}
}

class Dog extends Mammal {
	bark() {
		/* ... */
	}
}

class Cat extends Mammal {
	meow() {
		/* ... */
	}
}

// Problema: E se precisar de um animal que voa e nada?
// Herança múltipla não existe em TypeScript
```

#### ✅ BOM - Composição

```typescript
// Comportamentos como interfaces
interface Eater {
	eat(): void;
}

interface Sleeper {
	sleep(): void;
}

interface Flyer {
	fly(): void;
}

interface Swimmer {
	swim(): void;
}

// Implementações de comportamentos
class EatingBehavior implements Eater {
	eat(): void {
		/* ... */
	}
}

class SleepingBehavior implements Sleeper {
	sleep(): void {
		/* ... */
	}
}

class FlyingBehavior implements Flyer {
	fly(): void {
		/* ... */
	}
}

class SwimmingBehavior implements Swimmer {
	swim(): void {
		/* ... */
	}
}

// Animais compostos
class Duck {
	constructor(
		private eater: Eater,
		private sleeper: Sleeper,
		private flyer: Flyer,
		private swimmer: Swimmer,
	) {}

	eat() {
		this.eater.eat();
	}
	sleep() {
		this.sleeper.sleep();
	}
	fly() {
		this.flyer.fly();
	}
	swim() {
		this.swimmer.swim();
	}
}

const duck = new Duck(
	new EatingBehavior(),
	new SleepingBehavior(),
	new FlyingBehavior(),
	new SwimmingBehavior(),
);
```

### Benefícios

- ✅ Mais flexível
- ✅ Evita hierarquias complexas
- ✅ Reutilização de comportamentos
- ✅ Mais fácil de testar

---

## 6️⃣ Law of Demeter (Principle of Least Knowledge)

> "Fale apenas com seus amigos imediatos"

### Conceito

Um objeto deve ter conhecimento limitado sobre outros objetos.
Evite cadeias longas de chamadas.

### Aplicação Prática

#### ❌ RUIM - Violação da Lei de Demeter

```typescript
// Cadeia longa de chamadas
const street = user.getAddress().getCity().getStreet();

// Conhecimento excessivo da estrutura interna
class Order {
	processPayment() {
		const amount = this.cart
			.getItems()
			.reduce((sum, item) => sum + item.getProduct().getPrice() * item.getQuantity(), 0);
		this.payment.getProcessor().process(amount);
	}
}
```

#### ✅ BOM - Respeitando a Lei de Demeter

```typescript
// Encapsule o acesso
const street = user.getStreet();

// Delegue responsabilidades
class Order {
	processPayment() {
		const amount = this.cart.getTotalAmount();
		this.payment.process(amount);
	}
}

class Cart {
	getTotalAmount(): number {
		return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
	}
}

class CartItem {
	getTotalPrice(): number {
		return this.product.getPrice() * this.quantity;
	}
}
```

### Benefícios

- ✅ Menos acoplamento
- ✅ Mais fácil de refatorar
- ✅ Código mais resiliente a mudanças

---

## 7️⃣ Fail Fast

> "Detecte e reporte erros o mais cedo possível"

### Conceito

Valide entradas e condições no início da função.
Não deixe erros se propagarem silenciosamente.

### Aplicação Prática

#### ❌ RUIM - Falha Tardia

```typescript
function processOrder(order: Order) {
	// Faz muito processamento antes de validar
	const items = order.items.map((item) => ({
		...item,
		total: item.price * item.quantity,
	}));

	const subtotal = items.reduce((sum, item) => sum + item.total, 0);
	const tax = subtotal * 0.1;
	const total = subtotal + tax;

	// Valida apenas no final
	if (!order.customerId) {
		throw new Error("Customer ID é obrigatório");
	}

	if (items.length === 0) {
		throw new Error("Pedido deve ter pelo menos um item");
	}

	// Continua processamento...
}
```

#### ✅ BOM - Fail Fast

```typescript
function processOrder(order: Order) {
	// Valida PRIMEIRO
	if (!order.customerId) {
		throw new Error("Customer ID é obrigatório");
	}

	if (!order.items || order.items.length === 0) {
		throw new Error("Pedido deve ter pelo menos um item");
	}

	// Agora processa com segurança
	const items = order.items.map((item) => ({
		...item,
		total: item.price * item.quantity,
	}));

	const subtotal = items.reduce((sum, item) => sum + item.total, 0);
	const tax = subtotal * 0.1;
	const total = subtotal + tax;

	// Continua processamento...
}
```

### Benefícios

- ✅ Erros detectados mais cedo
- ✅ Debugging mais fácil
- ✅ Menos processamento desperdiçado
- ✅ Código mais seguro

---

## 8️⃣ Convention Over Configuration

> "Prefira convenções sensatas a configurações explícitas"

### Conceito

Use padrões e convenções para reduzir a necessidade de configuração.
Configure apenas o que é diferente do padrão.

### Aplicação Prática

#### ❌ RUIM - Configuração Excessiva

```typescript
// Precisa configurar tudo explicitamente
const userService = new UserService({
	tableName: "users",
	primaryKey: "id",
	timestamps: true,
	createdAtColumn: "created_at",
	updatedAtColumn: "updated_at",
	softDelete: true,
	deletedAtColumn: "deleted_at",
	connection: "default",
	schema: "public",
});
```

#### ✅ BOM - Convenção com Configuração Opcional

```typescript
// Usa convenções padrão
const userService = new UserService();

// Configura apenas o que é diferente
const customService = new UserService({
	tableName: "custom_users", // Padrão seria 'users'
	softDelete: false, // Padrão seria true
});

// Convenções assumidas:
// - primaryKey: 'id'
// - timestamps: true
// - createdAtColumn: 'created_at'
// - updatedAtColumn: 'updated_at'
// - deletedAtColumn: 'deleted_at'
// - connection: 'default'
// - schema: 'public'
```

### Benefícios

- ✅ Menos código boilerplate
- ✅ Mais rápido para começar
- ✅ Consistência entre projetos
- ✅ Configuração apenas quando necessário

---

## 🎯 CHECKLIST DE DESIGN

- [ ] Evitei duplicação de código? (DRY)
- [ ] Mantive a solução simples? (KISS)
- [ ] Implementei apenas o necessário? (YAGNI)
- [ ] Separei as preocupações? (SoC)
- [ ] Preferi composição a herança?
- [ ] Respeitei a Lei de Demeter?
- [ ] Validei entradas no início? (Fail Fast)
- [ ] Usei convenções sensatas?

---

## 📚 RECURSOS ADICIONAIS

- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)

---

**Última atualização:** Fevereiro 2026
