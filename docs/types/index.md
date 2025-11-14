# index.ts (Types)

## 📄 Descrição

Módulo central de definições de tipos e interfaces do projeto. Contém enums e interfaces TypeScript utilizadas em toda a aplicação para tipagem forte e consistência de dados. Define estruturas de dados para corridas (rides), status de corridas e informações de reservas.

---

## 📚 Definições de Tipos

### **RideStatus (Enum)**

Enum que define os possíveis status de uma corrida no sistema.

```ts
enum RideStatus {
  COMPLETED = "completed",
  CANCELED = "canceled",
  PENDING = "pending"
}
```

**Valores:**
- `COMPLETED` → Corrida concluída com sucesso
- `CANCELED` → Corrida cancelada (por motorista ou passageiro)
- `PENDING` → Corrida pendente/aguardando confirmação

---

### **BookedRide (Interface)**

Interface que representa uma corrida reservada/agendada no sistema.

```ts
interface BookedRide {
  id: string;
  rideDetails: any;
  searchData: { departure: string; passengers: number };
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | RideStatus;
  role?: 'driver' | 'passenger';
  sortDate?: number;
}
```

#### Propriedades

**id: string**
- Identificador único da reserva/corrida

**rideDetails: any**
- Detalhes completos da corrida (horários, endereços, motorista, preço, etc.)
- Tipo genérico `any` para flexibilidade

**searchData: { departure: string; passengers: number }**
- Dados da busca que originaram esta reserva
- `departure`: Local de partida pesquisado
- `passengers`: Número de passageiros

**bookingDate: string**
- Data/hora em que a reserva foi realizada
- Formato: ISO string ou string formatada

**status: 'confirmed' | 'cancelled' | RideStatus**
- Status atual da reserva
- Pode ser string literal ou valor do enum `RideStatus`

**role?: 'driver' | 'passenger'**
- Papel do usuário atual na corrida
- `driver` → usuário é o motorista
- `passenger` → usuário é passageiro
- Opcional (pode não estar definido em algumas situações)

**sortDate?: number**
- Timestamp em milissegundos para ordenação de corridas
- Utilizado para ordenar corridas por data (mais recente primeiro)
- Opcional (fallback para `bookingDate` se não fornecido)

---

## 💡 Exemplos de Uso

### Usando RideStatus

```ts
import { RideStatus } from './types';

const status = RideStatus.PENDING;

if (status === RideStatus.COMPLETED) {
  console.log('Corrida concluída');
}
```

### Usando BookedRide

```ts
import type { BookedRide } from './types';

const booking: BookedRide = {
  id: '123',
  rideDetails: {
    id: 'ride-456',
    departureTime: '14:30',
    arrivalTime: '15:15',
    date: '31/12/2025',
    price: 'R$ 20,00',
    driverName: 'João Silva'
  },
  searchData: {
    departure: 'São Paulo',
    passengers: 2
  },
  bookingDate: '2025-12-31T10:00:00Z',
  status: 'confirmed',
  role: 'passenger',
  sortDate: 1735657200000
};
```

---

## 🔗 Links Relacionados

- [RideCard](../components/RideCard.md)
- [RidesList](../pages/RidesList.md)
- [DriverRideDetailsPage](../pages/DriverRideDetailsPage.md)
- [App.tsx](../App.md)
- [rideService](../services/rideService.md)

