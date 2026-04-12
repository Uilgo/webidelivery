---
inclusion: auto
description: Guia completo sobre os princípios SOLID para desenvolvimento de software escalável e manutenível
---

# 🏛️ Princípios SOLID

Guia completo sobre os princípios SOLID para desenvolvimento de software escalável e manutenível.
Aplicável a qualquer projeto TypeScript/JavaScript.

---

## 📋 O QUE É SOLID?

SOLID é um acrônimo para cinco princípios de design orientado a objetos:

- **S** - Single Responsibility Principle (Princípio da Responsabilidade Única)
- **O** - Open/Closed Principle (Princípio Aberto/Fechado)
- **L** - Liskov Substitution Principle (Princípio da Substituição de Liskov)
- **I** - Interface Segregation Principle (Princípio da Segregação de Interface)
- **D** - Dependency Inversion Principle (Princípio da Inversão de Dependência)

---

## 1️⃣ SINGLE RESPONSIBILITY PRINCIPLE (SRP)

> "Uma classe/função/módulo deve ter apenas uma razão para mudar"

### Conceito

Cada unidade de código deve ter uma única responsabilidade bem definida.
Se você consegue descrever o que um arquivo faz usando "E" ou "OU", ele provavelmente viola SRP.

### Aplicação Prática

#### ❌ RUIM - Múltiplas Responsabilidades

```typescript
// Componente fazendo TUDO
<script setup lang="ts">
const users = ref<User[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Busca dados
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/users')
    users.value = await response.json()
  } catch (err) {
    error.value = 'Erro ao buscar usuários'
  } finally {
    isLoading.value = false
  }
}

// Valida dados
const validateUser = (user: User) => {
  return user.email.includes('@') && user.name.length > 0
}

// Formata dados
const formatUserName = (user: User) => {
  return `${user.firstName} ${user.lastName}`
}

onMounted(() => fetchUsers())
</script>
```

#### ✅ BOM - Responsabilidade Única

```typescript
// 1. Composable para busca de dados (useUsers.ts)
export const useUsers = () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async () => {
    isLoading.value = true
    try {
      const response = await fetch('/api/users')
      users.value = await response.json()
    } catch (err) {
      error.value = 'Erro ao buscar usuários'
    } finally {
      isLoading.value = false
    }
  }

  return { users, isLoading, error, fetchUsers }
}

// 2. Utilitário para validação (validateUser.ts)
export function validateUser(user: User): boolean {
  return user.email.includes('@') && user.name.length > 0
}

// 3. Utilitário para formatação (formatUserName.ts)
export function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}

// 4. Componente apenas consome (UserList.vue)
<script setup lang="ts">
const { users, isLoading, fetchUsers } = useUsers()

onMounted(() => fetchUsers())
</script>
```

### Benefícios

- ✅ Código mais fácil de entender
- ✅ Mais fácil de testar (testa cada responsabilidade isoladamente)
- ✅ Mais fácil de manter (mudanças afetam apenas uma área)
- ✅ Reutilização de código

---

## 2️⃣ OPEN/CLOSED PRINCIPLE (OCP)

> "Entidades devem estar abertas para extensão, mas fechadas para modificação"

### Conceito

Você deve poder adicionar novas funcionalidades sem modificar código existente.
Use abstrações (interfaces, classes abstratas) e polimorfismo.

### Aplicação Prática

#### ❌ RUIM - Modificação Constante

```typescript
// Toda vez que adicionar novo tipo, precisa modificar esta função
const processPayment = (payment: Payment) => {
	if (payment.method === "pix") {
		return processPixPayment(payment);
	} else if (payment.method === "credit_card") {
		return processCreditCardPayment(payment);
	} else if (payment.method === "debit_card") {
		return processDebitCardPayment(payment);
	}
	// Precisa adicionar mais IFs para cada novo método
};
```

#### ✅ BOM - Extensão sem Modificação

```typescript
// 1. Interface abstrata
interface PaymentProcessor {
	process(payment: Payment): Promise<PaymentResult>;
}

// 2. Implementações concretas
class PixPaymentProcessor implements PaymentProcessor {
	async process(payment: Payment): Promise<PaymentResult> {
		// Lógica específica do Pix
		return { success: true, transactionId: "..." };
	}
}

class CreditCardPaymentProcessor implements PaymentProcessor {
	async process(payment: Payment): Promise<PaymentResult> {
		// Lógica específica do Cartão
		return { success: true, transactionId: "..." };
	}
}

// 3. Factory para criar processadores
class PaymentProcessorFactory {
	private processors = new Map<string, PaymentProcessor>([
		["pix", new PixPaymentProcessor()],
		["credit_card", new CreditCardPaymentProcessor()],
	]);

	getProcessor(method: string): PaymentProcessor {
		const processor = this.processors.get(method);
		if (!processor) {
			throw new Error(`Método de pagamento não suportado: ${method}`);
		}
		return processor;
	}

	// Para adicionar novo método, apenas registre aqui
	registerProcessor(method: string, processor: PaymentProcessor): void {
		this.processors.set(method, processor);
	}
}

// 4. Uso
const factory = new PaymentProcessorFactory();
const processor = factory.getProcessor(payment.method);
const result = await processor.process(payment);
```

### Benefícios

- ✅ Adicionar novos recursos sem quebrar código existente
- ✅ Reduz risco de bugs em funcionalidades já testadas
- ✅ Facilita testes (testa cada implementação isoladamente)

---

## 3️⃣ LISKOV SUBSTITUTION PRINCIPLE (LSP)

> "Objetos de uma classe derivada devem poder substituir objetos da classe base sem quebrar o programa"

### Conceito

Se você tem uma classe base e classes derivadas, deve poder usar qualquer derivada no lugar da base sem problemas.

### Aplicação Prática

#### ❌ RUIM - Violação de LSP

```typescript
class Rectangle {
	constructor(
		protected width: number,
		protected height: number,
	) {}

	setWidth(width: number): void {
		this.width = width;
	}

	setHeight(height: number): void {
		this.height = height;
	}

	getArea(): number {
		return this.width * this.height;
	}
}

// Square herda de Rectangle, mas viola LSP
class Square extends Rectangle {
	setWidth(width: number): void {
		this.width = width;
		this.height = width; // Modifica comportamento inesperado!
	}

	setHeight(height: number): void {
		this.width = height; // Modifica comportamento inesperado!
		this.height = height;
	}
}

// Problema: código que funciona com Rectangle quebra com Square
function renderRectangle(rect: Rectangle) {
	rect.setWidth(5);
	rect.setHeight(4);
	console.log(rect.getArea()); // Espera 20, mas Square retorna 16!
}
```

#### ✅ BOM - Respeitando LSP

```typescript
// Classe abstrata base
abstract class Shape {
	abstract getArea(): number;

	setColor(color: string): this {
		// Comportamento comum
		return this;
	}

	render(area: number): void {
		// Renderiza a forma
	}
}

// Implementações independentes
class Rectangle extends Shape {
	constructor(
		private width: number,
		private height: number,
	) {
		super();
	}

	getArea(): number {
		return this.width * this.height;
	}
}

class Square extends Shape {
	constructor(private length: number) {
		super();
	}

	getArea(): number {
		return this.length * this.length;
	}
}

// Funciona com qualquer Shape
function renderShapes(shapes: Shape[]) {
	shapes.forEach((shape) => {
		const area = shape.getArea();
		shape.render(area);
	});
}

const shapes = [new Rectangle(4, 5), new Square(5)];
renderShapes(shapes); // Funciona perfeitamente!
```

### Benefícios

- ✅ Polimorfismo funciona corretamente
- ✅ Código mais previsível
- ✅ Facilita extensão do sistema

---

## 4️⃣ INTERFACE SEGREGATION PRINCIPLE (ISP)

> "Clientes não devem ser forçados a depender de interfaces que não usam"

### Conceito

Prefira várias interfaces específicas a uma interface geral.
Não force classes a implementar métodos que não precisam.

### Aplicação Prática

#### ❌ RUIM - Interface Monolítica

```typescript
// Interface muito grande
interface SmartPrinter {
	print(): void;
	fax(): void;
	scan(): void;
	staple(): void;
	duplex(): void;
}

// Impressora simples é forçada a implementar tudo
class EconomicPrinter implements SmartPrinter {
	print(): void {
		// OK
	}

	fax(): void {
		throw new Error("Não suportado"); // Forçado a implementar!
	}

	scan(): void {
		throw new Error("Não suportado"); // Forçado a implementar!
	}

	staple(): void {
		throw new Error("Não suportado"); // Forçado a implementar!
	}

	duplex(): void {
		throw new Error("Não suportado"); // Forçado a implementar!
	}
}
```

#### ✅ BOM - Interfaces Segregadas

```typescript
// Interfaces pequenas e focadas
interface Printer {
	print(): void;
}

interface Fax {
	fax(): void;
}

interface Scanner {
	scan(): void;
}

interface Stapler {
	staple(): void;
}

// Impressora completa implementa tudo
class AllInOnePrinter implements Printer, Fax, Scanner, Stapler {
	print(): void {
		// Implementa
	}

	fax(): void {
		// Implementa
	}

	scan(): void {
		// Implementa
	}

	staple(): void {
		// Implementa
	}
}

// Impressora simples implementa apenas o necessário
class EconomicPrinter implements Printer {
	print(): void {
		// Implementa apenas print
	}
}
```

### Benefícios

- ✅ Classes mais simples e focadas
- ✅ Menos acoplamento
- ✅ Mais fácil de testar

---

## 5️⃣ DEPENDENCY INVERSION PRINCIPLE (DIP)

> "Dependa de abstrações, não de implementações concretas"

### Conceito

- Módulos de alto nível não devem depender de módulos de baixo nível
- Ambos devem depender de abstrações
- Abstrações não devem depender de detalhes

### Aplicação Prática

#### ❌ RUIM - Dependência Concreta

```typescript
// Composable depende diretamente de uma implementação específica
export const useUsers = () => {
	const apiClient = new SupabaseClient(); // Dependência concreta!

	const fetchUsers = async () => {
		const { data } = await apiClient.from("users").select("*");
		return data;
	};

	return { fetchUsers };
};

// Difícil de testar, acoplado a uma implementação específica
```

#### ✅ BOM - Dependência de Abstração

```typescript
// 1. Interface abstrata (contrato)
interface UserRepository {
	findAll(): Promise<User[]>;
	findById(id: string): Promise<User | null>;
	create(user: CreateUserData): Promise<User>;
	update(id: string, data: UpdateUserData): Promise<User>;
	delete(id: string): Promise<void>;
}

// 2. Implementação concreta (Supabase)
class SupabaseUserRepository implements UserRepository {
	constructor(private client: SupabaseClient) {}

	async findAll(): Promise<User[]> {
		const { data } = await this.client.from("users").select("*");
		return data || [];
	}

	async findById(id: string): Promise<User | null> {
		const { data } = await this.client.from("users").select("*").eq("id", id).single();
		return data;
	}

	// ... outros métodos
}

// 3. Composable depende da abstração
export const useUsers = (repository: UserRepository) => {
	const users = ref<User[]>([]);

	const fetchUsers = async () => {
		users.value = await repository.findAll();
	};

	return { users, fetchUsers };
};

// 4. Uso (injeção de dependência)
const client = new SupabaseClient();
const repository = new SupabaseUserRepository(client);
const { users, fetchUsers } = useUsers(repository);

// 5. Fácil de testar com mock
class MockUserRepository implements UserRepository {
	async findAll(): Promise<User[]> {
		return [{ id: "1", name: "Test User" }];
	}
	// ... outros métodos mockados
}

const mockRepo = new MockUserRepository();
const { users, fetchUsers } = useUsers(mockRepo); // Testa sem dependências externas!
```

### Benefícios

- ✅ Código desacoplado e flexível
- ✅ Fácil de testar (usa mocks)
- ✅ Fácil de trocar implementações

---

## 🎯 APLICAÇÃO PRÁTICA

### Estrutura Recomendada

```
src/
├── composables/
│   ├── core/
│   │   └── useAuth.ts          # SRP: Apenas autenticação
│   ├── data/
│   │   └── useUsers.ts         # SRP: Apenas dados de usuários
│   └── ui/
│       └── useModal.ts         # SRP: Apenas controle de modal
│
├── components/
│   ├── ui/
│   │   └── Button.vue          # SRP: Apenas renderizar botão
│   └── shared/
│       └── DataTable.vue       # SRP: Apenas renderizar tabela
│
lib/
├── repositories/               # DIP: Abstrações
│   ├── interfaces/
│   │   └── UserRepository.ts  # Interface abstrata
│   └── implementations/
│       └── ApiUserRepository.ts  # Implementação concreta
│
└── services/                   # OCP: Extensível
    ├── PaymentProcessor.ts     # Interface
    └── processors/
        ├── PixProcessor.ts
        └── CreditCardProcessor.ts
```

### Checklist SOLID

- [ ] Cada arquivo tem uma única responsabilidade? (SRP)
- [ ] Posso adicionar novos recursos sem modificar código existente? (OCP)
- [ ] Minhas classes derivadas podem substituir as bases? (LSP)
- [ ] Minhas interfaces são pequenas e focadas? (ISP)
- [ ] Dependo de abstrações, não de implementações? (DIP)

---

## 📚 RECURSOS ADICIONAIS

- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
- [SOLID Principles in TypeScript](https://khalilstemmler.com/articles/solid-principles/solid-typescript/)
- [Refactoring Guru - SOLID](https://refactoring.guru/design-patterns/typescript)

---

**Última atualização:** Fevereiro 2026
