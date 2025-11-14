# RideService

## 📄 Descrição

Service responsável por gerenciar todas as operações relacionadas a corridas (rides) no sistema, incluindo criação, busca, histórico, cancelamento e atualização. Atua como camada de comunicação entre os componentes da aplicação e a API backend para dados de corridas. Suporta operações tanto para motoristas quanto para passageiros.

---

## ⚙️ Funcionalidades

* [x] **Criar corrida**
  Registra uma nova corrida no sistema com dados de partida, destino, horários, preço e capacidade.

* [x] **Sugerir corridas**
  Busca corridas disponíveis baseado em coordenadas de partida e destino.

* [x] **Escolher corrida**
  Permite que um usuário escolha/confirme uma corrida como passageiro.

* [x] **Obter histórico de corridas**
  Busca todas as corridas de um usuário (como motorista ou passageiro).

* [x] **Cancelar como motorista**
  Cancela uma corrida quando o usuário é o motorista.

* [x] **Cancelar como passageiro**
  Cancela uma corrida quando o usuário é passageiro.

* [x] **Obter corrida por ID**
  Recupera detalhes completos de uma corrida específica.

* [x] **Atualizar corrida**
  Atualiza dados de uma corrida existente (horários, preço, capacidade, etc.).

---

## 🚀 Uso

```ts
import { rideService } from './services/rideService';

// Criar corrida
const novaCorrida = await rideService.createRide({
  driverId: 'user-123',
  departureLatLng: [-23.5505, -46.6333],
  destinationLatLng: [-23.5015, -46.4525],
  date: '2025-12-31',
  startTime: '14:30',
  endTime: '15:15',
  allSeats: 4,
  pricePerPassenger: 20.00,
  passengerIds: []
});

// Buscar corridas
const sugestoes = await rideService.suggestRides({
  departureLatLng: [-23.5505, -46.6333],
  destinationLatLng: [-23.5015, -46.4525],
  userId: 'user-123'
});

// Histórico
const historico = await rideService.getRideHistory('user-123');
```

---

## 📚 API

### **createRide(payload: CreateRideRequest): Promise<CreateRideResponse>**

Descrição: Cria uma nova corrida no sistema.

**Parâmetros:**
* `payload.driverId: string` → ID do motorista
* `payload.departureLatLng: [number, number]` → Coordenadas [lat, lng] de partida
* `payload.destinationLatLng: [number, number]` → Coordenadas [lat, lng] de destino
* `payload.date: string` → Data no formato YYYY-MM-DD
* `payload.startTime: string` → Horário de partida no formato HH:mm
* `payload.endTime: string` → Horário de chegada no formato HH:mm
* `payload.allSeats: number` → Total de assentos disponíveis
* `payload.pricePerPassenger: number` → Preço por passageiro
* `payload.passengerIds: string[]` → Array de IDs de passageiros (inicialmente vazio)

**Retorno:**
* `Promise<CreateRideResponse>` → Resposta com dados da corrida criada

**Autenticação:**
* Token opcional (se presente, será incluído no header)

---

### **suggestRides(payload: SuggestRidesRequest): Promise<SuggestRidesResponse>**

Descrição: Busca corridas disponíveis baseado em coordenadas.

**Parâmetros:**
* `payload.departureLatLng: [number, number]` → Coordenadas de partida
* `payload.destinationLatLng: [number, number]` → Coordenadas de destino
* `payload.userId: string` → ID do usuário buscando

**Retorno:**
* `Promise<SuggestRidesResponse>` → Array de corridas sugeridas

---

### **chooseRide(rideId: string | number, userId: string): Promise<any>**

Descrição: Confirma escolha de uma corrida como passageiro.

**Parâmetros:**
* `rideId: string | number` → ID da corrida
* `userId: string` → ID do usuário (passageiro)

**Retorno:**
* `Promise<any>` → Resposta da API

**Erros:**
* Lança erro se token não for encontrado

---

### **getRideHistory(userId: string): Promise<any[]>**

Descrição: Busca histórico completo de corridas de um usuário.

**Parâmetros:**
* `userId: string` → ID do usuário

**Retorno:**
* `Promise<any[]>` → Array de itens de histórico (inclui corrida e dados do usuário)

**Erros:**
* Lança erro se token não for encontrado
* Retorna array vazio em caso de erro de parsing

---

### **cancelAsDriver(rideId: string | number, userId: string): Promise<any>**

Descrição: Cancela corrida quando o usuário é motorista.

**Parâmetros:**
* `rideId: string | number` → ID da corrida
* `userId: string` → ID do motorista

**Retorno:**
* `Promise<any>` → Resposta da API

**Erros:**
* Lança erro se token não for encontrado

**Nota:** Endpoint contém typo "calcel" ao invés de "cancel".

---

### **cancelAsPassenger(rideId: string | number, userId: string): Promise<any>**

Descrição: Cancela corrida quando o usuário é passageiro.

**Parâmetros:**
* `rideId: string | number` → ID da corrida
* `userId: string` → ID do passageiro

**Retorno:**
* `Promise<any>` → Resposta da API

**Erros:**
* Lança erro se token não for encontrado

**Nota:** Endpoint contém typo "calcel" ao invés de "cancel".

---

### **getRideById(rideId: string | number): Promise<any>**

Descrição: Busca detalhes completos de uma corrida específica.

**Parâmetros:**
* `rideId: string | number` → ID da corrida

**Retorno:**
* `Promise<any>` → Dados completos da corrida

**Erros:**
* Lança erro se token não for encontrado

---

### **updateRide(rideId: string | number, payload: CreateRideRequest): Promise<any>**

Descrição: Atualiza dados de uma corrida existente.

**Parâmetros:**
* `rideId: string | number` → ID da corrida a ser atualizada
* `payload: CreateRideRequest` → Dados atualizados (mesma estrutura de createRide)

**Retorno:**
* `Promise<any>` → Resposta da API

**Erros:**
* Lança erro se token não for encontrado

---

## 📝 Interfaces

### **CreateRideRequest**

```ts
interface CreateRideRequest {
  driverId: string;
  departureLatLng: [number, number];
  destinationLatLng: [number, number];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  allSeats: number;
  pricePerPassenger: number;
  passengerIds: string[];
}
```

### **CreateRideResponse**

```ts
interface CreateRideResponse {
  message?: string;
  data?: any;
}
```

### **SuggestRidesRequest**

```ts
interface SuggestRidesRequest {
  departureLatLng: [number, number];
  destinationLatLng: [number, number];
  userId: string;
}
```

### **SuggestRidesResponse**

```ts
interface SuggestRidesResponse {
  data?: any[];
  message?: string;
}
```

---

## ⚙️ Configurações

- **Base URL:** `https://us-central1-corota-fe133.cloudfunctions.net/api`
- **Endpoints:**
  - `POST /ride` → Criar corrida
  - `POST /ride/suggest-rides` → Sugerir corridas
  - `PUT /ride/{rideId}/choose/{userId}` → Escolher corrida
  - `GET /ride-history/user/{userId}` → Histórico
  - `PUT /ride/{rideId}/calcel-driver/{userId}` → Cancelar como motorista
  - `PUT /ride/{rideId}/calcel-passenger/{userId}` → Cancelar como passageiro
  - `GET /ride/{rideId}` → Obter corrida
  - `PUT /ride/{rideId}` → Atualizar corrida

---

## 🔗 Links Relacionados

- [App.tsx](../App.md)
- [CreatePage](../pages/CreatePage.md)
- [RidesList](../pages/RidesList.md)
- [SearchResultsPage](../pages/SearchResultsPage.md)
- [DriverRideDetailsPage](../pages/DriverRideDetailsPage.md)

