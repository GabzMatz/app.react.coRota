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
    const term = searchQuery.trim();
    if (!term || term.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=5`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro na busca de endereços');
      }

      const data = await response.json();
      const mapped: AddressResult[] = Array.isArray(data?.features)
        ? data.features.map((f: any) => {
            const props = f?.properties || {};
            const nameParts = [
              props.name,
              props.housenumber,
              props.street,
              props.suburb,
              props.city || props.town || props.village,
              props.state,
              props.country
            ].filter(Boolean);
            const display_name = nameParts.join(', ');
            const [lon, lat] = Array.isArray(f?.geometry?.coordinates) ? f.geometry.coordinates : [undefined, undefined];
            return {
              display_name: display_name || props.label || props.name || 'Endereço',
              lat: String(lat ?? ''),
              lon: String(lon ?? ''),
              place_id: Number(props.osm_id || props.extent?.join('') || Date.now())
            } as AddressResult;
          })
        : [];

      setResults(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar endereços';
      setError(message);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddress(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay, searchAddress]);

  return { results, loading, error };
};
