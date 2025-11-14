# RideCard

## 📄 Descrição

Componente React responsável por exibir um card de corrida na lista de corridas do usuário. Apresenta informações essenciais da corrida como horários de partida e chegada, data, preço, nome do motorista com foto/avatar, status da corrida e botões de ação (editar e cancelar) quando aplicável. Suporta clique para abrir detalhes (somente para motoristas) e interações com botões sem interferência na navegação.

---

## 🎨 Estrutura do Template (HTML)

### O que o template exibe

**Conteúdo:**
- **Horários:**
  - Horário de partida (text-xl, semibold)
  - Linha vertical decorativa com ponto azul central
  - Horário de chegada (text-xl, semibold)
  - Labels "Partida" e "Chegada"

- **Informações laterais:**
  - Data da corrida (text-base)
  - Preço (text-xl, bold)

- **Informações do motorista:**
  - Foto/avatar do motorista (ou avatar gerado por iniciais)
  - Nome do motorista (font-medium)
  - Status da corrida com ponto colorido e label

- **Botões de ação (somente se pendente):**
  - Botão de cancelar (X)
  - Botão de editar (lápis, somente para motorista)

---

## ⚙️ Estrutura do Componente (TS)

### 🧩 Propriedades

#### **departureTime: string**
Horário de partida no formato HH:mm (ex: "14:30").

#### **arrivalTime: string**
Horário de chegada no formato HH:mm (ex: "15:15").

#### **date: string**
Data da corrida formatada (ex: "31/12/2025").

#### **price: string**
Preço formatado (ex: "R$ 20,00").

#### **driverName: string**
Nome completo do motorista.

#### **driverPhoto?: string**
URL da foto do motorista (opcional). Se não fornecido, gera avatar com iniciais.

#### **features?: string[]**
Características adicionais da corrida (não utilizado atualmente).

#### **status?: string**
Status da corrida: 'pending', 'completed', 'canceled', 'cancelled'.

#### **role?: 'driver' | 'passenger'**
Papel do usuário na corrida (determina quais botões exibir).

#### **onEdit?: () => void**
Callback chamado ao clicar no botão de editar (somente para motorista).

#### **onCancel?: () => void**
Callback chamado ao clicar no botão de cancelar.

#### **onClick?: () => void**
Callback chamado ao clicar no card inteiro (somente para motorista).

---

### 🧠 Métodos

#### **getDriverPhoto(photo: string | undefined, name: string): string**
Gera URL da foto do motorista. Se não houver foto, cria avatar via UI Avatars API usando iniciais.

**Parâmetros:**
* `photo: string | undefined` → URL da foto
* `name: string` → Nome do motorista

**Retorno:**
* `string` → URL da foto ou avatar gerado

---

#### **getStatusConfig(status?: string): { color: string, dotColor: string, label: string }**
Retorna configuração visual do status (cor e label).

**Parâmetros:**
* `status?: string` → Status da corrida

**Retorno:**
* Objeto com `color` (classe Tailwind), `dotColor` (classe Tailwind), `label` (texto)

**Status suportados:**
* `completed` → Verde, "Concluída"
* `canceled` ou `cancelled` → Vermelho, "Cancelada"
* `pending` → Amarelo, "Pendente"
* Padrão → Cinza, "Pendente"

---

#### **handleCancelClick(event: React.MouseEvent<HTMLButtonElement>): void**
Handler para clique no botão cancelar. Previne propagação para não disparar onClick do card.

**Parâmetros:**
* `event: React.MouseEvent<HTMLButtonElement>` → Evento do clique

**Comportamento:**
* Chama `event.stopPropagation()`
* Chama `onCancel?.()`

---

#### **handleEditClick(event: React.MouseEvent<HTMLButtonElement>): void**
Handler para clique no botão editar. Previne propagação para não disparar onClick do card.

**Parâmetros:**
* `event: React.MouseEvent<HTMLButtonElement>` → Evento do clique

**Comportamento:**
* Chama `event.stopPropagation()`
* Chama `onEdit?.()`

---

## 🎨 Estilização

- **Card clicável:** Adiciona `cursor-pointer hover:shadow-md transition-shadow` se `onClick` fornecido
- **Avatar:** Geração automática via UI Avatars API se foto não disponível
- **Status:** Cores dinâmicas baseadas no status (verde=concluída, vermelho=cancelada, amarelo=pendente)
- **Botões:** Aparecem somente quando status é 'pending'

---

## 🔗 Dependências

- **React 19.1.1**
- **Card, CardContent** - Componentes de card reutilizáveis
- **lucide-react** - Ícones Edit e X
- **types** - Enum RideStatus

---

## 🔗 Links Relacionados

- [Card](./Card.md)
- [RidesList](../pages/RidesList.md)
- [RideStatus](../types/index.md)

