import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAddressSearch } from '../hooks/useAddressSearch';
import { AddressSuggestions } from './AddressSuggestions';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (address: AddressResult) => void;
  className?: string;
  showSuggestions?: boolean;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = "Insira o endereço completo", 
  value = "", 
  onChange,
  onAddressSelect,
  className = "",
  showSuggestions = true,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, loading } = useAddressSearch(inputValue, 1000);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleAddressSelect = (address: AddressResult) => {
    setInputValue(address.display_name);
    onChange?.(address.display_name);
    onAddressSelect?.(address);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay para permitir cliques nas sugestões
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className={`flex items-center border border-gray-300 rounded-lg px-4 py-3 ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
        <Search className={`w-5 h-5 mr-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={disabled ? "Endereço da empresa selecionado" : placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`flex-1 outline-none ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 placeholder-gray-400'}`}
        />
      </div>

      {showSuggestions && isFocused && inputValue && (
        <AddressSuggestions
          results={results}
          loading={loading}
          onSelect={handleAddressSelect}
        />
      )}
    </div>
  );
};
