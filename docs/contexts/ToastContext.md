# ToastContext

## 📄 Descrição

Contexto React responsável por gerenciar notificações toast (mensagens temporárias) em toda a aplicação. Fornece métodos para exibir diferentes tipos de toast (success, error, warning, info) e gerencia a lista de toasts ativos. Inclui componente `ToastContainer` integrado que renderiza os toasts automaticamente.

---

## ⚙️ Funcionalidades

* [x] **Exibir toast genérico**
  Exibe toast com tipo customizável.

* [x] **Exibir toast de sucesso**
  Método helper para exibir toast de sucesso.

* [x] **Exibir toast de erro**
  Método helper para exibir toast de erro.

* [x] **Exibir toast de aviso**
  Método helper para exibir toast de aviso.

* [x] **Exibir toast informativo**
  Método helper para exibir toast informativo.

* [x] **Remover toast**
  Remove toast da lista (chamado automaticamente após timeout).

* [x] **Gerenciamento de estado**
  Mantém lista de toasts ativos no estado.

---

## 🚀 Uso

### Provider

```tsx
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      {/* Sua aplicação */}
    </ToastProvider>
  );
}
```

### Hook

```tsx
import { useToast } from './contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo, showToast } = useToast();

  const handleAction = () => {
    try {
      // Executar ação
      showSuccess('Ação realizada com sucesso!');
    } catch (error) {
      showError('Erro ao executar ação');
    }
  };

  return (
    <button onClick={handleAction}>
      Executar Ação
    </button>
  );
}
```

---

## 📚 API

### **useToast()**

Descrição: Hook para acessar métodos do contexto de toast.

**Parâmetros:**
* Nenhum

**Retorno:**
* `ToastContextType` → Objeto com métodos de toast

**Erros:**
* Lança erro se usado fora de `ToastProvider`

---

### **showToast(message: string, type?: ToastType): void**

Descrição: Exibe toast com tipo customizável.

**Parâmetros:**
* `message: string` → Mensagem a ser exibida
* `type?: ToastType` → Tipo do toast (padrão: 'info')

**Retorno:**
* `void`

**Tipos disponíveis:**
* `'success'` → Verde com ícone de check
* `'error'` → Vermelho com ícone de alerta
* `'warning'` → Amarelo com ícone de triângulo
* `'info'` → Azul com ícone de informação

---

### **showSuccess(message: string): void**

Descrição: Helper para exibir toast de sucesso.

**Parâmetros:**
* `message: string` → Mensagem de sucesso

**Retorno:**
* `void`

---

### **showError(message: string): void**

Descrição: Helper para exibir toast de erro.

**Parâmetros:**
* `message: string` → Mensagem de erro

**Retorno:**
* `void`

---

### **showWarning(message: string): void**

Descrição: Helper para exibir toast de aviso.

**Parâmetros:**
* `message: string` → Mensagem de aviso

**Retorno:**
* `void`

---

### **showInfo(message: string): void**

Descrição: Helper para exibir toast informativo.

**Parâmetros:**
* `message: string` → Mensagem informativa

**Retorno:**
* `void`

---

## 📝 Interfaces

### **ToastContextType**

```ts
interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}
```

### **Toast**

```ts
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
```

### **ToastType**

```ts
type ToastType = 'success' | 'error' | 'info' | 'warning';
```

---

## 🔒 Métodos Privados

### **removeToast(id: string): void**

Remove toast da lista pelo ID. Chamado automaticamente após timeout de 4 segundos.

---

## ⚙️ Comportamento

- **ID Gerado:** Combinação de timestamp + string aleatória
- **Auto-remoção:** Toasts são removidos automaticamente após 4 segundos (via ToastItem)
- **Múltiplos toasts:** Suporta exibição de múltiplos toasts simultaneamente
- **Posicionamento:** Toasts são renderizados no topo direito da tela

---

## 🔗 Dependências

- **React 19.1.1** - createContext, useContext, useState, useCallback
- **Toast Container** - Componente para renderizar toasts

---

## 🔗 Links Relacionados

- [Toast](../components/Toast.md)
- [App.tsx](../App.md)

