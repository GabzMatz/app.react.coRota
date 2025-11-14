# ConfirmModal

## 📄 Descrição

Componente React responsável por exibir um modal de confirmação reutilizável. Utilizado para confirmar ações críticas do usuário, como cancelamento de corridas. Apresenta uma sobreposição escura e um card centralizado com título, mensagem e botões de ação (confirmar/cancelar). Suporta customização de textos dos botões.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**Conteúdo:**
- Overlay escuro com opacidade (`bg-black/80`) cobrindo toda a tela
- Modal centralizado com:
  - Header com título e botão de fechar (X)
  - Mensagem de confirmação
  - Dois botões: Cancelar (esquerda) e Confirmar (direita)

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Propriedades

#### **isOpen: boolean**
Controla se o modal está visível. Se `false`, o componente não renderiza nada.

#### **onClose: () => void**
Callback chamado ao clicar no botão "Cancelar" ou no botão X de fechar.

#### **onConfirm: () => void**
Callback chamado ao clicar no botão "Confirmar" (ação principal).

#### **title: string**
Título exibido no header do modal.

#### **message: string**
Mensagem de confirmação exibida no corpo do modal.

#### **confirmText?: string**
Texto do botão de confirmação. Padrão: `'Confirmar'`.

#### **cancelText?: string**
Texto do botão de cancelamento. Padrão: `'Cancelar'`.

---

### 🚀 Funcionalidade

O componente só renderiza quando `isOpen` é `true`. Ao clicar fora do modal (no overlay) ou nos botões, os callbacks apropriados são chamados.

---

## 🎨 Estilização

- **Overlay:** Preto com opacidade 80% (`bg-black/80`), posicionamento fixo
- **Modal:** Fundo cinza claro (`bg-gray-100`), bordas arredondadas (`rounded-lg`), sombra (`shadow-lg`)
- **Botão Cancelar:** Branco com borda cinza, hover cinza claro
- **Botão Confirmar:** Vermelho (`bg-red-600`), hover vermelho escuro (`bg-red-700`)

---

## 💡 Exemplo de Uso

```tsx
const [showModal, setShowModal] = useState(false);

<ConfirmModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={() => {
    // Executar ação
    handleCancelRide();
    setShowModal(false);
  }}
  title="Cancelar Carona"
  message="Tem certeza que deseja cancelar esta carona? Esta ação não pode ser desfeita."
  confirmText="Sim, Cancelar"
  cancelText="Não"
/>
```

---

## 🔗 Dependências

- **React 19.1.1**
- **lucide-react** - Ícone X
- **Tailwind CSS** - Estilização

---

## 🔗 Links Relacionados

- [RidesList](../pages/RidesList.md)
- [App.tsx](../App.md)

