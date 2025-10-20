# 🚗 Corota-App

📋 **Descrição**

Aplicação web desenvolvida em React com TypeScript e Vite para o projeto Rides App, uma plataforma mobile-first que conecta motoristas e passageiros para o compartilhamento de caronas.

Seu objetivo é reduzir custos de transporte, diminuir a emissão de poluentes e incentivar a mobilidade urbana sustentável por meio do uso inteligente de rotas e horários compatíveis entre motoristas e passageiros.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos e consistentes
- **Leaflet** - Biblioteca de mapas interativos
- **React Router** - Roteamento para aplicações React

## ✨ Funcionalidades

### 🔍 **Busca de Caronas**
- Interface intuitiva para buscar caronas disponíveis
- Filtros por localização e horário
- Resultados em tempo real

### 🚙 **Criação de Caronas**
- **Seleção de Partida**: Busca inteligente de endereços
- **Seleção de Destino**: Autocomplete com sugestões
- **Visualização da Rota**: Mapa interativo com roteamento
- **Seleção de Data**: Calendário intuitivo
- **Seleção de Horário**: Interface de tempo amigável
- **Número de Passageiros**: Contador com limite de 4 pessoas
- **Definição de Preço**: Seletor de valor da carona

### 📱 **Interface Mobile-First**
- Design responsivo otimizado para dispositivos móveis
- Navegação por abas intuitiva
- Componentes reutilizáveis e modulares

## 🛠️ Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd rides-app
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:5173
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── AddressSuggestions.tsx
│   ├── BottomNav.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── SearchPage.tsx
│   ├── CreatePage.tsx
│   ├── DateSelectionPage.tsx
│   ├── TimeSelectionPage.tsx
│   ├── PassengerSelectionPage.tsx
│   ├── PriceSelectionPage.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useAddressSearch.ts
│   └── useTripData.ts
├── types/              # Definições de tipos TypeScript
│   └── index.ts
└── assets/             # Recursos estáticos
    ├── logo.png
    └── ...
```
## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 📱 Páginas Principais

### **Busca**
- Interface de busca com filtros
- Lista de caronas disponíveis
- Detalhes da carona selecionada

### **Criar Carona**
- **Partida**: Busca de endereço de origem
- **Destino**: Seleção de endereço de destino
- **Rota**: Visualização do trajeto no mapa
- **Data**: Calendário para seleção da data
- **Horário**: Interface de seleção de tempo
- **Passageiros**: Contador de número de vagas
- **Preço**: Definição do valor da carona

### **Minhas Caronas**
- Histórico de caronas criadas
- Status das caronas (ativa, finalizada, cancelada)

## 🚀 Deploy

Para fazer deploy em produção:

```bash
# Build da aplicação
npm run build

# Os arquivos estarão na pasta dist/
# Faça upload para seu servidor de hospedagem
``