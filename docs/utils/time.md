# time.ts

## 📄 Descrição

Módulo utilitário responsável por operações relacionadas a manipulação de tempo e horários. Fornece funções para adicionar minutos a horários no formato HH:mm, calcular durações de rotas a partir de dados do Leaflet armazenados no localStorage, e calcular horários de chegada baseados em horários de partida e duração estimada.

---

## ⚙️ Funcionalidades

* [x] **Adicionar minutos a horário**
  Adiciona um número específico de minutos a um horário no formato HH:mm.

* [x] **Obter duração da rota**
  Recupera duração estimada da rota em minutos armazenada no localStorage.

* [x] **Calcular horário de chegada**
  Calcula horário de chegada baseado no horário de partida e duração da rota.

---

## 🚀 Uso

```ts
import { addMinutesToTime, getRouteDurationMinutes, computeEndTimeFromLeaflet } from './utils/time';

// Adicionar 30 minutos a 14:30
const novoHorario = addMinutesToTime('14:30', 30);
// Retorna: '15:00'

// Obter duração da rota do localStorage
const duracao = getRouteDurationMinutes();
// Retorna: número de minutos ou 0

// Calcular horário de chegada
const horarioChegada = computeEndTimeFromLeaflet('14:30');
// Retorna: horário de partida + duração da rota
```

---

## 📚 API

### **addMinutesToTime(hhmm: string, minutesToAdd: number): string**

Descrição: Adiciona minutos a um horário no formato HH:mm, tratando overflow de horas e minutos.

**Parâmetros:**
* `hhmm: string` → Horário no formato HH:mm (ex: "14:30")
* `minutesToAdd: number` → Número de minutos a adicionar (pode ser negativo)

**Retorno:**
* `string` → Novo horário no formato HH:mm

**Comportamento:**
* Retorna string vazia se `hhmm` estiver vazio
* Usa 0 para horas/minutos inválidos
* Usa 0 para `minutesToAdd` inválido
* Trata overflow de minutos/horas automaticamente

**Exemplo:**
```ts
addMinutesToTime('23:45', 30); // Retorna: '00:15'
addMinutesToTime('14:30', -45); // Retorna: '13:45'
```

---

### **getRouteDurationMinutes(): number**

Descrição: Obtém a duração da rota em minutos armazenada no localStorage.

**Parâmetros:**
* Nenhum

**Retorno:**
* `number` → Duração em minutos ou 0 se não existir/for inválido

**Storage Key:**
* `routeDurationMinutes` → String contendo número de minutos

**Comportamento:**
* Retorna 0 se chave não existir
* Retorna 0 se valor não for um número válido
* Trata erros de parsing retornando 0

---

### **computeEndTimeFromLeaflet(startTime: string): string**

Descrição: Calcula horário de chegada baseado no horário de partida e duração da rota obtida do localStorage.

**Parâmetros:**
* `startTime: string` → Horário de partida no formato HH:mm

**Retorno:**
* `string` → Horário de chegada calculado no formato HH:mm

**Comportamento:**
* Obtém duração da rota via `getRouteDurationMinutes()`
* Adiciona duração ao horário de partida via `addMinutesToTime()`
* Se duração for 0, retorna o horário de partida inalterado

**Exemplo:**
```ts
// Se routeDurationMinutes = 45 no localStorage
computeEndTimeFromLeaflet('14:30'); // Retorna: '15:15'
```

---

## 🔒 Dependências Internas

- **localStorage API** - Para armazenar/recuperar duração da rota
- **Date API** - Para manipulação de datas e horários

---

## 📝 Formato de Dados

### Horário (HH:mm)
- Formato: `"HH:mm"` (ex: "14:30", "09:05")
- Horas: 00-23
- Minutos: 00-59

### Duração
- Armazenada como string no localStorage
- Deve ser um número válido em minutos
- Chave: `routeDurationMinutes`

---

## 🔗 Links Relacionados

- [App.tsx](../App.md)
- [RouteSelectedPage](../pages/RouteSelectedPage.md)
- [TimeSelectionPage](../pages/TimeSelectionPage.md)
- [CreatePage](../pages/CreatePage.md)

