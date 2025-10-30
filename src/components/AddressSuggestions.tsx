import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface AddressSuggestionsProps {
  results: AddressResult[];
  loading: boolean;
  onSelect: (address: AddressResult) => void;
  className?: string;
}

export const AddressSuggestions: React.FC<AddressSuggestionsProps> = ({
  results,
  loading,
  onSelect,
  className = ""
}) => {
  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg mt-1 ${className}`}>
        <div className="flex items-center p-3 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Buscando endereços...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto ${className}`}>
      {results.map((result) => (
        <button
          key={result.place_id}
          onClick={() => onSelect(result)}
          className="w-full flex items-start p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
        >
          <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-900 line-clamp-2">
              {result.display_name}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
