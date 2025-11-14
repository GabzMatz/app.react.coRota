# AuthService

## 📄 Descrição

Service responsável por gerenciar a autenticação de usuários no sistema, incluindo operações de login, logout, validação de tokens e gerenciamento de sessão. Atua como camada de comunicação entre os componentes da aplicação e a API backend para autenticação. Gerencia tokens JWT armazenados no localStorage com controle de expiração.

---

## ⚙️ Funcionalidades

* [x] **Login de usuário**
  Autentica usuário com email corporativo e senha, retornando token JWT.

* [x] **Gerenciamento de token**
  Salva, recupera e remove tokens do localStorage.

* [x] **Validação de sessão**
  Verifica se o usuário está autenticado e se o token ainda é válido.

* [x] **Controle de expiração**
  Gerencia tempo de validade do token (1 hora) e verifica expiração.

* [x] **Logout**
  Remove token e dados de autenticação do localStorage.

* [x] **Headers de autenticação**
  Retorna headers HTTP configurados com token Bearer para requisições autenticadas.

---

## 🚀 Uso

Injeção e utilização do service:

```ts
import { authService } from './services/authService';

// Login
const credentials = {
  corporateEmail: 'user@company.com',
  password: 'senha123'
};

try {
  const response = await authService.login(credentials);
  console.log('Token:', response.token);
} catch (error) {
  console.error('Erro no login:', error);
}

// Verificar autenticação
const isAuth = authService.isAuthenticated();

// Logout
authService.logout();

// Obter headers para requisições
const headers = authService.getAuthHeaders();
```

---

## 📚 API

### **login(credentials: LoginRequest): Promise<LoginResponse>**

Descrição: Autentica o usuário na API e salva o token automaticamente.

**Parâmetros:**
* `credentials.corporateEmail: string` → Email corporativo do usuário
* `credentials.password: string` → Senha do usuário

**Retorno:**
* `Promise<LoginResponse>` → Objeto contendo `token`, `id` e `email`

**Erros:**
* Lança `Error` se a requisição falhar ou credenciais inválidas

---

### **logout(): void**

Descrição: Remove token e timestamp do localStorage, efetivando logout.

**Parâmetros:**
* Nenhum

**Retorno:**
* `void`

---

### **isAuthenticated(): boolean**

Descrição: Verifica se o usuário está autenticado e se o token é válido.

**Parâmetros:**
* Nenhum

**Retorno:**
* `boolean` → `true` se autenticado e token válido, `false` caso contrário

---

### **getToken(): string | null**

Descrição: Obtém o token JWT armazenado no localStorage.

**Parâmetros:**
* Nenhum

**Retorno:**
* `string | null` → Token JWT ou `null` se não existir

---

### **setToken(token: string): void**

Descrição: Salva o token no localStorage e registra timestamp de emissão.

**Parâmetros:**
* `token: string` → Token JWT a ser armazenado

**Retorno:**
* `void`

---

### **removeToken(): void**

Descrição: Remove token e timestamp do localStorage.

**Parâmetros:**
* Nenhum

**Retorno:**
* `void`

---

### **isTokenExpired(): boolean**

Descrição: Verifica se o token expirou (validade de 1 hora).

**Parâmetros:**
* Nenhum

**Retorno:**
* `boolean` → `true` se expirado, `false` caso contrário

---

### **getTokenExpiryTime(): number | null**

Descrição: Retorna timestamp de expiração do token.

**Parâmetros:**
* Nenhum

**Retorno:**
* `number | null` → Timestamp de expiração ou `null` se não houver token

---

### **getAuthHeaders(): Record<string, string>**

Descrição: Retorna headers HTTP configurados com token Bearer para requisições autenticadas.

**Parâmetros:**
* Nenhum

**Retorno:**
* `Record<string, string>` → Objeto com `Content-Type` e `Authorization` (se token existir)

---

## 🔒 Métodos Privados

### **getTokenIssuedAt(): number | null**

Obtém timestamp de quando o token foi emitido do localStorage.

---

## 📝 Interfaces

### **LoginRequest**

```ts
interface LoginRequest {
  corporateEmail: string;
  password: string;
}
```

### **LoginResponse**

```ts
interface LoginResponse {
  token: string;
  id: string;
  email: string;
}
```

### **AuthError**

```ts
interface AuthError {
  message: string;
  status?: number;
}
```

---

## ⚙️ Configurações

- **Base URL:** `https://us-central1-corota-fe133.cloudfunctions.net/api`
- **Token Validity:** 60 minutos (3600000ms)
- **Storage Keys:**
  - `authToken` → Token JWT
  - `authTokenIssuedAt` → Timestamp de emissão

---

## 🔗 Links Relacionados

- [App.tsx](../App.md)
- [LoginPage](../pages/LoginPage.md)
- [RegisterPage](../pages/RegisterPage.md)

