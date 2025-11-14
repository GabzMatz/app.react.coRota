# RidesList

## 📄 Descrição

Página React responsável por exibir a lista completa de corridas do usuário (como motorista ou passageiro). Apresenta header "Minhas Corridas", lista de cards de corridas ordenadas por data (mais recente primeiro), estados de loading e empty state. Permite cancelar corridas com confirmação via modal e editar corridas (somente motorista). Para motoristas, permite clicar em corridas para ver detalhes com lista de passageiros.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**Conteúdo:**
- **Header:**
  - Componente Header com título "Minhas Corridas"

- **Estados:**
  - **Loading:** Spinner com mensagem "Carregando histórico de corridas..."
  - **Empty State:** Mensagem "Nenhuma reserva encontrada" com instruções
  - **Lista:** Array de RideCard componentes

- **Navegação:**
  - BottomNav fixa na parte inferior

- **Modal:**
  - ConfirmModal para confirmação de cancelamento

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Propriedades

#### **onTabChange?: (tab: string) => void**
Callback chamado ao trocar de aba na navegação inferior.

#### **bookedRides?: BookedRide[]**
Array de corridas reservadas/agendadas. Padrão: `[]`.

#### **onCancelBooking?: (bookingId: string) => void**
Callback chamado ao confirmar cancelamento de corrida.

#### **onEditRide?: (rideId: string) => void**
Callback chamado ao clicar em editar corrida (somente motorista).

#### **isLoading?: boolean**
Indica se está carregando histórico de corridas. Padrão: `false`.

#### **onViewRideDetails?: (ride: BookedRide) => void**
Callback chamado ao clicar em uma corrida (somente para motorista).

---

### 🧠 Estados Internos

#### **showConfirmModal: boolean**
Controla visibilidade do modal de confirmação de cancelamento.

#### **rideToCancel: string | null**
ID da corrida que será cancelada (armazenado temporariamente).

---

### 🧠 Métodos

#### **handleTabChange(tab: string): void**
Propaga mudança de aba para componente parent.

#### **handleEdit(rideId: string): void**
Propaga ação de editar corrida para componente parent.

#### **handleViewDetails(ride: BookedRide): void**
Propaga ação de visualizar detalhes da corrida para componente parent (somente motorista).

#### **handleCancel(rideId: string): void**
Abre modal de confirmação de cancelamento e armazena ID da corrida.

#### **confirmCancel(): void**
Confirma cancelamento e chama `onCancelBooking` com ID armazenado. Fecha modal e limpa estado.

#### **closeModal(): void**
Fecha modal de confirmação sem confirmar ação.

---

### 🔒 Lógica Interna

#### **Ordenação**
As corridas são ordenadas por `sortDate` em ordem decrescente (mais recente primeiro). Se `sortDate` não existir, usa 0 como fallback.

```ts
const activeRides = bookedRides.sort((a, b) => {
  const dateA = a.sortDate || 0;
  const dateB = b.sortDate || 0;
  return dateB - dateA; // Ordem decrescente
});
```

#### **Renderização Condicional**
- Se `isLoading` → Mostra spinner
- Se `activeRides.length === 0` → Mostra empty state
- Caso contrário → Mostra lista de RideCard

#### **Callbacks de RideCard**
- `onClick` → Chamado apenas se `role === 'driver'`, chama `handleViewDetails`
- `onEdit` → Chama `handleEdit` com ID da corrida
- `onCancel` → Chama `handleCancel` com ID da reserva

---

## 🔗 Dependências

- **React 19.1.1**
- **Header** - Componente de cabeçalho
- **RideCard** - Componente de card de corrida
- **BottomNav** - Navegação inferior
- **ConfirmModal** - Modal de confirmação
- **types** - Tipo BookedRide

---

## 🔗 Links Relacionados

- [RideCard](../components/RideCard.md)
- [Header](../components/Header.md)
- [ConfirmModal](../components/ConfirmModal.md)
- [DriverRideDetailsPage](./DriverRideDetailsPage.md)
- [App.tsx](../App.md)

