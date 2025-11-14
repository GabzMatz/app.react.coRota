# BottomNav

## 📄 Descrição

Componente React responsável por exibir a barra de navegação inferior fixa da aplicação. Apresenta cinco abas principais: Pesquisa, Criar, Rotas (com logo customizado), Mensagens e Perfil. Permite navegação entre diferentes seções da aplicação através de callbacks. Utiliza ícones da biblioteca Lucide React e um logo personalizado da aplicação.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**Conteúdo:**
- Barra de navegação fixa na parte inferior da tela
- Cinco botões de navegação:
  1. **Pesquisa** - ícone de lupa (Search)
  2. **Criar** - ícone de mais (Plus)
  3. **Rotas** - logo personalizado da aplicação
  4. **Mensagens** - ícone de balão de mensagem (MessageCircle)
  5. **Perfil** - ícone de usuário (User)
- Cada botão exibe ícone e label abaixo
- Destaque visual para a aba ativa (não implementado no componente, pode ser controlado pelo parent)

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Propriedades

#### **activeTab?: string**
Aba atualmente ativa (opcional). Utilizado para destacar visualmente a aba selecionada (funcionalidade pode ser implementada no componente parent).

#### **onTabChange?: (tab: string) => void**
Callback chamado quando uma aba é clicada. Recebe o ID da aba como parâmetro.

---

### 🔒 Componente Interno

#### **LogoIcon**
Componente funcional que renderiza o logo personalizado da aplicação.

**Props:**
- `size?: number` → Tamanho do logo (padrão: 28)
- `className?: string` → Classes CSS adicionais

---

### 🧠 Métodos

#### **handleTabClick(tabId: string)**
Método interno que chama `onTabChange` quando uma aba é clicada.

---

## 📋 Abas Disponíveis

1. **search** - Pesquisa de corridas
2. **create** - Criar nova corrida
3. **routes** - Minhas corridas/rotas
4. **messages** - Mensagens (não implementado)
5. **profile** - Perfil do usuário

---

## 🎨 Estilização

- **Posicionamento:** Fixo na parte inferior (`fixed bottom-0 left-0 right-0`)
- **Background:** Cinza claro (`bg-gray-100`)
- **Borda:** Superior (`border-t border-gray-300`)
- **Botões:** Transparentes, cor azul (`text-blue-600`), altura mínima de 60px
- **Layout:** Flexbox com espaçamento uniforme (`justify-around`)
- **Ícones:** Tamanho 22px (Logo personalizado tem tamanho configurável)
- **Labels:** Texto pequeno, negrito (`text-xs font-medium`)

---

## 🔗 Dependências

- **React 19.1.1**
- **lucide-react** - Ícones (Search, Plus, MessageCircle, User)
- **assets/logo.png** - Logo personalizado da aplicação
- **Tailwind CSS** - Estilização

---

## 🔗 Links Relacionados

- [App.tsx](../App.md)
- [SearchPage](../pages/SearchPage.md)
- [CreatePage](../pages/CreatePage.md)
- [RidesList](../pages/RidesList.md)
- [ProfilePage](../pages/ProfilePage.md)

