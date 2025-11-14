# CompanyService

## 📄 Descrição

Service responsável por gerenciar operações relacionadas a empresas no sistema, incluindo busca de empresas por nome e obtenção de dados de empresa por ID. Atua como camada de comunicação entre os componentes da aplicação e a API backend para dados de empresas. Utilizado principalmente no fluxo de registro de usuários para seleção da empresa.

---

## ⚙️ Funcionalidades

* [x] **Buscar empresas**
  Busca empresas no sistema baseado em termo de pesquisa (nome).

* [x] **Obter empresa por ID**
  Busca dados completos de uma empresa específica pelo seu ID.

---

## 🚀 Uso

```ts
import { companyService } from './services/companyService';

// Buscar empresas
const empresas = await companyService.searchCompanies('Tech Corp');
console.log(empresas); // Array de empresas

// Obter empresa por ID
const empresa = await companyService.getCompanyById('company-123');
console.log(empresa.name);
```

---

## 📚 API

### **searchCompanies(searchTerm: string): Promise<Company[]>**

Descrição: Busca empresas no sistema baseado em termo de pesquisa.

**Parâmetros:**
* `searchTerm: string` → Termo de busca (nome da empresa)

**Retorno:**
* `Promise<Company[]>` → Array de empresas encontradas

**Comportamento:**
* Retorna array vazio se `searchTerm` estiver vazio ou apenas espaços
* Busca é case-sensitive
* Endpoint público (não requer autenticação)

**Erros:**
* Lança `Error` se a requisição falhar
* Trata erros de conexão

---

### **getCompanyById(companyId: string): Promise<Company>**

Descrição: Busca dados completos de uma empresa específica.

**Parâmetros:**
* `companyId: string` → ID da empresa a ser buscada

**Retorno:**
* `Promise<Company>` → Dados completos da empresa

**Autenticação:**
* Token opcional (se presente, será incluído no header via `getAuthHeaders()`)

**Erros:**
* Lança `Error` se empresa não for encontrada
* Trata erros de conexão

---

## 📝 Interfaces

### **CompanySearchRequest**

```ts
interface CompanySearchRequest {
  name: string;
}
```

### **Company**

```ts
interface Company {
  id: string;
  name: string;
  addressId: string;
  usersEmails: string[];
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}
```

### **CompanySearchResponse**

```ts
interface CompanySearchResponse {
  data: Company[];
}
```

### **CompanyError**

```ts
interface CompanyError {
  message: string;
  status?: number;
}
```

---

## 🔒 Métodos Privados

### **getAuthHeaders(): Record<string, string>**

Obtém headers HTTP configurados com token Bearer para requisições autenticadas.

**Retorno:**
* `Record<string, string>` → Headers com `Content-Type` e `Authorization` (se token existir)

---

## ⚙️ Configurações

- **Base URL:** `https://us-central1-corota-fe133.cloudfunctions.net/api`
- **Endpoints:**
  - `POST /companies/search` → Buscar empresas (público)
  - `GET /companies/{companyId}` → Obter empresa (requer auth)

---

## 🔗 Links Relacionados

- [CompanyAutocomplete](../components/CompanyAutocomplete.md)
- [RegisterPage](../pages/RegisterPage.md)
- [RegisterContext](../contexts/RegisterContext.md)

