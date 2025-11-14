# useAddressSearch

## 📄 Descrição

Hook customizado React responsável por buscar endereços usando a API Photon (komoot.io). Implementa busca com debounce para otimizar requisições e retorna resultados formatados com coordenadas. Utilizado em componentes de seleção de endereço para autocompletar sugestões de localização.

---

## ⚙️ Funcionalidades

* [x] **Busca de endereços**
  Busca endereços na API Photon baseado em query de texto.

* [x] **Debounce automático**
  Aguarda delay configurável antes de executar busca (evita requisições excessivas).

* [x] **Limite mínimo de caracteres**
  Só executa busca com 3+ caracteres.

* [x] **Estado de loading**
  Indica quando busca está em andamento.

* [x] **Tratamento de erros**
  Captura e expõe erros de requisição.

---

## 🚀 Uso

```tsx
import { useAddressSearch } from './hooks/useAddressSearch';

function AddressSelector() {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useAddressSearch(query, 1000);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite um endereço"
      />
      
      {loading && <p>Buscando...</p>}
      {error && <p>Erro: {error}</p>}
      
      <ul>
        {results.map((result) => (
          <li key={result.place_id}>
            {result.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📚 API

### **useAddressSearch(query: string, delay?: number)**

Descrição: Hook que busca endereços baseado em query de texto com debounce.

**Parâmetros:**
* `query: string` → Texto de busca do endereço
* `delay?: number` → Tempo de debounce em ms (padrão: 1000ms)

**Retorno:**
* `{ results, loading, error }` → Objeto com resultados, estado de loading e erro

**Comportamento:**
* Executa busca automaticamente quando `query` muda
* Aguarda `delay` ms antes de executar (debounce)
* Só busca se query tiver 3+ caracteres
* Limpa resultados se query tiver menos de 3 caracteres

---

## 📝 Interface de Retorno

### **Return Object**

```ts
{
  results: AddressResult[];
  loading: boolean;
  error: string | null;
}
```

### **AddressResult**

```ts
interface AddressResult {
  display_name: string;  // Endereço formatado completo
  lat: string;           // Latitude
  lon: string;           // Longitude
  place_id: number;      // ID único do lugar
}
```

---

## 🔒 Métodos Internos

### **searchAddress(searchQuery: string): Promise<void>**

Método interno que executa a busca na API Photon.

**Comportamento:**
1. Valida query (mínimo 3 caracteres)
2. Define loading como true
3. Faz requisição GET para Photon API
4. Mapeia resultados para formato `AddressResult`
5. Atualiza estado com resultados
6. Trata erros e atualiza estado de erro

---

## ⚙️ Configurações da API

- **Base URL:** `https://photon.komoot.io/api/`
- **Query Parameters:**
  - `q` → Texto de busca (URL encoded)
  - `limit` → 5 resultados máximos
- **Formato:** GeoJSON
- **CORS:** Habilitado (CORS-friendly)

---

## 🔒 Mapeamento de Dados

A API retorna GeoJSON, que é mapeado para `AddressResult`:

- `display_name` → Montado a partir de: name, housenumber, street, suburb, city/town/village, state, country
- `lat` → Extraído de `geometry.coordinates[1]`
- `lon` → Extraído de `geometry.coordinates[0]`
- `place_id` → Extraído de `properties.osm_id` ou gerado a partir de extent ou timestamp

---

## 🔗 Dependências

- **React 19.1.1** - useState, useEffect, useCallback
- **Fetch API** - Requisições HTTP
- **Photon API** - Serviço de geocoding

---

## 🔗 Links Relacionados

- [AddressSuggestions](../components/AddressSuggestions.md)
- [SearchInput](../components/SearchInput.md)
- [CreatePage](../pages/CreatePage.md)

