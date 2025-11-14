# useTripData

## 📄 Descrição

Hook customizado React responsável por gerenciar dados de viagem/corrida no localStorage. Fornece funcionalidades para carregar, salvar, limpar e verificar dados completos de viagem. Mantém estado sincronizado entre componente e localStorage, facilitando persistência de dados de partida e destino durante o fluxo de criação de corridas.

---

## ⚙️ Funcionalidades

* [x] **Carregar dados da viagem**
  Recupera dados salvos do localStorage e atualiza o estado.

* [x] **Salvar dados da viagem**
  Persiste dados no localStorage e atualiza o estado.

* [x] **Limpar dados da viagem**
  Remove dados do localStorage (tripData, selectedAddress, selectedDestination) e zera o estado.

* [x] **Verificar dados completos**
  Verifica se há dados completos de partida e destino.

* [x] **Carregamento automático**
  Carrega dados do localStorage na inicialização do hook.

---

## 🚀 Uso

```tsx
import { useTripData } from './hooks/useTripData';

function MyComponent() {
  const { tripData, loadTripData, saveTripData, clearTripData, hasCompleteTripData } = useTripData();

  // Salvar dados
  const handleSave = () => {
    saveTripData({
      id: 'trip-123',
      departure: {
        latitude: -23.5505,
        longitude: -46.6333,
        address: 'São Paulo, SP',
        placeId: 'place-1'
      },
      destination: {
        latitude: -23.5015,
        longitude: -46.4525,
        address: 'Guarulhos, SP',
        placeId: 'place-2'
      },
      createdAt: new Date().toISOString()
    });
  };

  // Verificar se tem dados completos
  if (hasCompleteTripData()) {
    console.log('Dados completos:', tripData);
  }

  // Limpar dados
  const handleClear = () => {
    clearTripData();
  };
}
```

---

## 📚 API

### **Retorno do Hook**

O hook retorna um objeto com:

- `tripData: TripData | null` → Dados atuais da viagem ou null
- `loadTripData: () => TripData | null` → Função para carregar dados do localStorage
- `saveTripData: (data: TripData) => boolean` → Função para salvar dados
- `clearTripData: () => void` → Função para limpar dados
- `hasCompleteTripData: () => boolean` → Função para verificar dados completos

---

### **loadTripData(): TripData | null**

Descrição: Carrega dados da viagem do localStorage, parseia JSON e atualiza o estado.

**Parâmetros:**
* Nenhum

**Retorno:**
* `TripData | null` → Dados carregados ou null se não existir/erro

**Comportamento:**
* Busca chave `tripData` no localStorage
* Parseia JSON
* Atualiza estado interno
* Trata erros retornando null e logando no console

---

### **saveTripData(data: TripData): boolean**

Descrição: Salva dados da viagem no localStorage e atualiza o estado.

**Parâmetros:**
* `data: TripData` → Dados da viagem a serem salvos

**Retorno:**
* `boolean` → `true` se salvou com sucesso, `false` em caso de erro

**Comportamento:**
* Serializa dados para JSON
* Salva na chave `tripData` do localStorage
* Atualiza estado interno
* Trata erros retornando false e logando no console

---

### **clearTripData(): void**

Descrição: Remove todos os dados relacionados à viagem do localStorage e zera o estado.

**Parâmetros:**
* Nenhum

**Retorno:**
* `void`

**Storage Keys Removidas:**
* `tripData`
* `selectedAddress`
* `selectedDestination`

---

### **hasCompleteTripData(): boolean**

Descrição: Verifica se há dados completos de partida e destino.

**Parâmetros:**
* Nenhum

**Retorno:**
* `boolean` → `true` se `tripData`, `tripData.departure` e `tripData.destination` existirem

---

## 📝 Interfaces

### **TripData**

```ts
interface TripData {
  departure: TripLocation;
  destination: TripLocation;
  createdAt: string;
  id: string;
}
```

### **TripLocation**

```ts
interface TripLocation {
  latitude: number;
  longitude: number;
  address: string;
  placeId: string;
}
```

---

## ⚙️ Storage

### **Chaves utilizadas**

- `tripData` → JSON stringificado com dados completos da viagem
- `selectedAddress` → Dados de endereço de partida (removido em clearTripData)
- `selectedDestination` → Dados de endereço de destino (removido em clearTripData)

---

## 🔗 Dependências

- **React 19.1.1** - useState, useEffect
- **localStorage API** - Persistência de dados

---

## 🔗 Links Relacionados

- [CreatePage](../pages/CreatePage.md)
- [CreateDestinationPage](../pages/CreateDestinationPage.md)
- [App.tsx](../App.md)

