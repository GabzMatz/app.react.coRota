# Card

## 📄 Descrição

Componente React reutilizável responsável por renderizar um contêiner de card com estilização consistente. Fornece dois componentes exportados: `Card` (container principal) e `CardContent` (conteúdo interno com padding). Aceita todos os atributos HTML padrão de div, permitindo funcionalidades como onClick, className customizada e propagação de eventos.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**Card:**
- Container div com classes Tailwind para card:
  - Background cinza claro (`bg-gray-100`)
  - Bordas arredondadas (`rounded-lg`)
  - Sombra sutil (`shadow-sm`)
  - Borda cinza (`border border-gray-300`)

**CardContent:**
- Container div interno com padding (`p-5`)
- Permite classes CSS customizadas via prop `className`

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Propriedades

#### **Card Props**

Estende `React.HTMLAttributes<HTMLDivElement>`, permitindo todos os atributos HTML padrão de div.

- `children: React.ReactNode` → Conteúdo do card
- `className?: string` → Classes CSS adicionais (merge com classes padrão)

#### **CardContent Props**

Mesma estrutura que `Card` props.

- `children: React.ReactNode` → Conteúdo interno do card
- `className?: string` → Classes CSS adicionais (merge com classes padrão)

---

### 🚀 Funcionalidade

Ambos os componentes são wrappers simples que aplicam estilização consistente e permitem propagação de atributos HTML (incluindo eventos como onClick, onMouseOver, etc.).

---

## 🎨 Estilização

### Card
- Background: `bg-gray-100`
- Border radius: `rounded-lg` (0.5rem)
- Shadow: `shadow-sm` (sombra pequena)
- Border: `border border-gray-300`

### CardContent
- Padding: `p-5` (1.25rem em todos os lados)

---

## 💡 Exemplos de Uso

```tsx
// Card simples
<Card>
  <CardContent>
    <p>Conteúdo do card</p>
  </CardContent>
</Card>

// Card clicável
<Card onClick={() => console.log('Card clicado!')}>
  <CardContent>
    <p>Card interativo</p>
  </CardContent>
</Card>

// Card com classes customizadas
<Card className="mx-4 p-1">
  <CardContent className="p-4">
    <p>Card customizado</p>
  </CardContent>
</Card>
```

---

## 🔗 Dependências

- **React 19.1.1**
- **Tailwind CSS** - Estilização

---

## 🔗 Links Relacionados

- [RideCard](./RideCard.md)
- [SearchResultCard](./SearchResultCard.md)
- [ConfirmModal](./ConfirmModal.md)

