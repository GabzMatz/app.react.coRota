# UserService

## 📄 Descrição

Service responsável por gerenciar operações relacionadas a usuários no sistema, incluindo registro de novos usuários, obtenção de dados do usuário logado e busca de usuários por ID. Atua como camada de comunicação entre os componentes da aplicação e a API backend para dados de usuários.

---

## ⚙️ Funcionalidades

* [x] **Registrar usuário**
  Cria um novo usuário no sistema com dados pessoais, empresa e endereço.

* [x] **Obter usuário logado**
  Retorna informações do usuário autenticado baseado no token JWT.

* [x] **Obter usuário por ID**
  Busca dados completos de um usuário específico pelo seu ID.

---

## 🚀 Uso

```ts
import { userService } from './services/userService';

// Registrar novo usuário
const novoUsuario = await userService.registerUser({
  corporateEmail: 'user@company.com',
  cpf: '123.456.789-00',
  firstName: 'João',
  lastName: 'Silva',
  phone: '+5511999999999',
  password: 'senha123',
  companyId: 'company-123',
  addressId: 'address-456',
  hasCar: true,
  isActive: true
});

// Obter usuário logado
const me = await userService.getMe();
console.log('ID:', me.id, 'Email:', me.email);

// Obter usuário por ID
const usuario = await userService.getUserById('user-123');
```

---

## 📚 API

### **registerUser(userData: UserRegisterRequest): Promise<UserRegisterResponse>**

Descrição: Registra um novo usuário no sistema.

**Parâmetros:**
* `userData.corporateEmail: string` → Email corporativo do usuário
* `userData.cpf: string` → CPF do usuário
* `userData.firstName: string` → Primeiro nome
* `userData.lastName: string` → Sobrenome
* `userData.phone: string` → Telefone
* `userData.password: string` → Senha
* `userData.companyId: string` → ID da empresa
* `userData.addressId: string` → ID do endereço
* `userData.hasCar: boolean` → Indica se possui carro
* `userData.isActive: boolean` → Indica se usuário está ativo

**Retorno:**
* `Promise<UserRegisterResponse>` → Dados do usuário criado

**Erros:**
* Lança `Error` se a requisição falhar ou dados inválidos
* Trata erros de conexão

**Logs:**
* Console logs para debug (👤, 📡, ✅, ❌)

---

### **getMe(): Promise<MeResponse>**

Descrição: Obtém informações do usuário autenticado baseado no token JWT.

**Parâmetros:**
* Nenhum

**Retorno:**
* `Promise<MeResponse>` → Objeto com `id` e `email`

**Autenticação:**
* Utiliza headers de autenticação do `authService`
* Requer token válido no localStorage

**Erros:**
* Lança `Error` se token inválido ou usuário não encontrado

---

### **getUserById(userId: string): Promise<UserResponse>**

Descrição: Busca dados completos de um usuário específico.

**Parâmetros:**
* `userId: string` → ID do usuário a ser buscado

**Retorno:**
* `Promise<UserResponse>` → Dados completos do usuário

**Autenticação:**
* Token opcional (se presente, será incluído no header)

**Erros:**
* Lança `Error` se usuário não for encontrado

---

## 📝 Interfaces

### **UserRegisterRequest**

```ts
interface UserRegisterRequest {
  corporateEmail: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  companyId: string;
  addressId: string;
  hasCar: boolean;
  isActive: boolean;
}
```

### **UserRegisterResponse**

```ts
interface UserRegisterResponse {
  id: string;
  corporateEmail: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyId: string;
  addressId: string;
  hasCar: boolean;
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}
```

### **MeResponse**

```ts
interface MeResponse {
  id: string;
  email: string;
}
```

### **UserResponse**

```ts
interface UserResponse {
  corporateEmail: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  companyId: string;
  addressId: string;
  hasCar: boolean;
  isActive: boolean;
  carInfo?: string;
  id: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}
```

### **UserError**

```ts
interface UserError {
  message: string;
  status?: number;
}
```

---

## ⚙️ Configurações

- **Base URL:** `https://us-central1-corota-fe133.cloudfunctions.net/api`
- **Endpoints:**
  - `POST /users/register` → Registrar usuário
  - `GET /users/me` → Obter usuário logado
  - `GET /users/{userId}` → Obter usuário por ID

---

## 🔗 Dependências

- **authService** - Para headers de autenticação no método `getMe()`

---

## 🔗 Links Relacionados

- [authService](./authService.md)
- [RegisterPage](../pages/RegisterPage.md)
- [App.tsx](../App.md)
- [DriverRideDetailsPage](../pages/DriverRideDetailsPage.md)

