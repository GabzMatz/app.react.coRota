import { useState, useEffect, useCallback } from 'react';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export const useAddressSearch = (query: string, delay: number = 1000) => {
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddress = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usando Nominatim (OpenStreetMap) para busca de endereços
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Erro na busca de endereços');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Erro ao buscar endereços');
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddress(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay, searchAddress]);

  return { results, loading, error };
};
