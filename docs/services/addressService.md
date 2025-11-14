# AddressService

## 📄 Descrição

Service responsável por gerenciar operações relacionadas a endereços no sistema, incluindo criação de novos endereços e busca de endereços por ID. Atua como camada de comunicação entre os componentes da aplicação e a API backend para dados de endereços. Utilizado principalmente no fluxo de registro de usuários e criação de corridas.

---

## ⚙️ Funcionalidades

* [x] **Criar endereço**
  Registra um novo endereço no sistema com dados completos de localização.

* [x] **Obter endereço por ID**
  Busca dados completos de um endereço específico pelo seu ID.

---

## 🚀 Uso

```ts
import { addressService } from './services/addressService';

// Criar endereço
const novoEndereco = await addressService.createAddress({
  street: 'Rua das Flores',
  number: '123',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  lat: '-23.5505',
  long: '-46.6333',
  complement: 'Apto 45',
  isActive: true
});

// Obter endereço
const endereco = await addressService.getAddressById('address-123');
```

---

## 📚 API

### **createAddress(addressData: AddressCreateRequest): Promise<AddressCreateResponse>**

Descrição: Cria um novo endereço no sistema.

**Parâmetros:**
* `addressData.street: string` → Nome da rua
* `addressData.number: string` → Número do endereço
* `addressData.neighborhood: string` → Bairro
* `addressData.city: string` → Cidade
* `addressData.state: string` → Estado (UF)
* `addressData.zipCode: string` → CEP
* `addressData.lat: string` → Latitude
* `addressData.long: string` → Longitude
* `addressData.complement?: string` → Complemento (opcional)
* `addressData.isActive: boolean` → Indica se endereço está ativo

**Retorno:**
* `Promise<AddressCreateResponse>` → Resposta com dados do endereço criado

**Erros:**
* Lança `Error` se a requisição falhar
* Trata erros de conexão

**Autenticação:**
* Não requer autenticação (endpoint público)

---

### **getAddressById(addressId: string): Promise<AddressResponse>**

Descrição: Busca dados completos de um endereço específico.

**Parâmetros:**
* `addressId: string` → ID do endereço a ser buscado

**Retorno:**
* `Promise<AddressResponse>` → Dados completos do endereço

**Autenticação:**
* Token opcional (se presente, será incluído no header via `getAuthHeaders()`)

**Erros:**
* Lança `Error` se endereço não for encontrado
* Trata erros de conexão

---

## 📝 Interfaces

### **AddressCreateRequest**

```ts
interface AddressCreateRequest {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: string;
  long: string;
  complement?: string;
  isActive: boolean;
}
```

### **AddressCreateResponse**

```ts
interface AddressCreateResponse {
  message: string;
  data: {
    id: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    lat: string;
    long: string;
    complement?: string;
    isActive: boolean;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}
```

### **AddressResponse**

```ts
interface AddressResponse {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: string;
  long: string;
  complement?: string;
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}
```

### **AddressError**

```ts
interface AddressError {
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
  - `POST /address/create` → Criar endereço (público)
  - `GET /address/{addressId}` → Obter endereço (requer auth)

---

## 🔗 Links Relacionados

- [RegisterStep3Page](../pages/RegisterStep3Page.md)
- [DriverRideDetailsPage](../pages/DriverRideDetailsPage.md)
- [RegisterContext](../contexts/RegisterContext.md)

