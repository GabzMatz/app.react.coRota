# Toast

## 📄 Descrição

Componente React responsável por exibir notificações toast (mensagens temporárias) na aplicação. Fornece dois componentes: `ToastItem` (item individual) e `ToastContainer` (container que gerencia múltiplos toasts). Suporta quatro tipos de toast: success, error, warning e info, cada um com ícone e cores apropriadas. Mensagens desaparecem automaticamente após 4 segundos.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**ToastItem:**
- Card com ícone, mensagem e botão de fechar
- Cores variam conforme o tipo (success=verde, error=vermelho, warning=amarelo, info=azul)
- Animação de entrada (`animate-slide-in`)

**ToastContainer:**
- Container fixo no canto superior direito
- Renderiza múltiplos toasts em coluna
- Só renderiza se houver toasts

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Propriedades

#### **ToastItem Props**

**toast: Toast**
- Objeto contendo `id`, `message` e `type`

**onRemove: (id: string) => void**
- Callback chamado ao remover toast (automático após 4s ou manual)

#### **ToastContainer Props**

**toasts: Toast[]**
- Array de toasts a serem exibidos

**onRemove: (id: string) => void**
- Callback para remover toast pelo ID

---

### 📝 Interfaces e Tipos

#### **Toast**

```ts
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
```

#### **ToastType**

```ts
type ToastType = 'success' | 'error' | 'info' | 'warning';
```

---

### 🧠 Métodos

#### **getIcon()**
Retorna o ícone apropriado baseado no tipo:
- Success: `CheckCircle` (verde)
- Error: `AlertCircle` (vermelho)
- Warning: `AlertTriangle` (amarelo)
- Info: `Info` (azul)

#### **getBgColor()**
Retorna classes CSS de background e borda baseadas no tipo.

---

### ⚙️ Funcionalidades

- **Auto-remoção:** Toast é removido automaticamente após 4 segundos via `useEffect`
- **Remoção manual:** Usuário pode fechar clicando no botão X
- **Posicionamento:** Fixo no topo direito (`fixed top-4 right-4`)
- **Z-index:** 9999 para ficar acima de outros elementos

---

## 🔗 Dependências

- **React 19.1.1**
- **lucide-react** - Ícones (CheckCircle, AlertCircle, Info, AlertTriangle)
- **Tailwind CSS** - Estilização

---

## 🔗 Links Relacionados

- [ToastContext](../contexts/ToastContext.md)
- [App.tsx](../App.md)

