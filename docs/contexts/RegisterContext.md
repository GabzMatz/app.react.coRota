# RegisterContext

## 📄 Descrição

Contexto React responsável por gerenciar dados do fluxo de registro de usuário em múltiplas etapas (3 passos). Armazena e sincroniza dados de empresa, dados pessoais e dados de endereço durante o processo de cadastro. Permite atualização parcial de dados por etapa e limpeza completa dos dados.

---

## ⚙️ Funcionalidades

* [x] **Armazenar dados de registro**
  Mantém estado com todos os dados das 3 etapas de registro.

* [x] **Atualizar dados por etapa**
  Permite atualizar dados específicos de uma etapa (step1, step2, step3).

* [x] **Limpar dados**
  Reseta todos os dados para valores iniciais.

* [x] **Obter dados completos**
  Retorna todos os dados armazenados.

* [x] **Armazenar respostas da API**
  Permite salvar objetos criados na API (endereço, usuário, empresa).

---

## 🚀 Uso

### Provider

```tsx
import { RegisterProvider } from './contexts/RegisterContext';

function App() {
  return (
    <RegisterProvider>
      {/* Sua aplicação */}
    </RegisterProvider>
  );
}
```

### Hook

```tsx
import { useRegister } from './contexts/RegisterContext';

function RegisterStep1() {
  const { registerData, updateRegisterData } = useRegister();

  const handleSubmit = (data) => {
    updateRegisterData('step1', {
      empresa: data.empresa,
      cpf: data.cpf,
      email: data.email
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulário */}
    </form>
  );
}
```

---

## 📚 API

### **useRegister()**

Descrição: Hook para acessar dados e métodos do contexto de registro.

**Parâmetros:**
* Nenhum

**Retorno:**
* `RegisterContextType` → Objeto com dados e métodos

**Erros:**
* Lança erro se usado fora de `RegisterProvider`

---

### **updateRegisterData(step: 'step1' | 'step2' | 'step3', data: Partial<RegisterData>): void**

Descrição: Atualiza dados de uma etapa específica do registro.

**Parâmetros:**
* `step: 'step1' | 'step2' | 'step3'` → Etapa a ser atualizada
* `data: Partial<RegisterData>` → Dados parciais a serem atualizados (merge com dados existentes)

**Retorno:**
* `void`

**Comportamento:**
* Faz merge dos novos dados com dados existentes
* `step` é ignorado (apenas usado para organização lógica)
* Permite atualizar qualquer campo de qualquer etapa

---

### **clearRegisterData(): void**

Descrição: Limpa todos os dados de registro, resetando para valores iniciais.

**Parâmetros:**
* Nenhum

**Retorno:**
* `void`

---

### **getCompleteData(): RegisterData**

Descrição: Retorna todos os dados de registro armazenados.

**Parâmetros:**
* Nenhum

**Retorno:**
* `RegisterData` → Objeto completo com todos os dados

---

## 📝 Interfaces

### **RegisterContextType**

```ts
interface RegisterContextType {
  registerData: RegisterData;
  updateRegisterData: (step: 'step1' | 'step2' | 'step3', data: Partial<RegisterData>) => void;
  clearRegisterData: () => void;
  getCompleteData: () => RegisterData;
}
```

### **RegisterData**

```ts
interface RegisterData {
  // Passo 1 - Dados da empresa
  empresa: string;
  cpf: string;
  email: string;
  
  // Passo 2 - Dados pessoais
  nomeCompleto: string;
  telefone: string;
  possuiCarro: string;
  dadosCarro: string;
  nomeUsuario: string;
  senha: string;
  confirmarSenha: string;
  
  // Passo 3 - Dados de endereço
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  
  // Respostas da API
  createdAddress?: AddressCreateResponse;
  createdUser?: UserRegisterResponse;
  selectedCompany?: Company;
}
```

---

## 🔗 Dependências

- **React 19.1.1** - createContext, useContext, useState
- **AddressService** - Tipo AddressCreateResponse
- **UserService** - Tipo UserRegisterResponse
- **CompanyService** - Tipo Company

---

## 🔗 Links Relacionados

- [RegisterPage](../pages/RegisterPage.md)
- [RegisterStep2Page](../pages/RegisterStep2Page.md)
- [RegisterStep3Page](../pages/RegisterStep3Page.md)
- [addressService](../services/addressService.md)
- [userService](../services/userService.md)
- [companyService](../services/companyService.md)

