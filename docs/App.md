# App.tsx

## 📄 Descrição

Componente principal da aplicação React responsável por gerenciar todo o estado global e navegação da aplicação de caronas. Atua como orquestrador central, controlando autenticação, fluxos de criação de corridas, busca de corridas, histórico, e renderização condicional de páginas baseado em abas e estados. Integra todos os serviços, contextos e componentes da aplicação.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**Renderização condicional baseada em:**
- Estado de autenticação (`isAuthenticated`)
- Modo de autenticação (`authMode`: 'register' | 'login')
- Etapa de registro (`registerStep`: 1 | 2 | 3)
- Aba ativa (`activeTab`: 'search' | 'create' | 'routes' | 'profile')
- Página atual (`currentPage`)
- Etapa de criação (`createStep`)

**Páginas renderizadas:**
- Páginas de autenticação (Login, Register em 3 etapas)
- Páginas de busca (SearchPage, SearchDestinationPage, SearchResultsPage, RideDetailsPage, BookingPage)
- Páginas de criação (CreatePage, CreateDestinationPage, RouteSelectedPage, DateSelectionPage, TimeSelectionPage, PassengerSelectionPage, PriceSelectionPage)
- Página de rotas (RidesList, DriverRideDetailsPage)
- Página de perfil (ProfilePage)

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Estados Principais

#### **Autenticação**
- `isAuthenticated: boolean` → Se usuário está autenticado
- `authMode: 'register' | 'login'` → Modo de autenticação atual
- `registerStep: 1 | 2 | 3` → Etapa do registro

#### **Navegação**
- `activeTab: string` → Aba ativa ('search', 'create', 'routes', 'profile')
- `currentPage: string` → Página atual dentro da aba
- `routesView: 'list' | 'driver-details'` → Visualização na aba de rotas

#### **Busca de Corridas**
- `searchData: { departure: string; passengers: number } | null` → Dados da busca
- `searchResults: any[]` → Resultados da busca
- `selectedRide: any | null` → Corrida selecionada

#### **Histórico de Corridas**
- `bookedRides: BookedRide[]` → Lista de corridas reservadas
- `completedRides: BookedRide[]` → Últimas 3 corridas concluídas
- `loadingRideHistory: boolean` → Estado de carregamento
- `loadingCompletedRides: boolean` → Estado de carregamento de concluídas

#### **Detalhes de Corrida (Motorista)**
- `selectedDriverRide: BookedRide | null` → Corrida selecionada pelo motorista
- `driverPassengers: DriverPassengerInfo[]` → Lista de passageiros
- `loadingDriverPassengers: boolean` → Estado de carregamento

#### **Fluxo de Criação**
- `createStep: 'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price'` → Etapa atual
- `createDate: string | null` → Data selecionada (YYYY-MM-DD)
- `createTime: string | null` → Horário selecionado (HH:mm)
- `createSeats: number | null` → Número de assentos
- `editingRideId: string | null` → ID da corrida sendo editada
- `editInitialDeparture: string` → Endereço de partida inicial (edição)
- `editInitialDestination: string` → Endereço de destino inicial (edição)
- `editInitialPrice: number | null` → Preço inicial (edição)

---

### 🧠 Métodos Principais

#### **Navegação**
- `handleTabChange(tab: string)` → Troca de aba
- `handlePageChange(page: string, data?: any)` → Navegação entre páginas
- `handleBack()` → Voltar para página anterior
- `handleCreateStepChange(step)` → Troca de etapa no fluxo de criação
- `handleCreateBack()` → Voltar etapa no fluxo de criação

#### **Autenticação**
- `handleSessionExpiration(message?: string)` → Trata expiração de sessão e faz logout

#### **Busca e Corridas**
- `fetchRideHistory()` → Carrega histórico de corridas do usuário
- `handleCancelBooking(bookingId: string)` → Cancela reserva de corrida
- `handleEditRide(rideId: string)` → Inicia edição de corrida
- `handleCreateRide(price: number)` → Cria ou atualiza corrida
- `handleViewDriverRideDetails(ride: BookedRide)` → Abre detalhes da corrida para motorista
- `handleCloseDriverRideDetails()` → Fecha detalhes da corrida

#### **Utilitários**
- `getDriverId(): Promise<string>` → Obtém ID do motorista logado
- `reverseGeocode(lat: number, lon: number): Promise<string>` → Converte coordenadas em endereço
- `resetCreateFlow()` → Reseta fluxo de criação

---

### 🔒 Métodos Auxiliares

#### **parseDateInput(value): Date | null**
Parseia diferentes formatos de data (Firestore timestamp, string, Date) para objeto Date.

#### **createDateFromPlainString(value: string): Date**
Cria Date a partir de string YYYY-MM-DD.

#### **isFirestoreTimestamp(value): boolean**
Verifica se valor é timestamp do Firestore.

---

## ⚙️ Effects (useEffect)

### **Carregamento de Histórico**
```ts
useEffect(() => {
  if (activeTab === 'routes') {
    fetchRideHistory();
  }
}, [activeTab, fetchRideHistory]);
```

### **Corridas Concluídas na Home**
```ts
useEffect(() => {
  // Carrega 3 últimas corridas concluídas para SearchPage
}, [activeTab, currentPage, isAuthenticated, getDriverId, reverseGeocode]);
```

### **Expiração de Sessão**
```ts
useEffect(() => {
  // Monitora expiração de token e faz logout automático
}, [isAuthenticated, handleSessionExpiration]);
```

---

## 🔗 Dependências

### **Contextos**
- `RegisterProvider` → Gerenciamento de dados de registro
- `ToastProvider` → Gerenciamento de notificações

### **Serviços**
- `authService` → Autenticação
- `rideService` → Operações de corridas
- `userService` → Operações de usuários

### **Utilitários**
- `computeEndTimeFromLeaflet` → Cálculo de horário de chegada

### **Páginas**
- Todas as páginas da aplicação (SearchPage, CreatePage, RidesList, etc.)

### **Hooks**
- `useToast` → Exibir notificações

---

## 📋 Fluxos Principais

### **1. Fluxo de Autenticação**
- Login → Registro (3 etapas) → Login novamente

### **2. Fluxo de Busca**
- SearchPage → SearchDestinationPage → SearchResultsPage → RideDetailsPage → BookingPage

### **3. Fluxo de Criação**
- CreatePage → CreateDestinationPage → RouteSelectedPage → DateSelectionPage → TimeSelectionPage → PassengerSelectionPage → PriceSelectionPage

### **4. Fluxo de Edição**
- Similar ao de criação, mas pré-preenche dados da corrida

### **5. Fluxo de Rotas (Motorista)**
- RidesList → (click em corrida) → DriverRideDetailsPage → (click em passageiro) → Modal com contato

---

## 🔗 Links Relacionados

- [main.tsx](./main.md)
- [authService](./services/authService.md)
- [rideService](./services/rideService.md)
- [userService](./services/userService.md)
- [ToastContext](./contexts/ToastContext.md)
- [RegisterContext](./contexts/RegisterContext.md)
- [SearchPage](./pages/SearchPage.md)
- [CreatePage](./pages/CreatePage.md)
- [RidesList](./pages/RidesList.md)

