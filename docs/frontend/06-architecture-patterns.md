---
inclusion: auto
description: Guia completo sobre padrões arquiteturais e organização de código
---

# 🏗️ Padrões de Arquitetura de Software

Guia completo sobre padrões arquiteturais e organização de código.
Aplicável a projetos de qualquer tamanho e complexidade.

---

## 📋 ÍNDICE

1. [Layered Architecture](#layered-architecture)
2. [Feature-Based Architecture](#feature-based-architecture)
3. [Repository Pattern](#repository-pattern)
4. [Service Layer Pattern](#service-layer-pattern)
5. [Factory Pattern](#factory-pattern)
6. [Strategy Pattern](#strategy-pattern)
7. [Observer Pattern](#observer-pattern)
8. [Dependency Injection](#dependency-injection)

---

## 1️⃣ LAYERED ARCHITECTURE

> "Organize código em camadas com responsabilidades bem definidas"

### Conceito

Separe sua aplicação em camadas horizontais, cada uma com uma responsabilidade específica.
Camadas superiores podem depender de camadas inferiores, mas não o contrário.

### Estrutura Típica

```
┌─────────────────────────────────┐
│   Presentation Layer (UI)       │  ← Componentes, Views, Controllers
├─────────────────────────────────┤
│   Application Layer (Logic)     │  ← Use Cases, Composables, Services
├─────────────────────────────────┤
│   Domain Layer (Business)       │  ← Entities, Value Objects, Rules
├─────────────────────────────────┤
│   Infrastructure Layer (Data)   │  ← Repositories, APIs, Database
└─────────────────────────────────┘
```

### Aplicação Prática

```typescript
// 1. Presentation Layer (components/UserList.vue)
<script setup lang="ts">
const { users, isLoading, fetchUsers } = useUsers()

onMounted(() => fetchUsers())
</script>

// 2. Application Layer (composables/useUsers.ts)
export const useUsers = () => {
  const repository = inject<UserRepository>('userRepository')
  const users = ref<User[]>([])
  const isLoading = ref(false)

  const fetchUsers = async () => {
    isLoading.value = true
    try {
      users.value = await repository.findAll()
    } finally {
      isLoading.value = false
    }
  }

  return { users, isLoading, fetchUsers }
}

// 3. Domain Layer (domain/User.ts)
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    this.validateEmail(email)
  }

  private validateEmail(email: string): void {
    if (!email.includes('@')) {
      throw new Error('Email inválido')
    }
  }

  get displayName(): string {
    return this.name.toUpperCase()
  }
}

// 4. Infrastructure Layer (repositories/UserRepository.ts)
export class ApiUserRepository implements UserRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<User[]> {
    const response = await this.apiClient.get('/users')
    return response.data.map(data => new User(data.id, data.name, data.email))
  }
}
```

### Benefícios

- ✅ Separação clara de responsabilidades
- ✅ Fácil de testar cada camada isoladamente
- ✅ Facilita mudanças de tecnologia (ex: trocar API)
- ✅ Código mais organizado e previsível

---

## 2️⃣ FEATURE-BASED ARCHITECTURE

> "Organize código por funcionalidade, não por tipo técnico"

### Conceito

Em vez de agrupar por tipo (components/, services/, etc), agrupe por feature.
Cada feature contém tudo que precisa: componentes, lógica, tipos, testes.

### Estrutura

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── composables/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── types/
│   │   │   └── auth.ts
│   │   ├── utils/
│   │   │   └── validatePassword.ts
│   │   └── __tests__/
│   │       └── useLogin.test.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserList.vue
│   │   │   └── UserCard.vue
│   │   ├── composables/
│   │   │   └── useUsers.ts
│   │   ├── types/
│   │   │   └── user.ts
│   │   └── __tests__/
│   │       └── useUsers.test.ts
│   │
│   └── dashboard/
│       ├── components/
│       ├── composables/
│       └── types/
│
├── shared/              # Código compartilhado entre features
│   ├── components/
│   ├── composables/
│   ├── types/
│   └── utils/
│
└── lib/                 # Bibliotecas e utilitários de baixo nível
    ├── api/
    ├── storage/
    └── validation/
```

### Benefícios

- ✅ Fácil de encontrar código relacionado
- ✅ Features podem ser desenvolvidas independentemente
- ✅ Facilita remoção de features obsoletas
- ✅ Melhor para trabalho em equipe

---

## 3️⃣ REPOSITORY PATTERN

> "Abstraia o acesso a dados atrás de uma interface"

### Conceito

Crie uma camada de abstração entre a lógica de negócio e o acesso a dados.
Permite trocar a fonte de dados sem afetar o resto do código.

### Aplicação Prática

```typescript
// 1. Interface do Repository (abstração)
interface UserRepository {
	findAll(): Promise<User[]>;
	findById(id: string): Promise<User | null>;
	create(data: CreateUserData): Promise<User>;
	update(id: string, data: UpdateUserData): Promise<User>;
	delete(id: string): Promise<void>;
}

// 2. Implementação com API REST
class ApiUserRepository implements UserRepository {
	constructor(private apiClient: ApiClient) {}

	async findAll(): Promise<User[]> {
		const response = await this.apiClient.get("/users");
		return response.data;
	}

	async findById(id: string): Promise<User | null> {
		const response = await this.apiClient.get(`/users/${id}`);
		return response.data;
	}

	async create(data: CreateUserData): Promise<User> {
		const response = await this.apiClient.post("/users", data);
		return response.data;
	}

	async update(id: string, data: UpdateUserData): Promise<User> {
		const response = await this.apiClient.patch(`/users/${id}`, data);
		return response.data;
	}

	async delete(id: string): Promise<void> {
		await this.apiClient.delete(`/users/${id}`);
	}
}

// 3. Implementação com LocalStorage (para testes ou offline)
class LocalStorageUserRepository implements UserRepository {
	private readonly STORAGE_KEY = "users";

	async findAll(): Promise<User[]> {
		const data = localStorage.getItem(this.STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	}

	async findById(id: string): Promise<User | null> {
		const users = await this.findAll();
		return users.find((u) => u.id === id) || null;
	}

	async create(data: CreateUserData): Promise<User> {
		const users = await this.findAll();
		const newUser = { ...data, id: crypto.randomUUID() };
		users.push(newUser);
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
		return newUser;
	}

	// ... outros métodos
}

// 4. Uso (código não sabe qual implementação está usando)
const repository: UserRepository = new ApiUserRepository(apiClient);
// ou
const repository: UserRepository = new LocalStorageUserRepository();

const users = await repository.findAll();
```

### Benefícios

- ✅ Desacoplamento entre lógica e dados
- ✅ Fácil de testar (usa mock repository)
- ✅ Fácil de trocar fonte de dados
- ✅ Centraliza lógica de acesso a dados

---

## 4️⃣ SERVICE LAYER PATTERN

> "Encapsule lógica de negócio complexa em serviços"

### Conceito

Crie serviços para orquestrar operações complexas que envolvem múltiplos repositórios ou regras de negócio.

### Aplicação Prática

```typescript
// Service que orquestra múltiplas operações
class UserService {
	constructor(
		private userRepository: UserRepository,
		private emailService: EmailService,
		private auditService: AuditService,
	) {}

	async registerUser(data: RegisterUserData): Promise<User> {
		// 1. Valida dados
		this.validateRegistrationData(data);

		// 2. Verifica se email já existe
		const existingUser = await this.userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new Error("Email já cadastrado");
		}

		// 3. Cria usuário
		const user = await this.userRepository.create({
			name: data.name,
			email: data.email,
			password: await this.hashPassword(data.password),
		});

		// 4. Envia email de boas-vindas
		await this.emailService.sendWelcomeEmail(user.email, user.name);

		// 5. Registra auditoria
		await this.auditService.log("user_registered", { userId: user.id });

		return user;
	}

	async updateUserProfile(userId: string, data: UpdateProfileData): Promise<User> {
		// 1. Busca usuário
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new Error("Usuário não encontrado");
		}

		// 2. Valida mudanças
		if (data.email && data.email !== user.email) {
			const emailExists = await this.userRepository.findByEmail(data.email);
			if (emailExists) {
				throw new Error("Email já em uso");
			}
		}

		// 3. Atualiza usuário
		const updatedUser = await this.userRepository.update(userId, data);

		// 4. Registra auditoria
		await this.auditService.log("user_updated", { userId, changes: data });

		return updatedUser;
	}

	private validateRegistrationData(data: RegisterUserData): void {
		if (!data.email.includes("@")) {
			throw new Error("Email inválido");
		}
		if (data.password.length < 8) {
			throw new Error("Senha muito curta");
		}
	}

	private async hashPassword(password: string): Promise<string> {
		// Implementação de hash
		return password; // Simplificado
	}
}
```

### Benefícios

- ✅ Lógica de negócio centralizada
- ✅ Reutilização de operações complexas
- ✅ Mais fácil de testar
- ✅ Transações e rollbacks centralizados

---

## 5️⃣ FACTORY PATTERN

> "Encapsule a criação de objetos complexos"

### Conceito

Use factories para criar objetos quando a criação envolve lógica complexa ou múltiplas variações.

### Aplicação Prática

```typescript
// Factory para criar diferentes tipos de notificações
interface Notification {
	send(message: string): Promise<void>;
}

class EmailNotification implements Notification {
	constructor(private emailService: EmailService) {}

	async send(message: string): Promise<void> {
		await this.emailService.send(message);
	}
}

class SMSNotification implements Notification {
	constructor(private smsService: SMSService) {}

	async send(message: string): Promise<void> {
		await this.smsService.send(message);
	}
}

class PushNotification implements Notification {
	constructor(private pushService: PushService) {}

	async send(message: string): Promise<void> {
		await this.pushService.send(message);
	}
}

// Factory
class NotificationFactory {
	constructor(
		private emailService: EmailService,
		private smsService: SMSService,
		private pushService: PushService,
	) {}

	create(type: "email" | "sms" | "push"): Notification {
		switch (type) {
			case "email":
				return new EmailNotification(this.emailService);
			case "sms":
				return new SMSNotification(this.smsService);
			case "push":
				return new PushNotification(this.pushService);
			default:
				throw new Error(`Tipo de notificação não suportado: ${type}`);
		}
	}

	// Método conveniente para criar múltiplas notificações
	createMultiple(types: Array<"email" | "sms" | "push">): Notification[] {
		return types.map((type) => this.create(type));
	}
}

// Uso
const factory = new NotificationFactory(emailService, smsService, pushService);
const notification = factory.create("email");
await notification.send("Olá!");

// Enviar para múltiplos canais
const notifications = factory.createMultiple(["email", "sms", "push"]);
await Promise.all(notifications.map((n) => n.send("Olá!")));
```

### Benefícios

- ✅ Encapsula lógica de criação
- ✅ Facilita adição de novos tipos
- ✅ Código cliente mais limpo
- ✅ Centraliza dependências

---

## 6️⃣ STRATEGY PATTERN

> "Defina uma família de algoritmos e torne-os intercambiáveis"

### Conceito

Encapsule algoritmos em classes separadas e permita que sejam trocados em tempo de execução.

### Aplicação Prática

```typescript
// Interface da estratégia
interface PricingStrategy {
	calculatePrice(basePrice: number): number;
}

// Estratégias concretas
class RegularPricing implements PricingStrategy {
	calculatePrice(basePrice: number): number {
		return basePrice;
	}
}

class BlackFridayPricing implements PricingStrategy {
	calculatePrice(basePrice: number): number {
		return basePrice * 0.5; // 50% de desconto
	}
}

class VIPPricing implements PricingStrategy {
	calculatePrice(basePrice: number): number {
		return basePrice * 0.9; // 10% de desconto
	}
}

class BulkPricing implements PricingStrategy {
	constructor(private quantity: number) {}

	calculatePrice(basePrice: number): number {
		if (this.quantity >= 10) {
			return basePrice * 0.8; // 20% de desconto
		}
		if (this.quantity >= 5) {
			return basePrice * 0.9; // 10% de desconto
		}
		return basePrice;
	}
}

// Contexto que usa a estratégia
class ShoppingCart {
	private items: CartItem[] = [];
	private pricingStrategy: PricingStrategy = new RegularPricing();

	setPricingStrategy(strategy: PricingStrategy): void {
		this.pricingStrategy = strategy;
	}

	addItem(item: CartItem): void {
		this.items.push(item);
	}

	getTotalPrice(): number {
		const baseTotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		return this.pricingStrategy.calculatePrice(baseTotal);
	}
}

// Uso
const cart = new ShoppingCart();
cart.addItem({ name: "Product A", price: 100, quantity: 2 });

// Preço regular
console.log(cart.getTotalPrice()); // 200

// Black Friday
cart.setPricingStrategy(new BlackFridayPricing());
console.log(cart.getTotalPrice()); // 100

// Cliente VIP
cart.setPricingStrategy(new VIPPricing());
console.log(cart.getTotalPrice()); // 180

// Compra em quantidade
cart.setPricingStrategy(new BulkPricing(10));
console.log(cart.getTotalPrice()); // 160
```

### Benefícios

- ✅ Elimina condicionais complexos
- ✅ Fácil de adicionar novas estratégias
- ✅ Estratégias podem ser testadas isoladamente
- ✅ Código mais flexível

---

## 7️⃣ OBSERVER PATTERN

> "Defina uma dependência um-para-muitos entre objetos"

### Conceito

Quando um objeto muda de estado, todos os seus dependentes são notificados automaticamente.

### Aplicação Prática

```typescript
// Interface do Observer
interface Observer<T> {
	update(data: T): void;
}

// Subject (Observable)
class EventEmitter<T> {
	private observers: Observer<T>[] = [];

	subscribe(observer: Observer<T>): () => void {
		this.observers.push(observer);

		// Retorna função para unsubscribe
		return () => {
			const index = this.observers.indexOf(observer);
			if (index > -1) {
				this.observers.splice(index, 1);
			}
		};
	}

	notify(data: T): void {
		this.observers.forEach((observer) => observer.update(data));
	}
}

// Exemplo: Sistema de notificações
interface UserEvent {
	type: "login" | "logout" | "update";
	userId: string;
	timestamp: Date;
}

class UserEventEmitter extends EventEmitter<UserEvent> {}

// Observers concretos
class EmailNotifier implements Observer<UserEvent> {
	update(event: UserEvent): void {
		if (event.type === "login") {
			console.log(`Enviando email: Novo login detectado para ${event.userId}`);
		}
	}
}

class AuditLogger implements Observer<UserEvent> {
	update(event: UserEvent): void {
		console.log(`[AUDIT] ${event.type} - User: ${event.userId} - ${event.timestamp}`);
	}
}

class AnalyticsTracker implements Observer<UserEvent> {
	update(event: UserEvent): void {
		console.log(`[ANALYTICS] Tracking ${event.type} event`);
	}
}

// Uso
const userEvents = new UserEventEmitter();

const emailNotifier = new EmailNotifier();
const auditLogger = new AuditLogger();
const analyticsTracker = new AnalyticsTracker();

// Inscrever observers
const unsubscribeEmail = userEvents.subscribe(emailNotifier);
userEvents.subscribe(auditLogger);
userEvents.subscribe(analyticsTracker);

// Emitir evento (todos os observers são notificados)
userEvents.notify({
	type: "login",
	userId: "user123",
	timestamp: new Date(),
});

// Desinscrever um observer
unsubscribeEmail();

// Próximo evento não notifica o emailNotifier
userEvents.notify({
	type: "logout",
	userId: "user123",
	timestamp: new Date(),
});
```

### Benefícios

- ✅ Desacoplamento entre emissor e receptores
- ✅ Fácil de adicionar novos observers
- ✅ Suporta broadcast de eventos
- ✅ Observers podem se inscrever/desinscrever dinamicamente

---

## 8️⃣ DEPENDENCY INJECTION

> "Injete dependências em vez de criá-las internamente"

### Conceito

Passe dependências como parâmetros em vez de instanciá-las dentro da classe.
Facilita testes e torna o código mais flexível.

### Aplicação Prática

```typescript
// ❌ RUIM - Dependências criadas internamente
class UserService {
	private repository = new UserRepository(); // Acoplamento forte!
	private emailService = new EmailService(); // Difícil de testar!

	async createUser(data: CreateUserData): Promise<User> {
		const user = await this.repository.create(data);
		await this.emailService.sendWelcome(user.email);
		return user;
	}
}

// ✅ BOM - Dependências injetadas
class UserService {
	constructor(
		private repository: UserRepository,
		private emailService: EmailService,
	) {}

	async createUser(data: CreateUserData): Promise<User> {
		const user = await this.repository.create(data);
		await this.emailService.sendWelcome(user.email);
		return user;
	}
}

// Uso em produção
const repository = new ApiUserRepository(apiClient);
const emailService = new SendGridEmailService(apiKey);
const userService = new UserService(repository, emailService);

// Uso em testes
const mockRepository = new MockUserRepository();
const mockEmailService = new MockEmailService();
const userService = new UserService(mockRepository, mockEmailService);

// Container de DI (opcional, para projetos grandes)
class Container {
	private services = new Map<string, any>();

	register<T>(name: string, factory: () => T): void {
		this.services.set(name, factory);
	}

	resolve<T>(name: string): T {
		const factory = this.services.get(name);
		if (!factory) {
			throw new Error(`Service not found: ${name}`);
		}
		return factory();
	}
}

// Configuração do container
const container = new Container();

container.register("apiClient", () => new ApiClient());
container.register("userRepository", () => new ApiUserRepository(container.resolve("apiClient")));
container.register("emailService", () => new SendGridEmailService(process.env.SENDGRID_KEY));
container.register(
	"userService",
	() => new UserService(container.resolve("userRepository"), container.resolve("emailService")),
);

// Uso
const userService = container.resolve<UserService>("userService");
```

### Benefícios

- ✅ Código mais testável
- ✅ Dependências explícitas
- ✅ Fácil de trocar implementações
- ✅ Facilita mocks em testes

---

## 🎯 CHECKLIST DE ARQUITETURA

- [ ] Código organizado em camadas claras?
- [ ] Features agrupadas logicamente?
- [ ] Acesso a dados abstraído em repositories?
- [ ] Lógica de negócio complexa em services?
- [ ] Criação de objetos complexos usa factories?
- [ ] Algoritmos intercambiáveis usam strategy?
- [ ] Eventos usam observer pattern?
- [ ] Dependências são injetadas?

---

## 📚 RECURSOS ADICIONAIS

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html)
- [Clean Architecture by Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)

---

**Última atualização:** Fevereiro 2026
